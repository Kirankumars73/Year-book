import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineBookOpen, HiOutlinePhotograph, HiOutlineChatAlt2, HiOutlineClipboardList, HiOutlineLogout, HiOutlinePencilAlt, HiOutlineKey } from 'react-icons/hi';
import './Navbar.css';

export default function Navbar() {
  const { classInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function handleCopyCode() {
    if (classInfo?.secretCode) {
      navigator.clipboard.writeText(classInfo.secretCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <nav className="navbar glass-heavy">
      <div className="navbar-brand" onClick={() => navigate('/yearbook')}>
        <span className="navbar-logo">◈</span>
        <span className="navbar-title">{classInfo?.name || 'Yearbook'}</span>
      </div>

      {classInfo?.secretCode && (
        <button className="class-code-badge" onClick={handleCopyCode} title="Click to copy class code">
          <HiOutlineKey />
          <span className="class-code-text">{copied ? 'Copied!' : classInfo.secretCode}</span>
        </button>
      )}

      <div className="navbar-links">
        <NavLink to="/yearbook" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <HiOutlineBookOpen />
          <span>Yearbook</span>
        </NavLink>
        <NavLink to="/gallery" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <HiOutlinePhotograph />
          <span>Gallery</span>
        </NavLink>
        <NavLink to="/wall" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <HiOutlineClipboardList />
          <span>Wall</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <HiOutlineChatAlt2 />
          <span>Chat</span>
        </NavLink>
      </div>

      <button className="btn btn-glass btn-sm btn-icon nav-edit" onClick={() => navigate('/edit-profile')} title="Edit Profile">
        <HiOutlinePencilAlt />
      </button>
      <button className="btn btn-glass btn-sm nav-logout" onClick={handleLogout}>
        <HiOutlineLogout />
        <span>Logout</span>
      </button>
    </nav>
  );
}
