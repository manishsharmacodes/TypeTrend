import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Keyboard, 
  Layers, 
  Info,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Prediction({ 
  setActiveTab, 
  includeDemo, 
  setIncludeDemo,
  onSeedDemo 
}) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadPrediction = async () => {
    try {
      setLoading(true);
      const res = await api.getPrediction(includeDemo);
      setPrediction(res);
    } catch (err) {
      showToast('Failed to load ML prediction: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, [includeDemo]);

  const isML = prediction?.is_ml_prediction;
  const chartPoints = prediction?.chart_points || [];

  // Chart configuration: Actual points vs Fitted Regression Line
  const regressionChartData = {
    labels: chartPoints.map((p) => 
      p.is_projection ? `Proj #${p.session_number}` : `#${p.session_number}`
    ),
    datasets: [
      {
        type: 'line',
        label: 'Actual Speed (WPM)',
        data: chartPoints.map((p) => p.actual_wpm),
        borderColor: '#22D3EE',
        backgroundColor: '#22D3EE',
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: true,
        tension: 0.2,
      },
      {
        type: 'line',
        label: 'Linear Regression Trend',
        data: chartPoints.map((p) => p.fitted_trend_wpm),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderDash: [6, 4],
        pointRadius: (ctx) => {
          const index = ctx.dataIndex;
          return chartPoints[index]?.is_projection ? 8 : 0;
        },
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        tension: 0,
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 12 },
          boxWidth: 14,
        },
      },
      tooltip: {
        backgroundColor: '#151F35',
        titleColor: '#F1F5F9',
        bodyColor: '#94A3B8',
        borderColor: '#293650',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8' },
        title: {
          display: true,
          text: 'Words Per Minute (WPM)',
          color: '#64748B',
          font: { size: 11 }
        }
      },
    },
  };

  return (
    <div className="prediction-page animate-fade-in">
      {/* Insufficient History State */}
      {!isML && (
        <div className="tt-card insufficient-card">
          <div className="insufficient-header">
            <div className="warning-icon-wrap">
              <BrainCircuit size={32} className="text-warning" />
            </div>
            <div>
              <h3>Insufficient Data for Machine Learning</h3>
              <p className="text-secondary">
                Linear Regression requires at least <strong>{prediction?.min_sessions_required || 3} completed sessions</strong> to calculate meaningful regression weights and momentum.
              </p>
            </div>
          </div>

          <div className="insufficient-progress">
            <div className="progress-info">
              <span>Current Sessions: {prediction?.current_session_count || 0} / {prediction?.min_sessions_required || 3}</span>
              <span>Need {prediction?.sessions_needed || 3} more</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${Math.min(100, ((prediction?.current_session_count || 0) / (prediction?.min_sessions_required || 3)) * 100)}%` 
                }} 
              />
            </div>
          </div>

          <div className="fallback-explanation">
            <Info size={16} className="text-cyan" />
            <span>
              <strong>Current Baseline Fallback:</strong> {prediction?.baseline_fallback || 40.0} WPM. 
              (Calculated as a simple arithmetic average of existing attempts — this is clearly labeled as a fallback, not an ML prediction.)
            </span>
          </div>

          <div className="insufficient-actions">
            <button 
              className="tt-btn tt-btn-primary"
              onClick={() => setActiveTab('typing-test')}
            >
              <Keyboard size={16} />
              <span>Complete Next Session</span>
            </button>

            <button 
              className="tt-btn tt-btn-secondary"
              onClick={async () => {
                await onSeedDemo();
                loadPrediction();
              }}
            >
              <Sparkles size={14} className="text-cyan" />
              <span>Load Sample Practice History (Demo)</span>
            </button>
          </div>
        </div>
      )}

      {/* When ML Model has sufficient data */}
      {isML && (
        <>
          {/* Top Prediction Spotlight Card */}
          <div className="prediction-spotlight tt-card glass">
            <div className="spotlight-left">
              <div className="model-active-badge">
                <BrainCircuit size={14} className="text-cyan" />
                <span>scikit-learn Linear Regression • Active</span>
              </div>
              <h2 className="spotlight-title">Predicted Next-Session Velocity</h2>
              <p className="spotlight-subtitle">
                {prediction.explanation}
              </p>

              <div className="spotlight-metrics-row">
                <div className="spotlight-metric">
                  <span className="sm-label">PREDICTED SPEED</span>
                  <div className="sm-value-wrap">
                    <span className="sm-val text-cyan">{prediction.predicted_wpm}</span>
                    <span className="sm-unit">WPM</span>
                  </div>
                </div>

                <div className="spotlight-metric">
                  <span className="sm-label">LATEST ACTUAL</span>
                  <div className="sm-value-wrap">
                    <span className="sm-val text-primary">{prediction.latest_wpm}</span>
                    <span className="sm-unit">WPM</span>
                  </div>
                </div>

                <div className="spotlight-metric">
                  <span className="sm-label">ESTIMATED DELTA</span>
                  <div className="sm-value-wrap">
                    <span className={`sm-val ${prediction.difference >= 0 ? 'text-success' : 'text-danger'}`}>
                      {prediction.difference >= 0 ? `+${prediction.difference}` : prediction.difference}
                    </span>
                    <span className="sm-unit">WPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence & Fit Badge */}
            <div className="spotlight-right">
              <div className="fit-panel">
                <div className="fit-header">MODEL METRICS</div>
                <div className="fit-row">
                  <span className="text-secondary">Determination (R²):</span>
                  <strong className="text-primary">{prediction.r2_score}</strong>
                </div>
                <div className="fit-row">
                  <span className="text-secondary">Velocity Slope (m):</span>
                  <strong className="text-cyan">
                    {prediction.feature_weights?.session_index_slope > 0 ? '+' : ''}
                    {prediction.feature_weights?.session_index_slope} WPM/session
                  </strong>
                </div>
                <div className="fit-row">
                  <span className="text-secondary">Confidence Tier:</span>
                  <span className="tt-badge tt-badge-cyan">{prediction.confidence}</span>
                </div>
                <div className="fit-row">
                  <span className="text-secondary">Samples Fitted:</span>
                  <strong className="text-primary">{prediction.total_sessions_analyzed}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Regression Chart */}
          <div className="tt-card regression-chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Observed Performance vs Linear Regression Trend</h3>
                <p className="chart-subtitle">
                  Cyan dots represent your actual WPM scores. The dashed violet line represents the best-fit linear model projecting into your next session.
                </p>
              </div>
              <span className="tt-badge tt-badge-violet">Trend Projection</span>
            </div>

            <div className="regression-chart-body">
              <Line data={regressionChartData} options={chartOptions} />
            </div>
          </div>

          {/* Middle Grid: Feature Weights Breakdown & Projected Milestones */}
          <div className="prediction-middle-grid">
            {/* Feature Weights */}
            <div className="tt-card feature-weights-card">
              <div className="card-section-title">
                <Layers size={18} className="text-cyan" />
                <span>Feature Coefficients & Input Vector</span>
              </div>
              <p className="card-desc">
                How different practice variables influence the model's velocity projection:
              </p>

              <div className="weights-list">
                <div className="weight-item">
                  <div className="weight-meta">
                    <span className="weight-name">Practice Sequence (Experience Growth)</span>
                    <span className="weight-val text-cyan">
                      Slope: {prediction.feature_weights?.session_index_slope}
                    </span>
                  </div>
                  <div className="weight-desc">Gradual neuro-motor typing adaptation per completed session.</div>
                </div>

                <div className="weight-item">
                  <div className="weight-meta">
                    <span className="weight-name">3-Session Moving Average (Momentum)</span>
                    <span className="weight-val text-violet">
                      Weight: {prediction.feature_weights?.moving_avg_weight}
                    </span>
                  </div>
                  <div className="weight-desc">Prevents single outlier sessions from distorting long-term projections.</div>
                </div>

                <div className="weight-item">
                  <div className="weight-meta">
                    <span className="weight-name">Accuracy Ratio (Precision Influence)</span>
                    <span className="weight-val text-success">
                      Weight: {prediction.feature_weights?.accuracy_weight}
                    </span>
                  </div>
                  <div className="weight-desc">Higher typing accuracy correlates with fewer speed-impeding backspaces.</div>
                </div>

                <div className="weight-item">
                  <div className="weight-meta">
                    <span className="weight-name">Model Intercept (Baseline Base)</span>
                    <span className="weight-val text-primary">
                      {prediction.feature_weights?.intercept} WPM
                    </span>
                  </div>
                  <div className="weight-desc">The theoretical initial baseline speed of the linear function.</div>
                </div>
              </div>
            </div>

            {/* Projected Milestones */}
            <div className="tt-card milestones-card">
              <div className="card-section-title">
                <Target size={18} className="text-warning" />
                <span>Projected Typing Milestones</span>
              </div>
              <p className="card-desc">
                Estimated sessions required to reach upcoming WPM tiers based on your current rate of progress:
              </p>

              <div className="milestones-list">
                {prediction.milestones?.map((m, idx) => (
                  <div key={idx} className="milestone-item">
                    <div className="milestone-target">
                      <span className="target-num">{m.target_wpm}</span>
                      <span className="target-label">WPM</span>
                    </div>

                    <div className="milestone-status">
                      {m.achieved ? (
                        <span className="milestone-achieved">
                          <CheckCircle2 size={15} />
                          <span>Achieved!</span>
                        </span>
                      ) : m.achievable ? (
                        <span className="milestone-sessions">
                          Approx. <strong>{m.sessions_needed}</strong> more session{m.sessions_needed > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="milestone-plateau">{m.note || 'Practice steadily'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Explanation & Disclaimer Accordion */}
          <div className="tt-card math-explanation-card">
            <div className="math-header">
              <HelpCircle size={20} className="text-cyan" />
              <h4>How Linear Regression Works in TypeTrend</h4>
            </div>

            <div className="math-body">
              <p>
                In machine learning, <strong>Multiple Linear Regression</strong> models the relationship between an output target variable ($y$, future typing speed in WPM) and explanatory features ($x_1, x_2, \dots$):
              </p>

              <div className="math-formula">
                <code>y = β₀ + β₁·(Session Index) + β₂·(Moving Avg WPM) + β₃·(Accuracy) + β₄·(Duration) + ε</code>
              </div>

              <p>
                The model uses the <strong>Ordinary Least Squares (OLS)</strong> optimization algorithm to minimize the sum of squared residuals between predicted values and actual historical typing speeds. When you complete more tests, the feature weights automatically re-calibrate to reflect your evolving muscle memory.
              </p>

              <div className="disclaimer-callout">
                <AlertTriangle size={18} className="text-warning" />
                <span>
                  <strong>Confidence Disclaimer:</strong> {prediction.disclaimer}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .prediction-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .insufficient-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .insufficient-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .warning-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          background: var(--color-warning-bg);
          border: 1px solid rgba(251, 191, 36, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .insufficient-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 500px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .progress-bar-track {
          width: 100%;
          height: 8px;
          background: var(--bg-main);
          border-radius: 9999px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-cyan), var(--accent-violet));
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .fallback-explanation {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--accent-cyan-subtle);
          border: 1px solid rgba(34, 211, 238, 0.25);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .insufficient-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Spotlight Card */
        .prediction-spotlight {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2.25rem;
          gap: 2rem;
        }

        .spotlight-left {
          flex: 1;
        }

        .model-active-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-cyan);
          background: var(--accent-cyan-subtle);
          border: 1px solid rgba(34, 211, 238, 0.3);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          margin-bottom: 0.75rem;
        }

        .spotlight-title {
          font-size: 1.85rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .spotlight-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          max-width: 650px;
        }

        .spotlight-metrics-row {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          flex-wrap: wrap;
        }

        .sm-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-bottom: 0.25rem;
          display: block;
        }

        .sm-value-wrap {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
        }

        .sm-val {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1;
        }

        .sm-unit {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .fit-panel {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          min-width: 260px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .fit-header {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.4rem;
        }

        .fit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
        }

        .regression-chart-card {
          min-height: 380px;
        }

        .regression-chart-body {
          height: 300px;
          position: relative;
        }

        .prediction-middle-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 1.5rem;
        }

        .card-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .card-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .weights-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .weight-item {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
        }

        .weight-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .weight-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .weight-val {
          font-size: 0.85rem;
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .weight-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .milestone-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
        }

        .milestone-target {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
        }

        .target-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--accent-cyan);
        }

        .target-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .milestone-achieved {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-success);
          font-size: 0.85rem;
          font-weight: 700;
        }

        .milestone-sessions {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .milestone-plateau {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .math-explanation-card {
          padding: 1.75rem;
        }

        .math-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .math-header h4 {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .math-body {
          font-size: 0.88rem;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .math-formula {
          margin: 1rem 0;
          padding: 1rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          color: var(--accent-cyan);
          font-size: 0.85rem;
          overflow-x: auto;
        }

        .disclaimer-callout {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding: 0.85rem 1rem;
          background: var(--color-warning-bg);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        @media (max-width: 900px) {
          .prediction-spotlight {
            flex-direction: column;
            align-items: flex-start;
          }
          .fit-panel {
            width: 100%;
          }
          .prediction-middle-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
