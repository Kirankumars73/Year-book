import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import './WallPage.css';

const PASTEL_COLORS = [
  'rgba(212, 168, 67, 0.12)',
  'rgba(139, 92, 246, 0.12)',
  'rgba(232, 98, 124, 0.12)',
  'rgba(20, 184, 166, 0.12)',
  'rgba(59, 130, 246, 0.12)',
  'rgba(245, 158, 11, 0.12)',
  'rgba(168, 85, 247, 0.12)',
];

export default function WallPage() {
  const { classInfo, currentUser, userProfile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      if (!classInfo?.id) return;
      try {
        const q = query(collection(db, 'classes', classInfo.id, 'wall'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load wall notes:', e);
      }
      setLoading(false);
    }
    fetchNotes();
  }, [classInfo?.id]);

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
      const rotation = (Math.random() * 10 - 5).toFixed(1);

      await addDoc(collection(db, 'classes', classInfo.id, 'wall'), {
        content: content.trim(),
        author: isAnonymous ? 'Anonymous' : (userProfile?.name || currentUser.displayName || 'Unknown'),
        authorId: currentUser.uid,
        color,
        rotation: parseFloat(rotation),
        timestamp: serverTimestamp()
      });

      setContent('');
      setShowAdd(false);

      const q = query(collection(db, 'classes', classInfo.id, 'wall'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Post failed:', err);
    }
    setPosting(false);
  }

  return (
    <div className="wall-layout">
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Wall of Reflection</h1>
          <p className="page-subtitle">Leave your mark — a message for the batch</p>
        </div>

        <div className="wall-actions">
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <HiOutlinePencilAlt /> Add a Note
          </button>
        </div>

        {/* Add Note Panel */}
        {showAdd && (
          <div className="wall-add-panel liquid-glass animate-scale-in">
            <form onSubmit={handlePost}>
              <textarea
                className="input-glass wall-textarea"
                placeholder="Write something meaningful..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={280}
                rows={4}
                required
              />
              <div className="wall-add-footer">
                <label className="anon-toggle">
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                  <span className="anon-slider" />
                  <span className="anon-label">Post anonymously</span>
                </label>
                <div className="wall-char-count">{content.length}/280</div>
                <button className="btn btn-primary btn-sm" disabled={posting || !content.trim()}>
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Board */}
        {loading ? (
          <div className="yearbook-loading"><div className="loading-dots"><span /><span /><span /></div></div>
        ) : notes.length === 0 ? (
          <div className="yearbook-empty glass-card">
            <p>The wall is empty. Be the first to leave a note!</p>
          </div>
        ) : (
          <div className="wall-board">
            {notes.map((note, i) => (
              <div
                key={note.id}
                className="wall-note clay-card"
                style={{
                  '--note-bg': note.color || PASTEL_COLORS[i % PASTEL_COLORS.length],
                  '--note-rotation': `${note.rotation || 0}deg`,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <p className="note-content">{note.content}</p>
                <span className="note-author">— {note.author}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
