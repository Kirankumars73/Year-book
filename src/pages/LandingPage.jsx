import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Floating orbs background */}
      <div className="landing-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* Grid pattern overlay */}
      <div className="landing-grid" />

      <div className="landing-content animate-fade-in-up">
        <div className="landing-badge glass">
          <span>✦</span> Class of 2022–26
        </div>

        <h1 className="landing-title">
          <span className="title-line">A Journey</span>
          <span className="title-line title-accent">We'll Always</span>
          <span className="title-line">Carry</span>
        </h1>

        <p className="landing-description">
          Your digital yearbook — where every memory lives on.
          Reconnect, reminisce, and relive the moments that made us.
        </p>

        <div className="landing-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/join')}>
            Start the Journey
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="landing-stats glass">
          <div className="stat">
            <span className="stat-value">∞</span>
            <span className="stat-label">Memories</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">4</span>
            <span className="stat-label">Years</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">1</span>
            <span className="stat-label">Family</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="landing-decoration">
        <div className="deco-ring deco-ring-1" />
        <div className="deco-ring deco-ring-2" />
      </div>
    </div>
  );
}
