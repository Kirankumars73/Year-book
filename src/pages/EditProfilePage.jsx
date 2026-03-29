import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';
import { HiOutlineCamera, HiOutlineArrowLeft, HiOutlineCheck } from 'react-icons/hi';
import './EditProfilePage.css';

export default function EditProfilePage() {
  const { classInfo, currentUser, userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(userProfile?.name || '');
  const [rollNumber, setRollNumber] = useState(userProfile?.rollNumber || '');
  const [branch, setBranch] = useState(userProfile?.branch || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [quote, setQuote] = useState(userProfile?.quote || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(userProfile?.profilePicUrl || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      let profilePicUrl = userProfile?.profilePicUrl || '';

      if (photoFile && currentUser) {
        const storageRef = ref(storage, `profiles/${currentUser.uid}/${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        profilePicUrl = await getDownloadURL(storageRef);
      }

      const updated = {
        name,
        rollNumber,
        branch,
        bio,
        quote,
        profilePicUrl
      };

      await updateDoc(doc(db, 'classes', classInfo.id, 'members', currentUser.uid), updated);
      setUserProfile(prev => ({ ...prev, ...updated }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="edit-layout">
      <Navbar />
      <div className="page-container">
        <button className="btn btn-glass btn-sm" onClick={() => navigate('/yearbook')}>
          <HiOutlineArrowLeft /> Back
        </button>

        <div className="edit-card liquid-glass animate-fade-in-up">
          <h2 className="edit-title">Edit Profile</h2>
          <p className="edit-subtitle">Update your yearbook details</p>

          <form onSubmit={handleSave}>
            <div className="form-group photo-upload-group">
              <div className="photo-upload-circle edit-photo" onClick={() => fileInputRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="photo-preview" />
                ) : (
                  <div className="photo-upload-placeholder">
                    <HiOutlineCamera className="photo-upload-icon" />
                    <span>Change Photo</span>
                  </div>
                )}
                <div className="photo-edit-badge">
                  <HiOutlineCamera />
                </div>
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handlePhotoSelect} />
            </div>

            <div className="form-group">
              <label className="input-label">Name</label>
              <input className="input-glass" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="input-label">Roll Number</label>
                <input className="input-glass" type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="input-label">Branch</label>
                <input className="input-glass" type="text" value={branch} onChange={(e) => setBranch(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="input-label">Bio</label>
              <textarea className="input-glass" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <div className="form-group">
              <label className="input-label">Legacy Quote</label>
              <input className="input-glass" type="text" value={quote} onChange={(e) => setQuote(e.target.value)} />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success"><HiOutlineCheck /> Profile updated!</p>}

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
