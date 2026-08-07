import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { signInWithGoogle } from "../supabase.js";

const CATEGORIES = [
  "Electronics",
  "Wallet / ID",
  "Books",
  "Keys",
  "Clothing",
  "Backpack / Bag",
  "Other",
];

export default function PostForm({ onClose, onSubmit, submitting }) {
  const { user } = useAuth();
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactMethod, setContactMethod] = useState(user?.email || "");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Please enter a title");
    if (!description.trim()) return setError("Please enter a description");

    onSubmit({
      type,
      title,
      category,
      description,
      location,
      dateLost,
      contactName: contactName.trim() || user?.name || "Anonymous",
      contactMethod: contactMethod.trim(),
      image,
    });
  }

  // ── Auth guard: show login wall instead of form ─────────
  if (!user.isAuthenticated) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal modal--auth-gate" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
          <div className="auth-gate">
            <div className="auth-gate-icon">🔐</div>
            <h2>Sign in to post</h2>
            <p>You need to be signed in with your Google account to share a lost or found item on campus.</p>
            <button
              type="button"
              className="google-signin-btn"
              onClick={async () => { try { await signInWithGoogle(); } catch {} }}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12c0 1.95.45 3.8 1.26 5.42l4.01-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
            <p className="auth-gate-hint">Your account keeps your posts linked to you and enables private messaging.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>New Post</h2>
            <p className="modal-subtitle">Share a lost or found update with the campus community.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close composer">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-row type-toggle">
            <button
              type="button"
              className={`type-btn lost ${type === "lost" ? "active" : ""}`}
              onClick={() => setType("lost")}
            >
              I Lost Something
            </button>
            <button
              type="button"
              className={`type-btn found ${type === "found" ? "active" : ""}`}
              onClick={() => setType("found")}
            >
              I Found Something
            </button>
          </div>

          <label className="form-field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "lost" ? "e.g. Blue backpack with laptop" : "e.g. Found iPhone near the fountain"
              }
              maxLength="120"
            />
          </label>

          <div className="form-row two-col">
            <label className="form-field">
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>{type === "lost" ? "Date lost" : "Date found"}</span>
              <input
                type="date"
                value={dateLost}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDateLost(e.target.value)}
              />
            </label>
          </div>

          <label className="form-field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              placeholder="Describe the item: brand, color, distinguishing marks, where it was..."
            />
          </label>

          <label className="form-field">
            <span>Location</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Library, 2nd floor"
            />
          </label>

          <div className="form-row two-col">
            <label className="form-field">
              <span>Your name</span>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="How should people find you"
              />
            </label>
            <label className="form-field">
              <span>Contact</span>
              <input
                type="text"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                placeholder="Email / phone"
              />
            </label>
          </div>

          <label className="form-field">
            <span>Photo (optional)</span>
            <input type="file" accept="image/*" onChange={handleFile} />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="image-preview" />
            )}
          </label>

          {error && <p className="form-error">{error}</p>}

          <p className="form-hint">Posts stay visible to everyone on campus until you mark them resolved.</p>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
