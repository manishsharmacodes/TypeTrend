import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  Target, 
  X, 
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const CATEGORIES = [
  { id: 'general', label: 'General English', icon: '📖' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'programming', label: 'Programming', icon: '⚡' },
  { id: 'beginner', label: 'Beginner Practice', icon: '🌱' },
];

const DURATIONS = [30, 60, 120];

export default function TypingTest({ setActiveTab, onSessionSaved }) {
  const { showToast } = useToast();

  // Settings
  const [category, setCategory] = useState('general');
  const [duration, setDuration] = useState(60);

  // Passage Data
  const [passages, setPassages] = useState([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [loadingPassages, setLoadingPassages] = useState(false);

  // Test State
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Live Metrics
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Post-test Results Modal
  const [results, setResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const isFinishedRef = useRef(false);
  const currentInputRef = useRef('');
  const correctCountRef = useRef(0);
  const totalCountRef = useRef(0);

  // Fetch passages whenever category changes
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoadingPassages(true);
        const res = await api.getPassages(category);
        if (isMounted && res.passages?.length > 0) {
          setPassages(res.passages);
          setCurrentPassageIndex(0);
        }
      } catch (err) {
        showToast('Failed to load passages: ' + err.message, 'error');
      } finally {
        if (isMounted) setLoadingPassages(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [category]);

  const activePassage = passages[currentPassageIndex] || {
    id: 'fallback',
    title: 'Focus and Speed',
    category: 'general',
    text: 'Typing with precision and speed is a vital skill in our digital world. Regular practice develops muscle memory, allowing words to translate seamlessly from thought to screen without hesitation.'
  };

  const passageText = activePassage.text;

  // Finish the test and compute definitive metrics
  const finishTest = useCallback(async (forcedInput, forcedElapsed = null) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    clearInterval(timerRef.current);
    setIsFinished(true);

    const actualTime = forcedElapsed !== null && forcedElapsed !== undefined
      ? Math.max(0.5, Math.round(forcedElapsed * 10) / 10)
      : (startTimeRef.current ? Math.max(0.5, Math.round(((performance.now() - startTimeRef.current) / 1000) * 10) / 10) : duration);

    const textToEvaluate = forcedInput !== undefined ? forcedInput : currentInputRef.current;
    const totalChars = textToEvaluate.length;
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < totalChars; i++) {
      if (textToEvaluate[i] === passageText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    // Standard 5-character word convention
    // WPM = (correct / 5) / (minutes)
    const minutes = actualTime / 60.0;
    const finalWpm = Math.round(((correct / 5.0) / minutes) * 10) / 10;
    const finalRawWpm = Math.round(((totalChars / 5.0) / minutes) * 10) / 10;
    const finalAcc = totalChars > 0 ? Math.round((correct / totalChars) * 1000) / 10 : 100.0;

    const summary = {
      wpm: finalWpm,
      raw_wpm: finalRawWpm,
      accuracy: finalAcc,
      duration_seconds: actualTime,
      correct_chars: correct,
      incorrect_chars: incorrect,
      total_chars: totalChars,
      category: activePassage.category,
      passage_title: activePassage.title,
    };

    setResults(summary);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if confetti not supported
    }

    // Automatically persist to SQLite via API
    try {
      setIsSaving(true);
      await api.saveSession(summary);
      setSavedSuccess(true);
      showToast('Practice session saved successfully to SQLite!', 'success');
      if (onSessionSaved) onSessionSaved();
    } catch (err) {
      showToast('Error saving session: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [duration, passageText, activePassage, showToast, onSessionSaved]);

  // Reset test state
  const resetTest = useCallback((newDuration = duration) => {
    clearInterval(timerRef.current);
    startTimeRef.current = null;
    isFinishedRef.current = false;
    currentInputRef.current = '';
    correctCountRef.current = 0;
    totalCountRef.current = 0;
    setInput('');
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(newDuration);
    setElapsedTime(0);
    setLiveWpm(0);
    setLiveAccuracy(100);
    setCorrectCount(0);
    setIncorrectCount(0);
    setResults(null);
    setSavedSuccess(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [duration]);

  // Handle duration pill click
  const handleDurationChange = (d) => {
    setDuration(d);
    resetTest(d);
  };

  // Switch to next passage in category
  const cyclePassage = () => {
    if (passages.length > 1) {
      setCurrentPassageIndex((prev) => (prev + 1) % passages.length);
      resetTest();
    }
  };

  // High-Resolution Wall-Clock Timer hook (never resets on keystrokes)
  useEffect(() => {
    if (isStarted && !isFinished) {
      if (!startTimeRef.current) {
        startTimeRef.current = performance.now();
      }

      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsedSec = (now - startTimeRef.current) / 1000;
        const remainingSec = Math.max(0, duration - elapsedSec);

        setTimeLeft(remainingSec <= 10 && remainingSec > 0 ? Number(remainingSec.toFixed(1)) : Math.ceil(remainingSec));
        setElapsedTime(Number(elapsedSec.toFixed(1)));

        // Real-time live WPM recalculated continuously against exact elapsed wall-clock seconds
        if (elapsedSec >= 0.5) {
          const minutes = elapsedSec / 60.0;
          const wpm = Math.round(((correctCountRef.current / 5.0) / minutes) * 10) / 10;
          setLiveWpm(wpm);
        }

        if (remainingSec <= 0) {
          clearInterval(timerRef.current);
          finishTest(currentInputRef.current, duration);
        }
      }, 100);
    }

    return () => clearInterval(timerRef.current);
  }, [isStarted, isFinished, duration, finishTest]);

  // Handle live typing changes
  const handleInputChange = (e) => {
    if (isFinishedRef.current) return;

    const val = e.target.value;
    currentInputRef.current = val;
    setInput(val);

    // High precision start on first keystroke
    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
      setIsStarted(true);
    }

    // Calculate live correctness
    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === passageText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }
    correctCountRef.current = correct;
    totalCountRef.current = val.length;
    setCorrectCount(correct);
    setIncorrectCount(incorrect);

    // Live high-resolution WPM calculation
    const elapsedSec = Math.max(0.1, (performance.now() - startTimeRef.current) / 1000);
    const minutes = elapsedSec / 60.0;
    const currentWpm = elapsedSec >= 0.5 ? Math.round(((correct / 5.0) / minutes) * 10) / 10 : 0;
    const currentAcc = val.length > 0 ? Math.round((correct / val.length) * 1000) / 10 : 100;

    setLiveWpm(currentWpm);
    setLiveAccuracy(currentAcc);

    // If user has typed entire passage, conclude test with exact elapsed time
    if (val.length >= passageText.length) {
      finishTest(val, elapsedSec);
    }
  };

  // Performance Tier Badge
  const getBadgeTier = (wpm) => {
    if (wpm >= 90) return { title: 'Typing Master ⚡', color: 'cyan' };
    if (wpm >= 70) return { title: 'Pro Typist 🚀', color: 'cyan' };
    if (wpm >= 50) return { title: 'Fluent Typist 🎯', color: 'violet' };
    if (wpm >= 35) return { title: 'Developing Rhythm 🌱', color: 'success' };
    return { title: 'Steady Practice 🐢', color: 'warning' };
  };

  return (
    <div className="typing-test-page animate-fade-in">
      {/* Controls Bar: Category selection, Duration pills, Reset */}
      <div className="test-controls-bar tt-card glass">
        {/* Category Pills */}
        <div className="control-group">
          <span className="control-label">CATEGORY:</span>
          <div className="pill-group">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`control-pill ${category === c.id ? 'active' : ''}`}
                onClick={() => {
                  setCategory(c.id);
                  resetTest();
                }}
                disabled={isStarted && !isFinished}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Pills */}
        <div className="control-group">
          <span className="control-label">DURATION:</span>
          <div className="pill-group">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`control-pill ${duration === d ? 'active' : ''}`}
                onClick={() => handleDurationChange(d)}
                disabled={isStarted && !isFinished}
              >
                <Clock size={13} />
                <span>{d}s</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions: Next Passage / Reset */}
        <div className="control-actions">
          <button 
            className="tt-btn tt-btn-secondary tt-btn-sm"
            onClick={cyclePassage}
            disabled={isStarted && !isFinished}
            title="Load another passage in this category"
          >
            <span>Next Passage</span>
          </button>

          <button 
            className="tt-btn tt-btn-secondary tt-btn-sm"
            onClick={() => resetTest()}
            title="Reset typing test"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Live HUD Floating Bar */}
      <div className="live-hud-bar tt-card">
        <div className="hud-metric">
          <div className="hud-label">TIME LEFT</div>
          <div className={`hud-val ${timeLeft <= 10 && isStarted ? 'text-danger pulse-cyan' : 'text-cyan'}`}>
            {timeLeft}s
          </div>
        </div>

        <div className="hud-divider" />

        <div className="hud-metric">
          <div className="hud-label">LIVE WPM</div>
          <div className="hud-val text-primary">{liveWpm}</div>
        </div>

        <div className="hud-divider" />

        <div className="hud-metric">
          <div className="hud-label">ACCURACY</div>
          <div className={`hud-val ${liveAccuracy >= 95 ? 'text-success' : 'text-warning'}`}>
            {liveAccuracy}%
          </div>
        </div>

        <div className="hud-divider" />

        <div className="hud-metric">
          <div className="hud-label">ACCURACY STATS</div>
          <div className="hud-stats">
            <span className="text-success">{correctCount} ok</span>
            <span className="text-muted">/</span>
            <span className="text-danger">{incorrectCount} err</span>
          </div>
        </div>

        {isStarted && !isFinished && (
          <button 
            className="tt-btn tt-btn-danger tt-btn-sm hud-finish-btn"
            onClick={() => finishTest(currentInputRef.current, startTimeRef.current ? (performance.now() - startTimeRef.current) / 1000 : elapsedTime)}
          >
            Finish Early
          </button>
        )}
      </div>

      {/* Main Typing Passage Display */}
      <div 
        className={`tt-card typing-box-container ${isStarted ? 'typing-active' : ''}`}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="passage-meta">
          <span className="passage-title">{activePassage.title}</span>
          <span className="passage-hint">
            {!isStarted ? '⚡ Click here and begin typing to start timer' : 'Keep focused!'}
          </span>
        </div>

        {/* Character-by-character rendered passage */}
        <div className="passage-text-display" tabIndex={-1}>
          {passageText.split('').map((char, index) => {
            let status = 'pending';
            if (index < input.length) {
              status = input[index] === char ? 'correct' : 'incorrect';
            }
            const isCurrent = index === input.length;

            return (
              <span
                key={index}
                className={`char char-${status} ${isCurrent ? 'char-current' : ''}`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden/Transparent Input to capture physical keystrokes */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          disabled={isFinished}
          className="keystroke-catcher"
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder=""
        />
      </div>

      {/* Results Modal / Panel */}
      {results && (
        <div className="modal-backdrop animate-fade-in">
          <div className="tt-card results-modal glass">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Trophy size={28} className="text-warning" />
                <div>
                  <h3>Test Completed!</h3>
                  <p className="text-secondary">Summary and performance evaluation</p>
                </div>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setResults(null)}
                aria-label="Close summary modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Performance Tier Badge */}
            <div className="results-tier-badge">
              <Sparkles size={16} className="text-cyan" />
              <span>{getBadgeTier(results.wpm).title}</span>
            </div>

            {/* Metrics Breakdown */}
            <div className="results-grid">
              <div className="result-tile">
                <span className="tile-label">NET SPEED</span>
                <span className="tile-value text-cyan">{results.wpm}</span>
                <span className="tile-unit">WPM</span>
              </div>

              <div className="result-tile">
                <span className="tile-label">RAW SPEED</span>
                <span className="tile-value text-primary">{results.raw_wpm}</span>
                <span className="tile-unit">WPM</span>
              </div>

              <div className="result-tile">
                <span className="tile-label">ACCURACY</span>
                <span className="tile-value text-success">{results.accuracy}%</span>
                <span className="tile-unit">Precision</span>
              </div>

              <div className="result-tile">
                <span className="tile-label">TOTAL CHARACTERS</span>
                <span className="tile-value text-primary">{results.total_chars}</span>
                <span className="tile-unit">{results.incorrect_chars} errors</span>
              </div>
            </div>

            {/* Save Status */}
            <div className="save-status-strip">
              {isSaving ? (
                <span className="text-secondary">Saving session to SQLite...</span>
              ) : savedSuccess ? (
                <div className="save-success">
                  <CheckCircle2 size={16} className="text-success" />
                  <span>Session saved to your database and ready for ML analysis!</span>
                </div>
              ) : (
                <div className="save-failed">
                  <AlertCircle size={16} className="text-danger" />
                  <span>Could not save to database.</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="modal-actions">
              <button 
                className="tt-btn tt-btn-primary"
                onClick={() => resetTest()}
              >
                <RotateCcw size={16} />
                <span>Practice Again</span>
              </button>

              <button 
                className="tt-btn tt-btn-secondary"
                onClick={() => {
                  setResults(null);
                  setActiveTab('dashboard');
                }}
              >
                <span>View Dashboard</span>
              </button>

              <button 
                className="tt-btn tt-btn-violet"
                onClick={() => {
                  setResults(null);
                  setActiveTab('prediction');
                }}
              >
                <Zap size={16} />
                <span>See ML Prediction</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .typing-test-page {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .test-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .control-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }

        .pill-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-main);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .control-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.35rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-pill:hover:not(:disabled) {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .control-pill.active {
          background: var(--accent-cyan);
          color: #0B1020;
          box-shadow: 0 2px 8px var(--accent-cyan-glow);
        }

        .control-pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .live-hud-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 1rem 1.5rem;
          background: var(--bg-card);
        }

        .hud-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hud-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-bottom: 0.2rem;
        }

        .hud-val {
          font-size: 1.6rem;
          font-weight: 800;
          font-family: var(--font-mono);
          line-height: 1;
        }

        .hud-stats {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: var(--font-mono);
          display: flex;
          gap: 0.4rem;
        }

        .hud-divider {
          width: 1px;
          height: 36px;
          background: var(--border-color);
        }

        .hud-finish-btn {
          margin-left: 1rem;
        }

        .typing-box-container {
          min-height: 300px;
          padding: 2rem;
          position: relative;
          cursor: text;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .typing-box-container.typing-active {
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 0 25px rgba(34, 211, 238, 0.15);
        }

        .passage-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }

        .passage-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent-cyan);
        }

        .passage-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .passage-text-display {
          font-family: var(--font-mono);
          font-size: 1.35rem;
          line-height: 2;
          letter-spacing: 0.03em;
          user-select: none;
          min-height: 180px;
          outline: none;
        }

        .char {
          position: relative;
          transition: color 0.1s ease;
        }

        .char-pending {
          color: var(--text-muted);
        }

        .char-correct {
          color: var(--color-success);
        }

        .char-incorrect {
          color: var(--color-danger);
          background: rgba(248, 113, 113, 0.2);
          text-decoration: underline;
        }

        .char-current {
          color: var(--accent-cyan);
          border-bottom: 3px solid var(--accent-cyan);
          animation: cursorBlink 1s infinite;
        }

        @keyframes cursorBlink {
          0%, 100% { border-color: var(--accent-cyan); }
          50% { border-color: transparent; }
        }

        .keystroke-catcher {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: text;
          resize: none;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(11, 16, 32, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .results-modal {
          max-width: 580px;
          width: 100%;
          padding: 2.25rem;
          border: 1px solid var(--accent-cyan);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px var(--accent-cyan-glow);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .modal-title-wrap h3 {
          font-size: 1.4rem;
          font-weight: 800;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.4rem;
        }

        .results-tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: var(--accent-cyan-subtle);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 9999px;
          color: var(--accent-cyan);
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .result-tile {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 1.25rem;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .tile-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 0.35rem;
        }

        .tile-value {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.2rem;
        }

        .tile-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .save-status-strip {
          padding: 0.75rem;
          background: var(--bg-main);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .save-success {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--color-success);
          font-weight: 600;
        }

        .save-failed {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--color-danger);
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .test-controls-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .live-hud-bar {
            flex-wrap: wrap;
            gap: 1rem;
          }
          .hud-divider {
            display: none;
          }
          .passage-text-display {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
