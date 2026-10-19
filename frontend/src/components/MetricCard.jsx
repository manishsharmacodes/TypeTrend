import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendLabel,
  color = 'cyan',
  badge,
  onClick
}) {
  const isClickable = !!onClick;

  return (
    <div 
      className={`tt-card metric-card color-${color} ${isClickable ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className={`metric-icon-wrap icon-${color}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-body">
        <div className="metric-value-wrap">
          <span className="metric-value">{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>

        {badge && (
          <span className="metric-custom-badge">{badge}</span>
        )}
      </div>

      {(trend !== undefined || trendLabel) && (
        <div className="metric-footer">
          {trend !== undefined && (
            <div className={`trend-tag ${trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral'}`}>
              {trend > 0 ? (
                <ArrowUpRight size={13} />
              ) : trend < 0 ? (
                <ArrowDownRight size={13} />
              ) : (
                <Minus size={13} />
              )}
              <span>{trend > 0 ? `+${trend}` : trend}</span>
            </div>
          )}
          {trendLabel && (
            <span className="trend-label">{trendLabel}</span>
          )}
        </div>
      )}

      <style>{`
        .metric-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem;
          min-height: 140px;
        }

        .metric-card.clickable {
          cursor: pointer;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .metric-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-cyan {
          background: var(--accent-cyan-subtle);
          color: var(--accent-cyan);
          border: 1px solid rgba(34, 211, 238, 0.25);
        }

        .icon-violet {
          background: var(--accent-violet-subtle);
          color: var(--accent-violet);
          border: 1px solid rgba(139, 92, 246, 0.25);
        }

        .icon-success {
          background: var(--color-success-bg);
          color: var(--color-success);
          border: 1px solid rgba(52, 211, 153, 0.25);
        }

        .icon-warning {
          background: var(--color-warning-bg);
          color: var(--color-warning);
          border: 1px solid rgba(251, 191, 36, 0.25);
        }

        .metric-body {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .metric-value-wrap {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
        }

        .metric-value {
          font-size: 1.9rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .metric-unit {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .metric-custom-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-secondary);
        }

        .metric-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.72rem;
        }

        .trend-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .trend-up {
          color: var(--color-success);
          background: var(--color-success-bg);
        }

        .trend-down {
          color: var(--color-danger);
          background: var(--color-danger-bg);
        }

        .trend-neutral {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
        }

        .trend-label {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
