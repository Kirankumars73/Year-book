import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection, getDocs, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, setDoc, where, getDoc
} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { HiOutlinePaperAirplane, HiOutlineGlobeAlt, HiOutlineChatAlt, HiOutlineArrowLeft } from 'react-icons/hi';
import './ChatPage.css';

export default function ChatPage() {
  const { classInfo, currentUser, userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const dmUserId = searchParams.get('dm');

  const [chatMode, setChatMode] = useState(dmUserId ? 'private' : 'global');
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [members, setMembers] = useState([]);
  const [privateChats, setPrivateChats] = useState([]);
  const [activeDm, setActiveDm] = useState(dmUserId || null);
  const [activeDmName, setActiveDmName] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load members
  useEffect(() => {
    async function fetchMembers() {
      if (!classInfo?.id) return;
      const snap = await getDocs(collection(db, 'classes', classInfo.id, 'members'));
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchMembers();
  }, [classInfo?.id]);

  // Load DM user name when dmUserId is set
  useEffect(() => {
    async function loadDmUser() {
      if (!dmUserId || !classInfo?.id) return;
      const snap = await getDoc(doc(db, 'classes', classInfo.id, 'members', dmUserId));
      if (snap.exists()) {
        setActiveDmName(snap.data().name);
        setChatMode('private');
        setActiveDm(dmUserId);
      }
    }
    loadDmUser();
  }, [dmUserId, classInfo?.id]);

  // Subscribe to global chat messages
  useEffect(() => {
    if (!classInfo?.id || chatMode !== 'global') return;
    const q = query(
      collection(db, 'classes', classInfo.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [classInfo?.id, chatMode]);

  // Subscribe to DM messages
  useEffect(() => {
    if (!classInfo?.id || chatMode !== 'private' || !activeDm) return;
    const chatId = [currentUser.uid, activeDm].sort().join('_');
    const q = query(
      collection(db, 'classes', classInfo.id, 'privateChats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [classInfo?.id, chatMode, activeDm, currentUser?.uid]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const senderName = userProfile?.name || currentUser.displayName || 'Unknown';
      if (chatMode === 'global') {
        await addDoc(collection(db, 'classes', classInfo.id, 'messages'), {
          senderId: currentUser.uid,
          senderName,
          content: newMsg.trim(),
          type: 'text',
          timestamp: serverTimestamp()
        });
      } else if (activeDm) {
        const chatId = [currentUser.uid, activeDm].sort().join('_');
        // Ensure chat doc exists
        await setDoc(doc(db, 'classes', classInfo.id, 'privateChats', chatId), {
          participants: [currentUser.uid, activeDm],
          updatedAt: serverTimestamp()
        }, { merge: true });
        // Add message
        await addDoc(collection(db, 'classes', classInfo.id, 'privateChats', chatId, 'messages'), {
          senderId: currentUser.uid,
          senderName,
          content: newMsg.trim(),
          type: 'text',
          timestamp: serverTimestamp()
        });
      }
      setNewMsg('');
    } catch (err) {
      console.error('Send failed:', err);
    }
    setSending(false);
  }

  function startDm(member) {
    setActiveDm(member.id);
    setActiveDmName(member.name);
    setMessages([]);
  }

  const otherMembers = members.filter(m => m.id !== currentUser?.uid);

  return (
    <div className="chat-layout">
      <Navbar />
      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar glass-heavy">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${chatMode === 'global' ? 'active' : ''}`}
              onClick={() => { setChatMode('global'); setActiveDm(null); }}
            >
              <HiOutlineGlobeAlt /> Global
            </button>
            <button
              className={`sidebar-tab ${chatMode === 'private' ? 'active' : ''}`}
              onClick={() => setChatMode('private')}
            >
              <HiOutlineChatAlt /> Private
            </button>
          </div>

          {chatMode === 'private' && (
            <div className="dm-list">
              {otherMembers.length === 0 ? (
                <p className="dm-empty">No classmates yet</p>
              ) : (
                otherMembers.map(m => (
                  <div
                    key={m.id}
                    className={`dm-item ${activeDm === m.id ? 'active' : ''}`}
                    onClick={() => startDm(m)}
                  >
                    <div className="dm-avatar">
                      {m.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="dm-info">
                      <span className="dm-name">{m.name}</span>
                      <span className="dm-roll">{m.rollNumber}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {chatMode === 'global' && (
            <div className="global-info">
              <p className="global-label">Common Room</p>
              <p className="global-desc">Chat with the entire batch</p>
              <p className="global-members">{members.length} members</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          <div className="chat-header glass">
            {chatMode === 'global' ? (
              <>
                <HiOutlineGlobeAlt className="chat-header-icon" />
                <div>
                  <h3 className="chat-header-title">Common Room</h3>
                  <p className="chat-header-sub">{classInfo?.name} • {members.length} members</p>
                </div>
              </>
            ) : activeDm ? (
              <>
                <button className="btn btn-icon chat-back-btn" onClick={() => setActiveDm(null)}>
                  <HiOutlineArrowLeft />
                </button>
                <div>
                  <h3 className="chat-header-title">{activeDmName || 'Select a person'}</h3>
                  <p className="chat-header-sub">Private message</p>
                </div>
              </>
            ) : (
              <div>
                <h3 className="chat-header-title">Select a person</h3>
                <p className="chat-header-sub">Choose from the sidebar</p>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>No messages yet. Say hello! 👋</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderId === currentUser?.uid ? 'message-own' : 'message-other'}`}
                >
                  {msg.senderId !== currentUser?.uid && (
                    <span className="message-sender">{msg.senderName}</span>
                  )}
                  <div className="message-bubble glass-card">
                    <p>{msg.content}</p>
                  </div>
                  <span className="message-time">
                    {msg.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {(chatMode === 'global' || activeDm) && (
            <form className="chat-input glass-heavy" onSubmit={handleSend}>
              <input
                className="input-glass"
                type="text"
                placeholder="Type a message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                disabled={sending}
              />
              <button className="btn btn-primary btn-icon send-btn" type="submit" disabled={sending || !newMsg.trim()}>
                <HiOutlinePaperAirplane />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
