import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { HiOutlineCamera } from 'react-icons/hi';
import './JoinClassPage.css';

export default function JoinClassPage() {
  const [mode, setMode] = useState('join');
  const [authMode, setAuthMode] = useState('login');
  const [secretCode, setSecretCode] = useState('');
  const [className, setClassName] = useState('');
  const [batch, setBatch] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [bio, setBio] = useState('');
  const [quote, setQuote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingClassId, setPendingClassId] = useState('');
  const [pendingClassName, setPendingClassName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef();

  const { currentUser, signup, login, logout, createClass, joinClass, saveProfile, loadUserProfile, loadClassInfo } = useAuth();
  const navigate = useNavigate();

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      try {
        const cred = await login(email, password);
        user = cred.user;
      } catch (err) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          if (!name) {
            throw new Error('Please enter your Full Name to create a new account.');
          }
          try {
            user = await signup(email, password, name);
          } catch (signupErr) {
            if (signupErr.code === 'auth/email-already-in-use') {
              throw new Error('Incorrect password for this account.');
            }
            throw signupErr;
          }
        } else {
          throw err;
        }
      }

      if (pendingClassId) {
        const profile = await loadUserProfile(pendingClassId, user.uid);
        if (profile) {
          localStorage.setItem('yb_classId', pendingClassId);
          await loadClassInfo(pendingClassId);
          navigate('/yearbook');
          return;
        }
        setMode('profile');
      } else {
        setMode('join');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const classData = await joinClass(secretCode);
      setPendingClassId(classData.id);
      setPendingClassName(classData.name);
      
      if (currentUser) {
        await logout();
      }
      setMode('auth');
    } catch (err) {
      setError('Invalid class code. Please check and try again.');
    }
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!currentUser) {
      setPendingClassName(className);
      setMode('auth');
      return;
    }
    setLoading(true);
    try {
      const result = await createClass(className, batch);
      setGeneratedCode(result.code);
      setPendingClassId(result.id);
      setPendingClassName(className);
      setMode('profile');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setError('');
    if (!photoFile) {
      setError('Please upload a profile photo — it\'s required!');
      return;
    }
    setLoading(true);
    try {
      let profilePicUrl = '';

      // Upload photo if selected
      if (photoFile && currentUser) {
        const storageRef = ref(storage, `profiles/${currentUser.uid}/${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        profilePicUrl = await getDownloadURL(storageRef);
      }

      const profileData = {
        name: name || currentUser.displayName,
        rollNumber,
        branch,
        bio,
        quote,
        ...(profilePicUrl && { profilePicUrl })
      };

      if (!pendingClassId && className && !generatedCode) {
        const result = await createClass(className, batch);
        setGeneratedCode(result.code);
        setPendingClassId(result.id);
        await saveProfile(result.id, profileData);
      } else {
        await saveProfile(pendingClassId, profileData);
      }
      navigate('/yearbook');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="join-page">
      <div className="join-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="join-container animate-fade-in-up">
        {generatedCode && (
          <div className="generated-code-alert glass">
            <p className="code-alert-label">Your Class Secret Code</p>
            <p className="code-value">{generatedCode}</p>
            <p className="code-hint">Share this code with your classmates so they can join!</p>
          </div>
        )}

        {mode === 'join' && (
          <div className="join-card liquid-glass">
            <h2 className="join-title">Enter Your Class</h2>
            <p className="join-subtitle">Join an existing class or create a new one</p>
            <div className="join-tabs">
              <button className="join-tab active" onClick={() => {}}>Join Class</button>
              <button className="join-tab" onClick={() => setMode('create')}>Create Class</button>
            </div>
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="input-label">Secret Code</label>
                <input className="input-glass" type="text" placeholder="Enter your class code (e.g. ABC123)" value={secretCode} onChange={(e) => setSecretCode(e.target.value.toUpperCase())} required maxLength={8} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Joining...' : 'Join Class'}</button>
            </form>
          </div>
        )}

        {mode === 'create' && (
          <div className="join-card liquid-glass">
            <h2 className="join-title">Create Your Class</h2>
            <p className="join-subtitle">Start a new yearbook for your batch</p>
            <div className="join-tabs">
              <button className="join-tab" onClick={() => setMode('join')}>Join Class</button>
              <button className="join-tab active" onClick={() => {}}>Create Class</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="input-label">Class Name</label>
                <input className="input-glass" type="text" placeholder="e.g. CS 2026 Batch" value={className} onChange={(e) => setClassName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="input-label">Batch Years</label>
                <input className="input-glass" type="text" placeholder="e.g. 2022–2026" value={batch} onChange={(e) => setBatch(e.target.value)} required />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Creating...' : 'Create Class'}</button>
            </form>
          </div>
        )}

        {mode === 'auth' && (
          <div className="join-card liquid-glass">
            <h2 className="join-title">Authentication</h2>
            <p className="join-subtitle">Sign in or create an account</p>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label className="input-label">Full Name</label>
                <input className="input-glass" type="text" placeholder="Your name (required for new accounts)" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="input-label">Email</label>
                <input className="input-glass" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="input-label">Password</label>
                <input className="input-glass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Please wait...' : 'Continue ->'}</button>
            </form>
          </div>
        )}

        {mode === 'profile' && (
          <div className="join-card liquid-glass">
            <h2 className="join-title">Your Profile</h2>
            <p className="join-subtitle">Tell your classmates about yourself</p>

            <form onSubmit={handleSaveProfile}>
              {/* Profile Photo Upload */}
              <div className="form-group photo-upload-group">
                <div className="photo-upload-circle" onClick={() => fileInputRef.current?.click()}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="photo-upload-placeholder">
                      <HiOutlineCamera className="photo-upload-icon" />
                      <span>Add Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handlePhotoSelect} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Roll Number</label>
                  <input className="input-glass" type="text" placeholder="e.g. 22CS101" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="input-label">Branch / Department</label>
                  <input className="input-glass" type="text" placeholder="e.g. CSE" value={branch} onChange={(e) => setBranch(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Bio</label>
                <textarea className="input-glass" placeholder="A short bio about you..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>
              <div className="form-group">
                <label className="input-label">Legacy Quote</label>
                <input className="input-glass" type="text" placeholder="Your farewell line..." value={quote} onChange={(e) => setQuote(e.target.value)} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Saving...' : 'Enter the Yearbook →'}</button>
            </form>
          </div>
        )}

        <button className="back-link" onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    </div>
  );
}
