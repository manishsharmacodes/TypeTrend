import React from 'react';
import { 
  LayoutDashboard, 
  Keyboard, 
  TrendingUp, 
  BarChart3, 
  Target, 
  BookOpen, 
  Sparkles,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'typing-test', label: 'Typing Test', icon: Keyboard, badge: 'Live' },
  { id: 'prediction', label: 'ML Prediction', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics & History', icon: BarChart3 },
  { id: 'goals', label: 'Personalized Goals', icon: Target },
  { id: 'learn', label: 'Learn & About', icon: BookOpen },
];

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  mobileOpen, 
  setMobileOpen,
  hasPrediction 
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <div className="brand-icon">
              <Sparkles size={20} className="text-cyan" />
            </div>
            <div>
              <h1 className="brand-title">Type<span className="text-cyan">Trend</span></h1>
              <p className="brand-subtitle">Pattern Predictor</p>
            </div>
          </div>
          
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN MENU</div>
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      if (mobileOpen) setMobileOpen(false);
                    }}
                    className={`nav-btn ${isActive ? 'active' : ''}`}
                    id={`nav-link-${item.id}`}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {item.id === 'prediction' && hasPrediction && (
                      <span className="nav-dot" title="ML Prediction Ready" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer info box */}
        <div className="sidebar-footer">
          <div className="model-chip">
            <div className="chip-indicator" />
            <div className="chip-text">
              <div className="chip-title">Scikit-Learn ML</div>
              <div className="chip-status">Linear Regression active</div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }

        .sidebar-brand {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--accent-cyan-subtle);
          border: 1px solid rgba(34, 211, 238, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px var(--accent-cyan-glow);
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .brand-subtitle {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .mobile-close-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.4rem;
          border-radius: var(--radius-sm);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }

        .nav-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          padding: 0 0.75rem 0.65rem 0.75rem;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
        }

        .nav-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-light);
        }

        .nav-btn.active {
          color: var(--accent-cyan);
          background: var(--accent-cyan-subtle);
          border-color: rgba(34, 211, 238, 0.3);
          font-weight: 600;
          box-shadow: inset 0 0 12px rgba(34, 211, 238, 0.08);
        }

        .nav-icon {
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .nav-btn:hover .nav-icon {
          transform: translateX(2px);
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          background: var(--accent-cyan);
          color: #0B1020;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .nav-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
        }

        .sidebar-footer {
          padding: 1.25rem 1rem;
          border-top: 1px solid var(--border-color);
        }

        .model-chip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .chip-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
          animation: pulseIndicator 2s infinite;
        }

        @keyframes pulseIndicator {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .chip-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .chip-status {
          font-size: 0.68rem;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }

          .mobile-close-btn {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
