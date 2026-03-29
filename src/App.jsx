import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import JoinClassPage from './pages/JoinClassPage';
import YearbookPage from './pages/YearbookPage';
import ProfilePage from './pages/ProfilePage';
import GalleryPage from './pages/GalleryPage';
import WallPage from './pages/WallPage';
import ChatPage from './pages/ChatPage';
import EditProfilePage from './pages/EditProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<JoinClassPage />} />
          <Route path="/yearbook" element={
            <ProtectedRoute><YearbookPage /></ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/gallery" element={
            <ProtectedRoute><GalleryPage /></ProtectedRoute>
          } />
          <Route path="/wall" element={
            <ProtectedRoute><WallPage /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute><EditProfilePage /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
