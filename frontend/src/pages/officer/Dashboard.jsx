import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Clock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfficerDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/officer/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (appId) => {
    try {
      const res = await apiClient.post(`/officer/assign/${appId}`);
      navigate('/officer/review', { state: { application: res.data } });
    } catch (err) {
      console.error('Assignment failed', err);
    }
  };

  const th = {
    fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    color: 'var(--text-faint)', padding: '10px 16px',
    borderBottom: '1px solid var(--glass-border)', textAlign: 'left',
    whiteSpace: 'nowrap',
  };
  const td = {
    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400,
    color: 'var(--text-muted)', padding: '12px 16px',
    borderBottom: '1px solid var(--glass-border)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Review Queue</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>FIFO priority queue – review and make final decisions on loan applications.</p>
        </div>
        <Button variant="secondary" onClick={fetchQueue} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Refresh Queue
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: 64, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--lime)' }} />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>Loading queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: 80, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, color: 'var(--success)' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Queue Cleared</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
                No pending applications in the review queue. Check back later.
              </p>
            </motion.div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Priority', 'Application ID', 'Amount (₹)', 'ML Prediction', 'Status', ''].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {queue.map((app, idx) => (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.08 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={td}>
                          {app.days_pending > 0 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}>
                              <AlertCircle size={14} />
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700 }}>CRITICAL: {app.days_pending}d</span>
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)' }}>
                              <Clock size={14} />
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700 }}>NEW</span>
                            </span>
                          )}
                        </td>
                        <td style={{ ...td, fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text)', fontSize: 11 }}>
                          LS-{app.id.toString().padStart(4, '0')}
                        </td>
                        <td style={{ ...td, fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>
                          ₹{app.loan_amount?.toLocaleString()}
                        </td>
                        <td style={td}>
                          {app.ml_prediction === 'Y' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '3px 10px' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, color: 'var(--success)' }}>Favorable</span>
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '3px 10px' }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)' }} />
                              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, color: 'var(--danger)' }}>High Risk</span>
                            </span>
                          )}
                        </td>
                        <td style={td}>
                          <Badge status={app.status}>{(app.status || 'pending').replace('_', ' ')}</Badge>
                        </td>
                        <td style={{ ...td, textAlign: 'right', borderBottom: idx === queue.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                          <Button
                            variant="primary"
                            style={{ padding: '7px 16px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            onClick={() => handleAssign(app.id)}>
                            Review <ArrowRight size={12} />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
