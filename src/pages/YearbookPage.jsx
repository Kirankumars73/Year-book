import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { HiOutlineSearch } from 'react-icons/hi';
import './YearbookPage.css';

export default function YearbookPage() {
  const { classInfo } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMembers() {
      if (!classInfo?.id) return;
      try {
        const snap = await getDocs(collection(db, 'classes', classInfo.id, 'members'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(data);
      } catch (e) {
        console.error('Failed to load members:', e);
      }
      setLoading(false);
    }
    fetchMembers();
  }, [classInfo?.id]);

  const branches = ['All', ...new Set(members.map(m => m.branch).filter(Boolean))];

  const filtered = members.filter(m => {
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchBranch = filterBranch === 'All' || m.branch === filterBranch;
    return matchSearch && matchBranch;
  });

  return (
    <div className="yearbook-layout">
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">The Yearbook</h1>
          <p className="page-subtitle">Meet the class — every face, every story</p>
        </div>

        {/* Filters */}
        <div className="yearbook-filters glass">
          <div className="search-box clay-inset">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="branch-filters">
            {branches.map(b => (
              <button
                key={b}
                className={`filter-chip ${filterBranch === b ? 'active' : ''}`}
                onClick={() => setFilterBranch(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Student Grid */}
        {loading ? (
          <div className="yearbook-loading">
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="yearbook-empty glass-card">
            <p>No students found. {members.length === 0 ? 'Be the first to join!' : 'Try a different search.'}</p>
          </div>
        ) : (
          <div className="yearbook-grid stagger-children">
            {filtered.map((member) => (
              <div
                key={member.id}
                className="student-card"
                onClick={() => navigate(`/profile/${member.id}`)}
              >
                <div className="student-photo-wrapper">
                  {member.profilePicUrl ? (
                    <img src={member.profilePicUrl} alt={member.name} className="student-photo" />
                  ) : (
                    <div className="student-photo-placeholder">
                      {member.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="student-overlay">
                    <h3 className="student-name">{member.name}</h3>
                    <p className="student-roll">{member.rollNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
