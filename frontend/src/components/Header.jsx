import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Database, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  setMobileOpen,
  isHealthy,
  includeDemo,
  setIncludeDemo,
  onSeedDemo
}) {
  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of typing velocity, trends, and ML projections' },
    'typing-test': { title: 'Typing Test', subtitle: 'Real-time passage test with keystroke analysis' },
    prediction: { title: 'Machine Learning Prediction', subtitle: 'Linear Regression forecast & performance trajectory' },
    analytics: { title: 'Analytics & History', subtitle: 'Historical breakdown, speed curves, and exportable records' },
    goals: { title: 'Personalized Goals', subtitle: 'Set target WPM, accuracy thresholds, and daily practice' },
    learn: { title: 'Learn & About', subtitle: 'Methodology, algorithms, and technical architecture' }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="header-title">{current.title}</h2>
          <p className="header-subtitle">{current.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Backend Connectivity Status */}
        <div className={`status-pill ${isHealthy ? 'online' : 'offline'}`} title="Backend API Health">
          {isHealthy ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{isHealthy ? 'Flask API Online' : 'Connecting...'}</span>
        </div>

        {/* Demo Mode Toggle */}
        <label className="demo-toggle" title="Include demo practice records for ML demonstration">
          <input 
            type="checkbox" 
            checked={includeDemo} 
            onChange={(e) => setIncludeDemo(e.target.checked)} 
          />
          <span className="demo-toggle-label">
            <Sparkles size={14} className={includeDemo ? 'text-cyan' : 'text-secondary'} />
            <span className="demo-text">Demo Mode</span>
          </span>
        </label>

        {/* Quick Start Typing Test CTA (if not already on test page) */}
        {activeTab !== 'typing-test' && (
          <button 
            className="tt-btn tt-btn-primary tt-btn-sm header-cta"
            onClick={() => setActiveTab('typing-test')}
          >
            <Play size={14} fill="currentColor" />
            <span>Start Test</span>
          </button>
        )}

        {/* Theme Toggle (Dark / Light) */}
        <button 
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-warning" />
          ) : (
            <Moon size={18} className="text-violet" />
          )}
        </button>
      </div>

      <style>{`
        .app-header {
          height: var(--header-height);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .hamburger-btn {
          display: none;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .header-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        .status-pill.online {
          background: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(52, 211, 153, 0.3);
        }

        .status-pill.offline {
          background: var(--color-warning-bg);
          color: var(--color-warning);
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .demo-toggle {
          display: flex;
          align-items: center;
          cursor: pointer;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-md);
          user-select: none;
          transition: all 0.2s ease;
        }

        .demo-toggle:hover {
          border-color: var(--accent-cyan);
        }

        .demo-toggle input {
          margin-right: 0.4rem;
          accent-color: var(--accent-cyan);
          cursor: pointer;
        }

        .demo-toggle-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .demo-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .theme-toggle-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          border-color: var(--accent-cyan);
          transform: rotate(15deg);
        }

        @media (max-width: 900px) {
          .hamburger-btn {
            display: flex;
          }
          .app-header {
            padding: 0 1rem;
          }
          .header-subtitle {
            display: none;
          }
          .status-pill span {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .demo-text {
            display: none;
          }
          .header-cta span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
