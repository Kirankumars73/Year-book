import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';
import { HiOutlineUpload, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';
import './GalleryPage.css';

export default function GalleryPage() {
  const { classInfo, currentUser } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadYear, setUploadYear] = useState('1st Year');
  const [uploadCategory, setUploadCategory] = useState('General');
  const fileInputRef = useRef();

  const years = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
  const categories = ['All', 'General', 'Fests', 'Classroom', 'Trips', 'Sports', 'Cultural'];

  useEffect(() => {
    async function fetchMemories() {
      if (!classInfo?.id) return;
      try {
        const q = query(collection(db, 'classes', classInfo.id, 'memories'), orderBy('uploadedAt', 'desc'));
        const snap = await getDocs(q);
        setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Failed to load memories:', e);
      }
      setLoading(false);
    }
    fetchMemories();
  }, [classInfo?.id]);

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !classInfo?.id) return;

    setUploading(true);
    setUploadError('');
    try {
      const storageRef = ref(storage, `classes/${classInfo.id}/memories/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'classes', classInfo.id, 'memories'), {
        imageUrl: url,
        caption: uploadCaption,
        year: uploadYear,
        category: uploadCategory,
        uploadedBy: currentUser.uid,
        uploadedAt: serverTimestamp()
      });

      setShowUpload(false);
      setUploadCaption('');
      setUploadError('');
      // Refresh
      const q = query(collection(db, 'classes', classInfo.id, 'memories'), orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    }
    setUploading(false);
  }

  const filtered = memories.filter(m => {
    const matchYear = filterYear === 'All' || m.year === filterYear;
    const matchCat = filterCategory === 'All' || m.category === filterCategory;
    return matchYear && matchCat;
  });

  return (
    <div className="gallery-layout">
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">The Media Vault</h1>
          <p className="page-subtitle">Every moment, preserved forever</p>
        </div>

        {/* Filters & Upload */}
        <div className="gallery-controls">
          <div className="gallery-filters glass">
            <div className="filter-group">
              {years.map(y => (
                <button key={y} className={`filter-chip ${filterYear === y ? 'active' : ''}`} onClick={() => setFilterYear(y)}>{y}</button>
              ))}
            </div>
            <div className="filter-group">
              {categories.map(c => (
                <button key={c} className={`filter-chip ${filterCategory === c ? 'active' : ''}`} onClick={() => setFilterCategory(c)}>{c}</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
            <HiOutlineUpload /> Upload Memory
          </button>
        </div>

        {/* Upload Panel */}
        {showUpload && (
          <div className="upload-panel liquid-glass animate-scale-in">
            <form onSubmit={handleUpload}>
              <div className="upload-dropzone clay-inset" onClick={() => fileInputRef.current?.click()}>
                <HiOutlinePhotograph className="upload-icon" />
                <p>Click to select a photo</p>
                <input type="file" ref={fileInputRef} accept="image/*" hidden />
              </div>
              <div className="upload-fields">
                <input className="input-glass" type="text" placeholder="Add a caption..." value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} />
                <div className="form-row">
                  <select className="input-glass" value={uploadYear} onChange={(e) => setUploadYear(e.target.value)}>
                    {years.slice(1).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select className="input-glass" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                    {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {uploadError && <p className="form-error" style={{ marginBottom: '0.75rem' }}>{uploadError}</p>}
                <button className="btn btn-primary btn-full" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="yearbook-loading"><div className="loading-dots"><span /><span /><span /></div></div>
        ) : filtered.length === 0 ? (
          <div className="yearbook-empty glass-card">
            <p>No memories yet. Upload the first one!</p>
          </div>
        ) : (
          <div className="gallery-masonry stagger-children">
            {filtered.map((mem, i) => (
              <div
                key={mem.id}
                className="gallery-item glass-card"
                onClick={() => setLightbox(mem)}
                style={{ '--delay': `${i * 0.05}s` }}
              >
                <div className="gallery-img-wrapper">
                  <img src={mem.imageUrl} alt={mem.caption || 'Memory'} loading="lazy" />
                </div>
                {mem.caption && <p className="gallery-caption">{mem.caption}</p>}
                <div className="gallery-meta">
                  <span>{mem.year}</span>
                  <span className="gallery-dot">·</span>
                  <span>{mem.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div className="lightbox-overlay animate-fade-in" onClick={() => setLightbox(null)}>
            <div className="lightbox-content liquid-glass animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close btn btn-glass btn-icon" onClick={() => setLightbox(null)}>
                <HiOutlineX />
              </button>
              <img src={lightbox.imageUrl} alt={lightbox.caption || 'Memory'} className="lightbox-img" />
              <div className="lightbox-info">
                {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
                <div className="gallery-meta">
                  <span>{lightbox.year}</span>
                  <span className="gallery-dot">·</span>
                  <span>{lightbox.category}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
