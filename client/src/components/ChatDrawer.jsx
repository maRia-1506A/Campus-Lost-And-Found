import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getOrCreateConversation,
    fetchMessages,
    sendMessage,
    markMessagesRead,
} from "../api.js";
import { supabase } from "../supabase.js";

function timeLabel(dateStr) {
    const d = new Date(dateStr);
    const diff = Date.now() - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatDrawer({ post, onClose }) {
    const { user } = useAuth();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const loadConversation = useCallback(async () => {
        if (!user.isAuthenticated) { setError("Please sign in to send messages."); setLoading(false); return; }
        if (!post.authorId) { setError("This post has no registered owner to message."); setLoading(false); return; }
        if (user.id === post.authorId) { setError("You cannot message yourself."); setLoading(false); return; }
        try {
            setLoading(true);
            const conv = await getOrCreateConversation(post.id, user.id, post.authorId);
            setConversation(conv);
            const msgs = await fetchMessages(conv.id);
            setMessages(msgs);
            const isA = conv.participant_a === user.id;
            await markMessagesRead(conv.id, user.id, isA);
        } catch (err) {
            setError(err.message || "Failed to load conversation.");
        } finally {
            setLoading(false);
        }
    }, [post.id, post.authorId, user.id, user.isAuthenticated]);

    useEffect(() => { loadConversation(); }, [loadConversation]);
    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    useEffect(() => {
        if (!conversation || !supabase) return;
        const channel = supabase
            .channel(`messages:${conversation.id}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
                (payload) => {
                    setMessages((prev) => prev.find((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]);
                    if (payload.new.sender_id !== user.id) {
                        markMessagesRead(conversation.id, user.id, conversation.participant_a === user.id);
                    }
                })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [conversation, user.id]);

    useEffect(() => { if (!loading) setTimeout(() => inputRef.current?.focus(), 100); }, [loading]);

    async function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || !conversation || sending) return;
        setSending(true);
        const msgText = text.trim();
        setText("");
        try {
            await sendMessage(conversation.id, user.id, user.name, user.avatar || "", msgText);
        } catch {
            setError("Failed to send message.");
            setText(msgText);
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(e) { if (e.key === "Enter" && !e.shiftKey) handleSend(e); }

    const otherName = post.authorName || "Post Owner";

    return (
        <>
            <div className="chat-overlay" onClick={onClose} aria-hidden="true" />
            <aside className="chat-drawer" role="dialog" aria-label="Chat" aria-modal="true">
                <div className="chat-drawer-header">
                    <div className="chat-drawer-header-info">
                        <div className="chat-drawer-title">💬 {otherName}</div>
                        <div className="chat-drawer-subtitle">
                            <span className={`type-badge type-badge--${post.type}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                                {post.type === "lost" ? "🔴 LOST" : "🟢 FOUND"}
                            </span>
                            <span>{post.title}</span>
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={onClose} aria-label="Close chat" type="button">✕</button>
                </div>
                <div className="chat-notice">
                    🔒 Private conversation — only you and the other party can see this. Share proof of ownership to verify your claim.
                </div>
                <div className="chat-messages">
                    {loading && <div className="chat-loading"><div className="chat-loading-spinner" /><span>Loading conversation…</span></div>}
                    {!loading && error && <div className="chat-error-state">⚠️ {error}</div>}
                    {!loading && !error && messages.length === 0 && (
                        <div className="chat-empty-state">
                            <div className="chat-empty-icon">💌</div>
                            <p>No messages yet.</p>
                            <p className="chat-empty-hint">Introduce yourself and describe how you can prove ownership of the item.</p>
                        </div>
                    )}
                    {!loading && !error && messages.map((msg, i) => {
                        const isMine = msg.sender_id === user.id;
                        const showSender = !messages[i - 1] || messages[i - 1].sender_id !== msg.sender_id;
                        return (
                            <div key={msg.id} className={`chat-message-row ${isMine ? "chat-message-row--mine" : "chat-message-row--theirs"}`}>
                                {!isMine && showSender && (
                                    <div className="chat-sender-avatar">
                                        {msg.sender_avatar
                                            ? <img src={msg.sender_avatar} alt={msg.sender_name} referrerPolicy="no-referrer" />
                                            : <div className="chat-avatar-placeholder">{(msg.sender_name || "?").substring(0, 2).toUpperCase()}</div>}
                                    </div>
                                )}
                                {!isMine && !showSender && <div className="chat-avatar-spacer" />}
                                <div className="chat-bubble-group">
                                    {showSender && <span className={`chat-sender-name ${isMine ? "chat-sender-name--mine" : ""}`}>{isMine ? "You" : msg.sender_name}</span>}
                                    <div className={`chat-bubble ${isMine ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>{msg.text}</div>
                                    <span className="chat-time">{timeLabel(msg.created_at)}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                {!loading && !error && (
                    <form className="chat-input-row" onSubmit={handleSend}>
                        <textarea ref={inputRef} className="chat-input" placeholder="Type your message… (Enter to send)" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} rows={1} maxLength={2000} disabled={sending} aria-label="Message input" />
                        <button type="submit" className="chat-send-btn" disabled={!text.trim() || sending} aria-label="Send message">
                            {sending ? <span className="chat-sending-dot" /> : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            )}
                        </button>
                    </form>
                )}
            </aside>
        </>
    );
}
