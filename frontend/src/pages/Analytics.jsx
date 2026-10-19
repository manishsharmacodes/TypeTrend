import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Trash2, 
  Filter, 
  Search, 
  Award, 
  Clock, 
  Zap, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

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

function formatLocalTimestamp(ts) {
  if (!ts) return 'Just now';
  try {
    const iso = ts.includes('Z') || ts.includes('+') ? ts : ts.replace(' ', 'T') + 'Z';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return ts.replace('T', ' ').slice(0, 16);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return ts.slice(0, 16);
  }
}

export default function Analytics({ 
  includeDemo, 
  setIncludeDemo, 
  onSeedDemo, 
  setActiveTab 
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const { showToast } = useToast();

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getSessions({ 
        category: categoryFilter, 
        limit: 200, 
        includeDemo 
      });
      setSessions(res.sessions || []);
    } catch (err) {
      showToast('Failed to load session history: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [categoryFilter, includeDemo]);

  // Statistics
  const totalSessions = sessions.length;
  const bestWpm = totalSessions > 0 ? Math.max(...sessions.map((s) => s.wpm)) : 0;
  const avgWpm = totalSessions > 0 ? (sessions.reduce((acc, s) => acc + s.wpm, 0) / totalSessions).toFixed(1) : 0;
  const avgAccuracy = totalSessions > 0 ? (sessions.reduce((acc, s) => acc + s.accuracy, 0) / totalSessions).toFixed(1) : 0;
  const totalDurationSec = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
  const totalMinutes = (totalDurationSec / 60).toFixed(1);

  // Filtered session records for table
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.category?.toLowerCase().includes(q) ||
      s.passage_title?.toLowerCase().includes(q) ||
      String(s.session_number).includes(q)
    );
  });

  // Chart: Chronological WPM and Accuracy
  const chronological = [...sessions].reverse();
  const speedAccuracyChartData = {
    labels: chronological.map((s) => `#${s.session_number}`),
    datasets: [
      {
        type: 'line',
        label: 'Net WPM',
        data: chronological.map((s) => s.wpm),
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        yAxisID: 'yWpm',
        tension: 0.3,
        fill: true,
      },
      {
        type: 'line',
        label: 'Accuracy (%)',
        data: chronological.map((s) => s.accuracy),
        borderColor: '#8B5CF6',
        backgroundColor: 'transparent',
        yAxisID: 'yAcc',
        borderDash: [4, 4],
        tension: 0.3,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94A3B8', font: { family: 'Inter', size: 12 } },
      },
      tooltip: {
        backgroundColor: '#151F35',
        titleColor: '#F1F5F9',
        bodyColor: '#94A3B8',
        borderColor: '#293650',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8' },
      },
      yWpm: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#22D3EE' },
        title: { display: true, text: 'WPM', color: '#22D3EE' }
      },
      yAcc: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#8B5CF6' },
        title: { display: true, text: 'Accuracy %', color: '#8B5CF6' },
        min: 60,
        max: 100,
      }
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (sessions.length === 0) {
      showToast('No sessions to export', 'warning');
      return;
    }
    const headers = ['Session #', 'Date', 'Category', 'Passage', 'Net WPM', 'Raw WPM', 'Accuracy %', 'Duration (s)', 'Correct Chars', 'Incorrect Chars', 'Demo'];
    const rows = sessions.map((s) => [
      s.session_number,
      s.timestamp,
      s.category,
      `"${(s.passage_title || '').replace(/"/g, '""')}"`,
      s.wpm,
      s.raw_wpm,
      s.accuracy,
      s.duration_seconds,
      s.correct_chars,
      s.incorrect_chars,
      s.is_demo ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `typetrend_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Session history exported to CSV!', 'success');
  };

  // Clear data handler
  const handleClear = async (onlyDemo = false) => {
    try {
      await api.clearData(onlyDemo);
      setConfirmClearOpen(false);
      showToast(onlyDemo ? 'Demo sessions cleared' : 'All practice sessions cleared', 'info');
      loadSessions();
    } catch (err) {
      showToast('Failed to clear sessions: ' + err.message, 'error');
    }
  };

  return (
    <div className="analytics-page animate-fade-in">
      {/* Top Summary Bar */}
      <div className="analytics-stats-grid">
        <div className="tt-card stat-card">
          <div className="stat-icon-wrap icon-cyan">
            <Zap size={18} />
          </div>
          <div>
            <div className="stat-label">AVERAGE SPEED</div>
            <div className="stat-val">{avgWpm} <small>WPM</small></div>
          </div>
        </div>

        <div className="tt-card stat-card">
          <div className="stat-icon-wrap icon-warning">
            <Award size={18} />
          </div>
          <div>
            <div className="stat-label">ALL-TIME BEST</div>
            <div className="stat-val">{bestWpm} <small>WPM</small></div>
          </div>
        </div>

        <div className="tt-card stat-card">
          <div className="stat-icon-wrap icon-violet">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="stat-label">AVG ACCURACY</div>
            <div className="stat-val">{avgAccuracy}%</div>
          </div>
        </div>

        <div className="tt-card stat-card">
          <div className="stat-icon-wrap icon-success">
            <Clock size={18} />
          </div>
          <div>
            <div className="stat-label">PRACTICE TIME</div>
            <div className="stat-val">{totalMinutes} <small>mins</small></div>
          </div>
        </div>
      </div>

      {/* Speed & Accuracy Over Time Chart */}
      <div className="tt-card chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Longitudinal Typing Velocity & Accuracy</h3>
            <p className="chart-subtitle">Chronological progression across all completed sessions</p>
          </div>
          <div className="chart-actions">
            <button 
              className="tt-btn tt-btn-secondary tt-btn-sm"
              onClick={exportCSV}
              title="Export records to CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="analytics-chart-body">
          {sessions.length > 0 ? (
            <Line data={speedAccuracyChartData} options={chartOptions} />
          ) : (
            <div className="chart-empty-state">
              <Calendar size={32} className="text-secondary" />
              <p>No practice sessions found to plot.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Sessions Table Card */}
      <div className="tt-card table-card">
        <div className="table-controls-bar">
          <div className="filter-group">
            <Filter size={15} className="text-secondary" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              <option value="general">General English</option>
              <option value="technology">Technology</option>
              <option value="programming">Programming</option>
              <option value="beginner">Beginner Practice</option>
            </select>
          </div>

          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by title or session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="table-actions">
            {sessions.some((s) => s.is_demo === 1) && (
              <button 
                className="tt-btn tt-btn-secondary tt-btn-sm"
                onClick={() => handleClear(true)}
                title="Remove sample demo records"
              >
                Clear Demo Data
              </button>
            )}

            <button 
              className="tt-btn tt-btn-danger tt-btn-sm"
              onClick={() => setConfirmClearOpen(true)}
              title="Delete all practice sessions"
            >
              <Trash2 size={14} />
              <span>Reset History</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="history-table-wrap">
          {filteredSessions.length === 0 ? (
            <div className="table-empty-box">
              <p>No historical records matching your filters.</p>
              {sessions.length === 0 && (
                <div className="empty-btns">
                  <button 
                    className="tt-btn tt-btn-primary tt-btn-sm"
                    onClick={() => setActiveTab('typing-test')}
                  >
                    Take a Typing Test
                  </button>
                  <button 
                    className="tt-btn tt-btn-secondary tt-btn-sm"
                    onClick={async () => {
                      await onSeedDemo();
                      loadSessions();
                    }}
                  >
                    <Sparkles size={13} className="text-cyan" />
                    <span>Load Demo Data</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Timestamp</th>
                  <th>Passage</th>
                  <th>Category</th>
                  <th>Net WPM</th>
                  <th>Raw WPM</th>
                  <th>Accuracy</th>
                  <th>Duration</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="session-id">#{s.session_number}</span>
                      {s.is_demo === 1 && <span className="demo-badge">Demo</span>}
                    </td>
                    <td className="timestamp-cell">
                      {formatLocalTimestamp(s.timestamp)}
                    </td>
                    <td className="title-cell">{s.passage_title || 'General Test'}</td>
                    <td>
                      <span className={`cat-pill cat-${s.category}`}>{s.category}</span>
                    </td>
                    <td>
                      <span className="wpm-value">{s.wpm}</span>
                    </td>
                    <td className="text-secondary">{s.raw_wpm || s.wpm}</td>
                    <td>
                      <span className={`acc-value ${s.accuracy >= 95 ? 'text-success' : 'text-primary'}`}>
                        {s.accuracy}%
                      </span>
                    </td>
                    <td className="text-secondary">{s.duration_seconds}s</td>
                    <td>
                      <span className={s.incorrect_chars > 0 ? 'text-danger' : 'text-muted'}>
                        {s.incorrect_chars}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Resetting History */}
      {confirmClearOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="tt-card clear-modal">
            <h3>Clear Practice History?</h3>
            <p className="text-secondary">
              This action will permanently delete all session records from the SQLite database. Are you sure?
            </p>
            <div className="clear-modal-actions">
              <button 
                className="tt-btn tt-btn-secondary"
                onClick={() => setConfirmClearOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="tt-btn tt-btn-danger"
                onClick={() => handleClear(false)}
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analytics-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }

        .stat-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-bottom: 0.15rem;
        }

        .stat-val {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-val small {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .chart-card {
          min-height: 380px;
        }

        .analytics-chart-body {
          height: 290px;
          position: relative;
        }

        .chart-empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .table-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .category-select {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          outline: none;
        }

        .search-wrap {
          position: relative;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.45rem 0.85rem 0.45rem 2.2rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          outline: none;
        }

        .search-input:focus {
          border-color: var(--accent-cyan);
        }

        .table-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .history-table-wrap {
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .history-table th {
          text-align: left;
          padding: 0.75rem 0.65rem;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .history-table td {
          padding: 0.85rem 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .session-id {
          font-weight: 700;
          color: var(--text-primary);
        }

        .demo-badge {
          margin-left: 0.4rem;
          font-size: 0.65rem;
          background: rgba(251, 191, 36, 0.15);
          color: var(--color-warning);
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .timestamp-cell {
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-family: var(--font-mono);
        }

        .title-cell {
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cat-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          text-transform: capitalize;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
        }

        .wpm-value {
          font-weight: 800;
          color: var(--accent-cyan);
          font-size: 1rem;
        }

        .acc-value {
          font-weight: 700;
        }

        .table-empty-box {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .empty-btns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .clear-modal {
          max-width: 420px;
          padding: 2rem;
          text-align: center;
        }

        .clear-modal h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .clear-modal p {
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .clear-modal-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
