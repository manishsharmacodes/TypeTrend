import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Clock, 
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Goals({ includeDemo, setActiveTab }) {
  const [goals, setGoals] = useState({
    target_wpm: 60,
    target_accuracy: 95,
    daily_goal_minutes: 15
  });

  const [currentMetrics, setCurrentMetrics] = useState({
    best_wpm: 0,
    latest_wpm: 0,
    avg_accuracy: 0,
    total_practice_minutes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, dashRes] = await Promise.all([
        api.getGoals(),
        api.getDashboard(includeDemo)
      ]);
      setGoals({
        target_wpm: goalsRes.target_wpm || 60,
        target_accuracy: goalsRes.target_accuracy || 95,
        daily_goal_minutes: goalsRes.daily_goal_minutes || 15
      });
      setCurrentMetrics({
        best_wpm: dashRes.metrics?.best_wpm || 0,
        latest_wpm: dashRes.metrics?.latest_wpm || 0,
        avg_accuracy: dashRes.metrics?.avg_accuracy || 0,
        total_practice_minutes: dashRes.metrics?.total_practice_minutes || 0
      });
    } catch (err) {
      showToast('Failed to load goals: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [includeDemo]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateGoals({
        target_wpm: Number(goals.target_wpm),
        target_accuracy: Number(goals.target_accuracy),
        daily_goal_minutes: Number(goals.daily_goal_minutes)
      });
      showToast('Personalized goals updated and saved!', 'success');
      
      // If user achieved their WPM goal, celebrate!
      if (currentMetrics.best_wpm >= goals.target_wpm && currentMetrics.best_wpm > 0) {
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err) {
      showToast('Failed to save goals: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const wpmPercent = Math.min(100, Math.round((currentMetrics.best_wpm / (goals.target_wpm || 1)) * 100));
  const accPercent = Math.min(100, Math.round((currentMetrics.avg_accuracy / (goals.target_accuracy || 1)) * 100));
  const wpmGap = Math.max(0, Math.round((goals.target_wpm - currentMetrics.best_wpm) * 10) / 10);
  const accGap = Math.max(0, Math.round((goals.target_accuracy - currentMetrics.avg_accuracy) * 10) / 10);

  // Suggested next target
  const suggestedWpm = Math.max(currentMetrics.best_wpm + 5, Math.ceil(goals.target_wpm * 1.1));

  return (
    <div className="goals-page animate-fade-in">
      {/* Top Banner */}
      <div className="goals-hero tt-card glass">
        <div className="hero-content">
          <div className="hero-badge">
            <Target size={14} className="text-cyan" />
            <span>Milestone Target Tracker</span>
          </div>
          <h2>Personalized Typing Milestones</h2>
          <p className="text-secondary">
            Set deliberate practice targets for velocity, accuracy, and daily discipline. The system benchmarks your progress continuously.
          </p>
        </div>

        {wpmPercent >= 100 && (
          <div className="goal-achieved-badge">
            <Award size={22} className="text-warning" />
            <div>
              <div className="achieved-title">Target Goal Achieved!</div>
              <div className="achieved-desc">Best: {currentMetrics.best_wpm} WPM &gt;= {goals.target_wpm} WPM</div>
            </div>
          </div>
        )}
      </div>

      <div className="goals-grid">
        {/* Form Settings Card */}
        <div className="tt-card goals-form-card">
          <div className="card-header">
            <h3>Target Settings</h3>
            <p className="text-secondary">Adjust your desired typing benchmarks</p>
          </div>

          <form onSubmit={handleSave} className="goals-form">
            {/* Target WPM */}
            <div className="form-group">
              <div className="group-label-row">
                <label htmlFor="target-wpm">Target Speed (WPM)</label>
                <span className="slider-val text-cyan">{goals.target_wpm} WPM</span>
              </div>
              <input 
                id="target-wpm"
                type="range"
                min="20"
                max="160"
                step="5"
                value={goals.target_wpm}
                onChange={(e) => setGoals({ ...goals, target_wpm: Number(e.target.value) })}
                className="slider-input"
              />
              <div className="slider-hints">
                <span>Beginner (30)</span>
                <span>Fluent (60)</span>
                <span>Pro (90)</span>
                <span>Elite (120+)</span>
              </div>
            </div>

            {/* Target Accuracy */}
            <div className="form-group">
              <div className="group-label-row">
                <label htmlFor="target-acc">Target Accuracy (%)</label>
                <span className="slider-val text-violet">{goals.target_accuracy}%</span>
              </div>
              <input 
                id="target-acc"
                type="range"
                min="80"
                max="100"
                step="1"
                value={goals.target_accuracy}
                onChange={(e) => setGoals({ ...goals, target_accuracy: Number(e.target.value) })}
                className="slider-input"
              />
              <div className="slider-hints">
                <span>Standard (85%)</span>
                <span>Clean (92%)</span>
                <span>Strict (95%)</span>
                <span>Flawless (99%)</span>
              </div>
            </div>

            {/* Daily Goal Minutes */}
            <div className="form-group">
              <div className="group-label-row">
                <label htmlFor="daily-mins">Daily Practice Goal</label>
                <span className="slider-val text-success">{goals.daily_goal_minutes} mins/day</span>
              </div>
              <input 
                id="daily-mins"
                type="range"
                min="5"
                max="60"
                step="5"
                value={goals.daily_goal_minutes}
                onChange={(e) => setGoals({ ...goals, daily_goal_minutes: Number(e.target.value) })}
                className="slider-input"
              />
            </div>

            <button 
              type="submit" 
              className="tt-btn tt-btn-primary tt-btn-lg save-goals-btn"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Goals to Database'}</span>
            </button>
          </form>
        </div>

        {/* Progress & Visual Gauges Card */}
        <div className="tt-card goals-status-card">
          <div className="card-header">
            <h3>Live Goal Progress</h3>
            <p className="text-secondary">Measured against your SQLite practice records</p>
          </div>

          <div className="progress-items">
            {/* Speed Progress Bar */}
            <div className="goal-progress-box">
              <div className="box-header">
                <div className="box-title-wrap">
                  <Zap size={16} className="text-cyan" />
                  <span>Typing Speed Milestone</span>
                </div>
                <span className="box-percent text-cyan">{wpmPercent}%</span>
              </div>

              <div className="goal-meter-track">
                <div 
                  className="goal-meter-fill fill-cyan"
                  style={{ width: `${wpmPercent}%` }}
                />
              </div>

              <div className="box-meta">
                <span>Best Achieved: <strong>{currentMetrics.best_wpm} WPM</strong></span>
                <span>Target: <strong>{goals.target_wpm} WPM</strong></span>
              </div>

              <div className="box-gap-msg">
                {wpmGap === 0 ? (
                  <span className="text-success">🎉 Target reached! Consider stepping up your goal.</span>
                ) : (
                  <span>You are only <strong>{wpmGap} WPM</strong> away from your target!</span>
                )}
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="goal-progress-box">
              <div className="box-header">
                <div className="box-title-wrap">
                  <CheckCircle2 size={16} className="text-violet" />
                  <span>Accuracy Standard</span>
                </div>
                <span className="box-percent text-violet">{accPercent}%</span>
              </div>

              <div className="goal-meter-track">
                <div 
                  className="goal-meter-fill fill-violet"
                  style={{ width: `${accPercent}%` }}
                />
              </div>

              <div className="box-meta">
                <span>Current Avg: <strong>{currentMetrics.avg_accuracy}%</strong></span>
                <span>Target: <strong>{goals.target_accuracy}%</strong></span>
              </div>

              <div className="box-gap-msg">
                {accGap === 0 ? (
                  <span className="text-success">🎯 Accuracy threshold fulfilled!</span>
                ) : (
                  <span>Aim for <strong>+{accGap}%</strong> more precision on upcoming tests.</span>
                )}
              </div>
            </div>

            {/* Next Recommended Practice Target */}
            <div className="recommendation-card">
              <div className="rec-badge">
                <Sparkles size={14} className="text-warning" />
                <span>AI Recommendation</span>
              </div>
              <p className="rec-text">
                Based on your current trajectory, your optimal next stretch goal is <strong>{suggestedWpm} WPM</strong>. Practice in the "Technology" and "Programming" categories to challenge symbol and punctuation reflexes!
              </p>
              <button 
                className="tt-btn tt-btn-secondary tt-btn-sm"
                onClick={() => setActiveTab('typing-test')}
              >
                <span>Practice Now</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .goals-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .goals-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .hero-content {
          max-width: 600px;
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

        .goals-hero h2 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.4rem;
        }

        .goal-achieved-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: var(--color-warning-bg);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: var(--radius-md);
        }

        .achieved-title {
          font-weight: 800;
          color: var(--color-warning);
          font-size: 1.05rem;
        }

        .achieved-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .goals-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 1.5rem;
        }

        .card-header {
          margin-bottom: 1.5rem;
        }

        .card-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .card-header p {
          font-size: 0.8rem;
        }

        .goals-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .group-label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .slider-val {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.95rem;
        }

        .slider-input {
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          background: var(--bg-main);
          outline: none;
          accent-color: var(--accent-cyan);
          cursor: pointer;
        }

        .slider-hints {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .save-goals-btn {
          margin-top: 1rem;
          width: 100%;
        }

        .progress-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .goal-progress-box {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
        }

        .box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .box-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .box-percent {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 1.1rem;
        }

        .goal-meter-track {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .goal-meter-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .fill-cyan {
          background: linear-gradient(90deg, #06b6d4, var(--accent-cyan));
          box-shadow: 0 0 10px var(--accent-cyan-glow);
        }

        .fill-violet {
          background: linear-gradient(90deg, #7c3aed, var(--accent-violet));
          box-shadow: 0 0 10px var(--accent-violet-glow);
        }

        .box-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .box-gap-msg {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .recommendation-card {
          background: var(--bg-main);
          border: 1px dashed rgba(251, 191, 36, 0.4);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .rec-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--color-warning);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rec-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .goals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
