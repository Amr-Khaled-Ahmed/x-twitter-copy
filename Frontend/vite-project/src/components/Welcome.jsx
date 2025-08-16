import Navbar from './Navbar';
import './Welcome.css';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="welcome-page">
      <Navbar user={null} />
      <main className="welcome-hero">
        <div className="welcome-content">
          <h1>Happening now</h1>
          <p className="subtitle">Join today.</p>
          <div className="welcome-actions">
            <Link to="/signup" className="cta primary">Create account</Link>
            <p style={{ color: '#71767b', fontSize: '15px', margin: '16px 0' }}>or</p>
            <Link to="/login" className="cta secondary">Sign in</Link>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="features-container">
          <div className="welcome-content">
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '800',
              color: '#e7e9ea',
              marginBottom: '16px',
              letterSpacing: '-0.5px'
            }}>
              See what's happening
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#71767b',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Join the conversation and connect with people around the globe
            </p>
          </div>

          <div className="features-grid">
            {/* ... rest of your feature cards remain the same ... */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
