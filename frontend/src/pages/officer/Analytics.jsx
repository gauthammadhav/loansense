import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, BarChart2, Activity, Users, FileBarChart, CheckCircle2, ShieldAlert } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function OfficerAnalytics() {
  const [modelHistory, setModelHistory] = useState([]);
  const [datasetStats, setDatasetStats] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [histRes, statsRes, featRes] = await Promise.all([
        apiClient.get('/model/comparison').catch(() => ({ data: [] })),
        apiClient.get('/model/dataset-stats').catch(() => ({ data: null })),
        apiClient.get('/model/feature-importance').catch(() => ({ data: null })),
      ]);
      setModelHistory(histRes.data || []);
      setDatasetStats(statsRes.data);
      setFeatureImportance(featRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '2.5px solid var(--lime)', borderTopColor: 'transparent' }}
        />
        <span style={{ color: 'var(--lime-dark)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Aggregating Telemetry…
        </span>
      </div>
    );
  }

  const featArray = featureImportance
    ? Object.entries(featureImportance).sort((a, b) => b[1] - a[1]).slice(0, 10)
    : [];

  const BAR_COLORS = [
    'var(--lime-dark)', '#86efac', '#bbf7d0', '#d1fae5',
    '#a3e635', '#bef264', '#e7f3be', '#f0fdf4', '#d4d4d4', '#e5e5e5',
  ];

  const EMPLOYMENT_COLORS = {
    salaried: 'var(--lime-dark)',
    'self-employed': '#3b82f6',
    business: '#f59e0b',
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
          <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>System Telemetry</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 26 : 36, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Analytics Hub
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Macro-level observation of active AI endpoints and underlying dataset drift.
        </p>
      </motion.div>

      {/* ── KPI Cards ── */}
      {datasetStats && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 20 }}
        >
          {[
            { icon: <Database size={22} />, badge: 'Dataset', badgeVariant: 'outline', label: 'Global Records', value: datasetStats.total_rows?.toLocaleString(), color: 'var(--text)' },
            { icon: <TrendingUp size={22} />, badge: 'Inferred', badgeVariant: 'success', label: 'Approval Baseline', value: `${datasetStats.approval_rate}%`, color: 'var(--success-dark)', glow: true },
            { icon: <BarChart2 size={22} />, badge: 'Median', badgeVariant: 'outline', label: 'Applicant Income', value: formatCurrency(datasetStats.avg_monthly_income), color: 'var(--text)' },
            { icon: <ShieldAlert size={22} />, badge: 'Risk', badgeVariant: 'outline', label: 'Global Credit Avg', value: datasetStats.avg_credit_score?.toFixed(0), color: 'var(--text)' },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
              style={{
                backgroundColor: 'white', border: '1px solid var(--glass-border)',
                borderRadius: 20, padding: '24px 22px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s, transform 0.2s',
                position: 'relative', overflow: 'hidden', gap: 20,
              }}
            >
              {kpi.glow && (
                <div style={{ position: 'absolute', right: -10, bottom: -10, width: 80, height: 80, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: kpi.glow ? 'var(--success-dark)' : 'var(--text-muted)' }}>{kpi.icon}</div>
                <Badge variant={kpi.badgeVariant} size="sm">{kpi.badge}</Badge>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  {kpi.label}
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 28, color: kpi.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {kpi.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Employment Distribution ── */}
      {datasetStats?.employment_distribution && Object.keys(datasetStats.employment_distribution).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card title="Employment Portfolio Distribution" icon={<Users size={18} />}>
            {/* Stacked bar */}
            <div style={{
              height: 52, width: '100%', borderRadius: 14, overflow: 'hidden',
              border: '1px solid var(--glass-border)', display: 'flex', marginTop: 8,
            }}>
              {Object.entries(datasetStats.employment_distribution).map(([type, count]) => {
                const pct = (count / datasetStats.total_rows) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={type}
                    title={`${type}: ${pct.toFixed(1)}%`}
                    style={{
                      width: `${pct}%`, backgroundColor: EMPLOYMENT_COLORS[type] || '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    {pct > 12 && (
                      <span style={{ color: 'white', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {type.replace('-', ' ')} ({pct.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 20, flexWrap: 'wrap' }}>
              {Object.entries(datasetStats.employment_distribution).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: EMPLOYMENT_COLORS[type] || '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                    {type.replace('-', ' ')}{' '}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({count.toLocaleString()})</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Algorithm Registry + Feature Weights ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>

        {/* Algorithm Registry */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card title="Algorithm Registry" icon={<Activity size={18} />}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 20px 0' }}>
              Active deployment registry tracking endpoint accuracy and F1 metrics for ongoing Random Forest models.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modelHistory.length > 0 ? modelHistory.map((model, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px 18px', borderRadius: 16,
                    border: `1px solid ${model.best ? 'rgba(34,197,94,0.3)' : 'var(--glass-border)'}`,
                    backgroundColor: model.best ? 'rgba(34,197,94,0.04)' : '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = model.best ? 'rgba(34,197,94,0.08)' : '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = model.best ? 'rgba(34,197,94,0.04)' : '#f8fafc'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: model.best ? 'rgba(34,197,94,0.15)' : '#e2e8f0',
                      color: model.best ? 'var(--success-dark)' : 'var(--text-muted)',
                    }}>
                      {model.best ? <CheckCircle2 size={18} /> : <Database size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{model.name}</div>
                      <Badge
                        variant={model.best ? 'success' : model.status === 'not_trained' ? 'danger' : 'outline'}
                        size="sm"
                      >
                        {model.best ? 'Active Pipeline' : model.status === 'not_trained' ? 'Untrained' : 'Cold Storage'}
                      </Badge>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Accuracy</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                        {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>F1 Score</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                        {model.f1 ? `${(model.f1 * 100).toFixed(1)}%` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{
                  textAlign: 'center', padding: '32px 16px', fontSize: 13,
                  color: 'var(--text-muted)', fontWeight: 500,
                  border: '1.5px dashed var(--glass-border)', borderRadius: 14,
                }}>
                  No execution histories registered in vault.
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Feature Weights */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card title="Global Feature Weights" icon={<FileBarChart size={18} />}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 20px 0' }}>
              Aggregated Gini impurity reduction. Represents each variable's universal influence across the deployed model.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {featArray.length > 0 ? featArray.map(([feat, imp], i) => {
                const pct = (imp / featArray[0][1]) * 100;
                return (
                  <div key={feat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                        {feat.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        {(imp * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.08 }}
                        style={{
                          height: '100%', borderRadius: 99,
                          backgroundColor: BAR_COLORS[i] || '#d4d4d4',
                        }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div style={{
                  textAlign: 'center', padding: '32px 16px', fontSize: 13,
                  color: 'var(--text-muted)', fontWeight: 500,
                  border: '1.5px dashed var(--glass-border)', borderRadius: 14,
                }}>
                  Feature weight mapping currently absent.
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
