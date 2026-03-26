import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Activity, Database, Server, Settings, Zap } from 'lucide-react';

export default function OfficerAnalytics() {
  const [modelCurrent, setModelCurrent] = useState(null);
  const [modelQueue, setModelQueue]     = useState(null);
  const [modelHistory, setModelHistory] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [currRes, queueRes, histRes, appRes] = await Promise.all([
        apiClient.get('/model/current').catch(() => ({ data: {} })),
        apiClient.get('/model/queue-status').catch(() => ({ data: {} })),
        apiClient.get('/model/comparison').catch(() => ({ data: [] })),
        apiClient.get('/officer/applications').catch(() => ({ data: [] })),
      ]);
      setModelCurrent(currRes.data);
      setModelQueue(queueRes.data);
      setModelHistory(histRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const forceRetrain = async () => {
    try {
      await apiClient.post('/model/retrain');
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const biasData = React.useMemo(() => {
    const stats = { Male: { total: 0, approved: 0 }, Female: { total: 0, approved: 0 }, Other: { total: 0, approved: 0 } };
    applications.forEach(app => {
      const g = app.gender || 'Other';
      if (!stats[g]) stats[g] = { total: 0, approved: 0 };
      stats[g].total += 1;
      if (app.ml_prediction === 'Y') stats[g].approved += 1;
    });
    return Object.keys(stats)
      .map(gender => ({
        name: gender,
        rate: stats[gender].total > 0 ? +((stats[gender].approved / stats[gender].total) * 100).toFixed(1) : 0,
        total: stats[gender].total,
      }))
      .filter(d => d.total > 0);
  }, [applications]);

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-faint)' }}>
        Loading analytics...
      </div>
    );
  }

  const queuePct = modelQueue?.threshold ? Math.min(100, (modelQueue.queued / modelQueue.threshold) * 100) : 0;
  const tooltipStyle = {
    borderRadius: 10,
    border: '1px solid var(--glass-border)',
    background: '#131318',
    fontSize: 11,
    fontFamily: 'var(--font-body)',
    color: 'var(--text)',
  };

  const th = {
    fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    color: 'var(--text-faint)', padding: '10px 16px',
    borderBottom: '1px solid var(--glass-border)', textAlign: 'left',
  };
  const td = {
    fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)',
    padding: '12px 16px', borderBottom: '1px solid var(--glass-border)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
          System Analytics & MLOps
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Monitor model drift, queue thresholds, and bias audits.
        </p>
      </motion.div>

      {/* KPI row */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {/* Active Model */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime)', flexShrink: 0 }}>
              <Server size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)', marginBottom: 4 }}>Active Model</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{modelCurrent?.version || 'v1.0'}</div>
            </div>
          </div>

          {/* Status */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)', marginBottom: 4 }}>Uptime</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{modelCurrent?.status || 'Online'}</div>
            </div>
          </div>

          {/* F1 Score */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', flexShrink: 0 }}>
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)', marginBottom: 4 }}>Applications</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{applications.length}</div>
            </div>
          </div>

          {/* Queue progress */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14, gridColumn: 'span 1' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,241,53,0.06)', border: '1px solid rgba(200,241,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime-dark)', flexShrink: 0 }}>
              <Database size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)' }}>Retrain Queue</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, color: 'var(--text)' }}>
                  {modelQueue?.queued || 0}/{modelQueue?.threshold || 50}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${queuePct}%`, background: queuePct >= 100 ? 'var(--lime)' : 'var(--lime-dark)', transition: 'width 0.5s ease' }} />
              </div>
              {queuePct >= 100 && (
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, color: 'var(--lime)', marginTop: 4 }}>Threshold reached — retrain imminent</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Bias Audit Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>Bias Audit</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>Approval Rate by Gender</div>
              </div>
              <Badge status="submitted">Gender</Badge>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={biasData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-ui)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-ui)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <RechartsTooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-faint)', fontWeight: 700, marginBottom: 4 }} formatter={(v) => [`${v}%`, 'Approval Rate']} />
                  <Bar dataKey="rate" maxBarSize={48} radius={[4, 4, 0, 0]}>
                    {biasData.map((_, i) => (
                      <Cell key={i} fill="rgba(200,241,53,0.55)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {biasData.length === 0 && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)' }}>No data yet — submit applications to see bias analysis.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* MLOps Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 4 }}>
              Automated Pipeline
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>MLOps Controls</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 24, flexGrow: 1 }}>
              The prediction engine monitors verified outcomes. Once the buffer hits {modelQueue?.threshold || 50} records, it fits a new XGBoost model, checks F1 against the baseline, and hot-swaps it into production if superior.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Force Manual Retrain</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-faint)' }}>
                    Bypass threshold ({modelQueue?.next_retrain_in ?? '—'} records remaining)
                  </div>
                </div>
                <Button variant="secondary" onClick={forceRetrain} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Settings size={13} /> Trigger Fit
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Model History Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 2 }}>Registry</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Model Version History</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Model ID', 'File', 'Accuracy', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {modelHistory.length > 0 ? modelHistory.map((model, i) => (
                  <tr key={model.name}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--glass)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...td, fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text)', fontSize: 11, borderBottom: i === modelHistory.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                      {model.name}
                    </td>
                    <td style={{ ...td, borderBottom: i === modelHistory.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>{model.file || 'N/A'}</td>
                    <td style={{ ...td, fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text)', borderBottom: i === modelHistory.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                      {model.accuracy ? `${(model.accuracy * 100).toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ ...td, borderBottom: i === modelHistory.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                      <Badge status={model.status === 'not_trained' ? 'rejected' : 'approved'}>
                        {model.status === 'not_trained' ? 'Uninitialized' : 'Ready'}
                      </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ ...td, textAlign: 'center', padding: 32, border: 'none' }}>
                      No historical models found in registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
