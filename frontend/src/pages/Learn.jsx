import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Calculator, 
  BrainCircuit, 
  Database, 
  Code2, 
  Layers, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Learn() {
  return (
    <div className="learn-page animate-fade-in">
      {/* Hero Header */}
      <div className="learn-hero tt-card glass">
        <div className="hero-badge">
          <BookOpen size={14} className="text-cyan" />
          <span>Documentation & Methodology</span>
        </div>
        <h2>Typing Dynamics & Machine Learning Foundations</h2>
        <p className="text-secondary">
          Understand the mathematical formulas, algorithms, and technology stack powering the TypeTrend platform.
        </p>
      </div>

      <div className="learn-sections-grid">
        {/* Section 1: Typing Math */}
        <div className="tt-card learn-card">
          <div className="card-top-icon icon-cyan">
            <Calculator size={22} />
          </div>
          <h3>1. How WPM & Accuracy are Calculated</h3>
          <p className="learn-intro">
            Typing velocity is standardized worldwide to normalize for word lengths:
          </p>

          <div className="math-pill-box">
            <div className="math-title">Standard Word Convention</div>
            <p>
              In typing tests, <strong>1 standard word = 5 characters</strong> (including spaces and punctuation). This prevents passages with short words (e.g. "it is so") from artificially inflating scores compared to passages with long technical terms (e.g. "asynchronous architecture").
            </p>
          </div>

          <div className="formula-block">
            <div className="formula-label">Net Words Per Minute (WPM)</div>
            <code>WPM = (Correct Characters / 5.0) / (Duration in Minutes)</code>
          </div>

          <div className="formula-block">
            <div className="formula-label">Typing Accuracy (%)</div>
            <code>Accuracy = (Correct Characters / Total Typed Characters) × 100</code>
          </div>
        </div>

        {/* Section 2: Machine Learning */}
        <div className="tt-card learn-card">
          <div className="card-top-icon icon-violet">
            <BrainCircuit size={22} />
          </div>
          <h3>2. How Machine Learning Predicts Velocity</h3>
          <p className="learn-intro">
            TypeTrend implements <strong>Multiple Linear Regression</strong> via Python's <code>scikit-learn</code> library.
          </p>

          <div className="math-pill-box">
            <div className="math-title">Feature Engineering Pipeline</div>
            <ul className="feature-list">
              <li>
                <strong>Session Sequence Index (x₁):</strong> Models progressive motor skill acquisition over time.
              </li>
              <li>
                <strong>3-Session Moving Average (x₂):</strong> Computes local momentum while dampening single-session noise.
              </li>
              <li>
                <strong>Accuracy Ratio (x₃):</strong> Captures precision penalty; higher accuracy minimizes backspacing pauses.
              </li>
              <li>
                <strong>Test Duration (x₄):</strong> Accounts for physical finger fatigue over longer sessions.
              </li>
            </ul>
          </div>

          <div className="formula-block">
            <div className="formula-label">Regression Equation</div>
            <code>ŷ = β₀ + β₁·x₁ + β₂·x₂ + β₃·x₃ + β₄·x₄ + ε</code>
          </div>
        </div>

        {/* Section 3: Why Predictions are Estimates */}
        <div className="tt-card learn-card">
          <div className="card-top-icon icon-warning">
            <AlertTriangle size={22} />
          </div>
          <h3>3. Why Predictions are Estimates</h3>
          <p className="learn-intro">
            Machine learning models calculate the <em>expected trajectory</em> based on observed trends, not an absolute prophecy:
          </p>

          <div className="variance-items">
            <div className="v-item">
              <span className="v-bullet">•</span>
              <div>
                <strong>Physical & Mental State:</strong> Fatigue, cold fingers, stress, and posture cause natural session-to-session velocity variance.
              </div>
            </div>
            <div className="v-item">
              <span className="v-bullet">•</span>
              <div>
                <strong>Text Complexity:</strong> Technical code snippets with symbols (<code>&lbrace;&rbrace;[]=&gt;</code>) naturally result in slower WPM than simple English words.
              </div>
            </div>
            <div className="v-item">
              <span className="v-bullet">•</span>
              <div>
                <strong>Nonlinear Plateaus:</strong> Human skill learning often plateaus before breakthroughs occur, which linear models simplify into steady slope approximations.
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Technology Stack */}
        <div className="tt-card learn-card">
          <div className="card-top-icon icon-success">
            <Layers size={22} />
          </div>
          <h3>4. Full-Stack Architecture</h3>
          <p className="learn-intro">
            TypeTrend is engineered as a decoupled modern full-stack web application:
          </p>

          <div className="stack-grid">
            <div className="stack-col">
              <div className="stack-col-title text-cyan">Frontend (Client)</div>
              <ul className="stack-list">
                <li><strong>React 18:</strong> Component hierarchy & reactive UI</li>
                <li><strong>Vite:</strong> Rapid ES module build tooling</li>
                <li><strong>Chart.js:</strong> Interactive canvas visualizers</li>
                <li><strong>Lucide Icons:</strong> Consistent vector icon system</li>
                <li><strong>Custom CSS3:</strong> Midnight Navy & Electric Cyan theme</li>
              </ul>
            </div>

            <div className="stack-col">
              <div className="stack-col-title text-violet">Backend (Server & ML)</div>
              <ul className="stack-list">
                <li><strong>Python 3.12 & Flask:</strong> Clean RESTful API endpoints</li>
                <li><strong>scikit-learn:</strong> LinearRegression fitting & R² scoring</li>
                <li><strong>pandas & NumPy:</strong> Matrix transformations & rolling averages</li>
                <li><strong>SQLite 3:</strong> Persistent local relational session database</li>
                <li><strong>Flask-CORS:</strong> Cross-origin resource sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .learn-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .learn-hero {
          padding: 2.25rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-cyan);
          background: var(--accent-cyan-subtle);
          border: 1px solid rgba(34, 211, 238, 0.3);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          margin-bottom: 0.75rem;
        }

        .learn-hero h2 {
          font-size: 1.85rem;
          font-weight: 800;
          margin-bottom: 0.4rem;
        }

        .learn-sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .learn-card {
          display: flex;
          flex-direction: column;
          padding: 1.75rem;
        }

        .card-top-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .learn-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .learn-intro {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          line-height: 1.6;
        }

        .math-pill-box {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 1rem;
          margin-bottom: 1rem;
          font-size: 0.82rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .math-title {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .feature-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .feature-list li {
          font-size: 0.8rem;
        }

        .formula-block {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          margin-bottom: 0.75rem;
        }

        .formula-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .formula-block code {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--accent-cyan);
        }

        .variance-items {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .v-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .v-bullet {
          color: var(--color-warning);
          font-size: 1.2rem;
          line-height: 1;
        }

        .stack-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stack-col {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }

        .stack-col-title {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.4rem;
        }

        .stack-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .learn-sections-grid {
            grid-template-columns: 1fr;
          }
          .stack-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
