import React, { useEffect, useState } from 'react';
import { 
  Keyboard, 
  TrendingUp, 
  Zap, 
  Award, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ 
  setActiveTab, 
  includeDemo, 
  setIncludeDemo,
  onSeedDemo 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(includeDemo);
      setData(res);
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [includeDemo]);

  const metrics = data?.metrics || {
    total_sessions: 0,
    latest_wpm: 0,
    previous_wpm: 0,
    progress_delta: 0,
    best_wpm: 0,
    avg_accuracy: 0,
    predicted_next_wpm: 0,
    is_ml_prediction: false,
    total_practice_minutes: 0,
    total_chars_typed: 0,
  };

  const recentSessions = data?.recent_sessions || [];
  const weeklyActivity = data?.weekly_activity || [];

  // Chart configuration: Speed Progress
  const speedHistory = [...recentSessions].reverse();
  const speedChartData = {
    labels: speedHistory.length > 0 
      ? speedHistory.map((s) => `#${s.session_number}`) 
      : ['No Data'],
    datasets: [
      {
        label: 'Net WPM',
        data: speedHistory.length > 0 ? speedHistory.map((s) => s.wpm) : [0],
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#22D3EE',
        pointBorderColor: '#0B1020',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Raw WPM',
        data: speedHistory.length > 0 ? speedHistory.map((s) => s.raw_wpm || s.wpm) : [0],
        borderColor: 'rgba(148, 163, 184, 0.4)',
        borderDash: [5, 5],
        tension: 0.35,
        fill: false,
        pointRadius: 2,
      }
    ],
  };

  // Chart configuration: Accuracy Trend
  const accuracyChartData = {
    labels: speedHistory.length > 0 
      ? speedHistory.map((s) => `#${s.session_number}`) 
      : ['No Data'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: speedHistory.length > 0 ? speedHistory.map((s) => s.accuracy) : [100],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#0B1020',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  // Chart configuration: Weekly Activity
  const weeklyChartData = {
    labels: weeklyActivity.map((w) => {
      const parts = w.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: [
      {
        label: 'Sessions Completed',
        data: weeklyActivity.map((w) => w.count),
        backgroundColor: 'rgba(34, 211, 238, 0.8)',
        borderRadius: 6,
        hoverBackgroundColor: '#22D3EE',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94A3B8',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#151F35',
        titleColor: '#F1F5F9',
        bodyColor: '#94A3B8',
        borderColor: '#293650',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="welcome-banner tt-card glass">
        <div className="welcome-content">
          <div className="welcome-badge">
            <Sparkles size={14} className="text-cyan" />
            <span>AI-Powered Velocity Forecasting</span>
          </div>
          <h2 className="welcome-title">
            Welcome to <span className="title-gradient">TypeTrend</span>
          </h2>
          <p className="welcome-subtitle">
            Every keystroke brings you closer to your next milestone.
          </p>

          <div className="welcome-actions">
            <button 
              className="tt-btn tt-btn-primary"
              onClick={() => setActiveTab('typing-test')}
              id="cta-start-typing"
            >
              <Keyboard size={16} />
              <span>Start Typing Test</span>
            </button>

            <button 
              className="tt-btn tt-btn-secondary"
              onClick={() => setActiveTab('prediction')}
              id="cta-view-prediction"
            >
              <TrendingUp size={16} />
              <span>View ML Prediction</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Snapshot Chip */}
        <div className="welcome-side-chip">
          <div className="chip-label">NEXT TARGET MILESTONE</div>
          <div className="chip-target-val">
            {metrics.predicted_next_wpm ? `${metrics.predicted_next_wpm} WPM` : '--'}
          </div>
          <div className="chip-meta">
            {metrics.is_ml_prediction ? (
              <span className="text-cyan">✓ Linear Regression Fit</span>
            ) : (
              <span className="text-secondary">Awaiting 3+ tests</span>
            )}
          </div>
        </div>
      </div>

      {/* 5 Main Metric Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Practice Sessions"
          value={metrics.total_sessions}
          unit="sessions"
          icon={Calendar}
          color="cyan"
          trendLabel={`${metrics.total_practice_minutes} mins total`}
        />

        <MetricCard
          title="Latest Typing Speed"
          value={metrics.latest_wpm}
          unit="WPM"
          icon={Zap}
          color="cyan"
          trend={metrics.progress_delta !== 0 ? metrics.progress_delta : undefined}
          trendLabel={metrics.previous_wpm > 0 ? `vs prev #${metrics.total_sessions - 1}` : undefined}
        />

        <MetricCard
          title="Best WPM Achieved"
          value={metrics.best_wpm}
          unit="WPM"
          icon={Award}
          color="warning"
          badge="Personal Record"
        />

        <MetricCard
          title="Average Accuracy"
          value={metrics.avg_accuracy}
          unit="%"
          icon={CheckCircle2}
          color="violet"
          badge={metrics.avg_accuracy >= 95 ? 'High Precision' : 'Standard'}
        />

        <MetricCard
          title="Predicted Next WPM"
          value={metrics.predicted_next_wpm || '--'}
          unit="WPM"
          icon={TrendingUp}
          color="success"
          badge={metrics.is_ml_prediction ? 'ML Regression' : 'Baseline'}
          onClick={() => setActiveTab('prediction')}
        />
      </div>

      {/* Empty State Prompt if 0 sessions */}
      {metrics.total_sessions === 0 && (
        <div className="empty-state-card tt-card">
          <div className="empty-icon-wrap">
            <Keyboard size={36} className="text-cyan" />
          </div>
          <h3>No practice sessions recorded yet</h3>
          <p>
            Take your first 60-second typing test to build your personal dataset and start training your machine learning model!
          </p>
          <div className="empty-actions">
            <button 
              className="tt-btn tt-btn-primary"
              onClick={() => setActiveTab('typing-test')}
            >
              Take First Test Now
            </button>
            <button 
              className="tt-btn tt-btn-secondary"
              onClick={async () => {
                await onSeedDemo();
                loadDashboard();
              }}
            >
              <Sparkles size={14} className="text-cyan" />
              <span>Load Demo Practice Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="tt-card chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Typing Speed Progress</h3>
              <p className="chart-subtitle">Historical WPM trajectory across completed sessions</p>
            </div>
            <span className="tt-badge tt-badge-cyan">WPM Velocity</span>
          </div>
          <div className="chart-body">
            <Line data={speedChartData} options={chartOptions} />
          </div>
        </div>

        <div className="tt-card chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Accuracy Consistency</h3>
              <p className="chart-subtitle">Precision percentage over time</p>
            </div>
            <span className="tt-badge tt-badge-violet">Accuracy %</span>
          </div>
          <div className="chart-body">
            <Line data={accuracyChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Weekly Activity + Recent Sessions */}
      <div className="dashboard-bottom-grid">
        {/* Weekly Activity */}
        <div className="tt-card weekly-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Weekly Practice Activity</h3>
              <p className="chart-subtitle">Sessions logged in the past 7 days</p>
            </div>
            <span className="tt-badge tt-badge-success">7-Day Streak</span>
          </div>
          <div className="chart-body-sm">
            <Bar data={weeklyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="tt-card recent-sessions-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Recent Practice Sessions</h3>
              <p className="chart-subtitle">Latest performance records saved to SQLite</p>
            </div>
            <button 
              className="tt-btn tt-btn-secondary tt-btn-sm"
              onClick={() => setActiveTab('analytics')}
            >
              View All History
            </button>
          </div>

          <div className="recent-table-wrap">
            {recentSessions.length === 0 ? (
              <div className="table-empty">No sessions logged yet.</div>
            ) : (
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Category</th>
                    <th>Speed</th>
                    <th>Accuracy</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.slice(0, 5).map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="session-tag">#{s.session_number}</span>
                        {s.is_demo === 1 && (
                          <span className="demo-tag" title="Demonstration sample">Demo</span>
                        )}
                      </td>
                      <td className="cat-cell">{s.category}</td>
                      <td>
                        <span className="wpm-cell">{s.wpm} <small>WPM</small></span>
                      </td>
                      <td>
                        <span className={`acc-cell ${s.accuracy >= 95 ? 'text-success' : 'text-cyan'}`}>
                          {s.accuracy}%
                        </span>
                      </td>
                      <td className="text-secondary">{s.duration_seconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2.25rem 2rem;
          background: linear-gradient(135deg, rgba(21, 31, 53, 0.95), rgba(17, 26, 46, 0.95));
          border: 1px solid var(--border-color);
          position: relative;
        }

        .welcome-content {
          max-width: 650px;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          background: var(--accent-cyan-subtle);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 9999px;
          color: var(--accent-cyan);
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.85rem;
        }

        .welcome-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          line-height: 1.15;
        }

        .welcome-subtitle {
          color: var(--text-secondary);
          font-size: 1.05rem;
          margin-bottom: 1.5rem;
        }

        .welcome-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .welcome-side-chip {
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          border: 1px solid rgba(34, 211, 238, 0.25);
          text-align: right;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .chip-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 0.25rem;
        }

        .chip-target-val {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--accent-cyan);
          line-height: 1.1;
        }

        .chip-meta {
          font-size: 0.75rem;
          margin-top: 0.35rem;
        }

        .empty-state-card {
          text-align: center;
          padding: 3rem 2rem;
          border: 1px dashed var(--border-color);
        }

        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--accent-cyan-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
        }

        .empty-state-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .empty-state-card p {
          color: var(--text-secondary);
          max-width: 500px;
          margin: 0 auto 1.5rem auto;
          font-size: 0.95rem;
        }

        .empty-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .chart-container {
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }

        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .chart-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .chart-subtitle {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .chart-body {
          flex: 1;
          height: 240px;
          position: relative;
        }

        .chart-body-sm {
          height: 200px;
          position: relative;
        }

        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 1.5rem;
        }

        .recent-table-wrap {
          overflow-x: auto;
        }

        .recent-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .recent-table th {
          text-align: left;
          padding: 0.75rem 0.5rem;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .recent-table td {
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .session-tag {
          font-weight: 700;
          color: var(--text-primary);
        }

        .demo-tag {
          margin-left: 0.4rem;
          font-size: 0.65rem;
          background: rgba(251, 191, 36, 0.15);
          color: var(--color-warning);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .cat-cell {
          text-transform: capitalize;
          color: var(--text-secondary);
        }

        .wpm-cell {
          font-weight: 700;
          color: var(--accent-cyan);
        }

        .wpm-cell small {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .acc-cell {
          font-weight: 600;
        }

        .table-empty {
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        @media (max-width: 900px) {
          .welcome-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .welcome-side-chip {
            width: 100%;
            text-align: left;
          }
          .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
