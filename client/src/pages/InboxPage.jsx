import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMyConversations } from "../api.js";
import ChatDrawer from "../components/ChatDrawer.jsx";

function timeLabel(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const diff = Date.now() - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeConv, setActiveConv] = useState(null);

    async function load() {
        if (!user.isAuthenticated) { setLoading(false); return; }
        setLoading(true);
        try {
            const data = await fetchMyConversations(user.id);
            setConversations(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [user.id, user.isAuthenticated]);

    if (!user.isAuthenticated) {
        return (
            <div className="inbox-page">
                <div className="inbox-empty-auth">
                    <div className="inbox-empty-icon">🔐</div>
                    <h2>Sign in to view messages</h2>
                    <p>You need to be signed in with Google to send and receive private messages.</p>
                </div>
            </div>
        );
    }

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
        <div className="inbox-page">
            <div className="inbox-header">
                <h1 className="inbox-title">
                    📬 Messages
                    {totalUnread > 0 && <span className="inbox-unread-badge">{totalUnread}</span>}
                </h1>
                <p className="inbox-subtitle">Private conversations about lost &amp; found items</p>
            </div>
            {loading && <div className="inbox-loading"><div className="chat-loading-spinner" /><span>Loading conversations…</span></div>}
            {!loading && conversations.length === 0 && (
                <div className="inbox-empty">
                    <div className="inbox-empty-icon">💌</div>
                    <h3>No conversations yet</h3>
                    <p>When you message someone about a lost or found item, it will appear here.</p>
                    <Link to="/" className="btn btn-primary">Browse posts</Link>
                </div>
            )}
            {!loading && conversations.length > 0 && (
                <ul className="inbox-list">
                    {conversations.map((conv) => {
                        const lastMsg = conv.lastMessage;
                        const hasUnread = conv.unreadCount > 0;
                        return (
                            <li key={conv.id} className={`inbox-item ${hasUnread ? "inbox-item--unread" : ""}`}
                                onClick={() => setActiveConv(conv)} role="button" tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && setActiveConv(conv)}>
                                <div className="inbox-item-icon">
                                    <span className={`type-badge type-badge--${conv.postType}`} style={{ fontSize: "12px" }}>
                                        {conv.postType === "lost" ? "🔴" : "🟢"}
                                    </span>
                                </div>
                                <div className="inbox-item-body">
                                    <div className="inbox-item-top">
                                        <span className="inbox-item-post-title">{conv.postTitle}</span>
                                        <span className="inbox-item-time">{timeLabel(lastMsg?.created_at)}</span>
                                    </div>
                                    <div className="inbox-item-preview">
                                        {lastMsg ? (
                                            <span className={hasUnread ? "inbox-item-preview--bold" : ""}>
                                                {lastMsg.sender_id === user.id ? "You: " : ""}{lastMsg.text.slice(0, 80)}{lastMsg.text.length > 80 ? "…" : ""}
                                            </span>
                                        ) : <span className="inbox-item-no-msg">No messages yet — start the conversation</span>}
                                        {hasUnread && <span className="inbox-item-unread-dot">{conv.unreadCount}</span>}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            {activeConv && (
                <ChatDrawer
                    post={{ id: activeConv.post_id, title: activeConv.postTitle, type: activeConv.postType, authorId: activeConv.participant_b, authorName: activeConv.isParticipantA ? "Post Owner" : "Claimant" }}
                    onClose={() => { setActiveConv(null); load(); }}
                />
            )}
        </div>
    );
}
