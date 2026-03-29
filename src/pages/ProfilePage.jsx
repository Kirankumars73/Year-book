import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { HiOutlineChat, HiOutlineArrowLeft } from 'react-icons/hi';
import './ProfilePage.css';

export default function ProfilePage() {
  const { userId } = useParams();
  const { classInfo, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!classInfo?.id || !userId) return;
      try {
        const snap = await getDoc(doc(db, 'classes', classInfo.id, 'members', userId));
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [classInfo?.id, userId]);

  if (loading) {
    return (
      <div className="profile-layout">
        <Navbar />
        <div className="page-container">
          <div className="yearbook-loading"><div className="loading-dots"><span /><span /><span /></div></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-layout">
        <Navbar />
        <div className="page-container">
          <div className="yearbook-empty glass-card"><p>Profile not found</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <Navbar />
      <div className="page-container">
        <button className="btn btn-glass btn-sm profile-back" onClick={() => navigate('/yearbook')}>
          <HiOutlineArrowLeft /> Back
        </button>

        <div className="profile-card liquid-glass animate-fade-in-up">
          <div className="profile-header">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-ring" />
              <div className="profile-avatar">
                {profile.profilePicUrl ? (
                  <img src={profile.profilePicUrl} alt={profile.name} />
                ) : (
                  <div className="avatar-placeholder large">
                    {profile.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </div>

            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-roll">{profile.rollNumber}</p>
            <span className="student-branch">{profile.branch}</span>
          </div>

          {profile.quote && (
            <div className="profile-quote clay-card">
              <span className="quote-mark">"</span>
              <p>{profile.quote}</p>
            </div>
          )}

          {profile.bio && (
            <div className="profile-bio">
              <h3 className="profile-section-title">About</h3>
              <p>{profile.bio}</p>
            </div>
          )}

          {userId !== currentUser?.uid && (
            <button
              className="btn btn-primary profile-msg-btn"
              onClick={() => navigate(`/chat?dm=${userId}`)}
            >
              <HiOutlineChat /> Send Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
