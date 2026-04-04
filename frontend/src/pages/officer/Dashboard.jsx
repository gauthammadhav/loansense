import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, AlertTriangle, CheckCircle2, Activity, UserCheck, Users,
  TrendingUp, RefreshCw, ArrowRight, Eye, Search, ChevronDown,
  BarChart2, Inbox, Info, X
} from 'lucide-react';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useIsMobile } from '../../hooks/useIsMobile';

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatINR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const formatNum = (v) => new Intl.NumberFormat('en-IN').format(v || 0);

const timeAgo = (iso) => {
  if (!iso) return '—';
  const hrs = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (hrs < 1) return `${Math.round(hrs * 60)}m ago`;
  if (hrs < 24) return `${Math.round(hrs)}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const priorityMeta = (hours) => {
  if (hours > 24) return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'SLA Breach', dot: '🔴' };
  if (hours > 2)  return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium', dot: '🟡' };
  return              { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Normal',  dot: '⚪' };
};

const avatarInitials = (name) => {
  if (!name || name === '—') return '?';
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#be185d'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ icon, label, value, sub, color = 'var(--lime-dark)', pulse = false, onClick, glow = false }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      style={{
        backgroundColor: 'white', border: '1px solid var(--glass-border)',
        borderRadius: 20, padding: '22px 24px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
        cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s',
        position: 'relative', overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {glow && (
        <div style={{ position: 'absolute', right: -12, bottom: -12, width: 72, height: 72, backgroundColor: color, borderRadius: '50%', opacity: 0.1, filter: 'blur(16px)', pointerEvents: 'none' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ color, opacity: 0.9 }}>{icon}</div>
        {pulse && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 30, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none', cursor: 'pointer',
          backgroundColor: 'white', border: '1px solid var(--glass-border)',
          borderRadius: 10, padding: '8px 36px 8px 14px',
          fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
    </div>
  );
}

function QuickPreview({ app, onClose, onAssignAndReview }) {
  if (!app) return null;
  const pri = priorityMeta(app.waiting_hours || 0);
  const income = app.applicant_income || 0;
  const loanAmt = app.loan_amount || 0;
  const tenure = app.loan_amount_term || 1;
  const emi = tenure > 0 ? loanAmt / tenure : 0;
  const dti = income > 0 ? emi / income : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, maxWidth: 640, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: avatarColor(app.applicant_name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
              {avatarInitials(app.applicant_name)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>{app.applicant_name || `APP-${app.id}`}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Application #{app.id} · {timeAgo(app.submitted_at)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge variant={app.ml_prediction === 'Y' ? 'success' : 'danger'}>
              {app.ml_prediction === 'Y' ? '✓ Approve' : '✗ Reject'}
            </Badge>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
          </div>
        </div>

        {/* Priority banner */}
        {app.sla_breached && (
          <div style={{ padding: '10px 14px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <AlertTriangle size={15} /> This application has breached the 24-hour SLA ({app.waiting_hours?.toFixed(0)}h waiting)
          </div>
        )}

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {[
            { label: 'Loan Amount', value: formatINR(app.loan_amount) },
            { label: 'Tenure', value: `${app.loan_amount_term} months` },
            { label: 'Monthly Income', value: formatINR(app.applicant_income) },
            { label: 'Credit Score', value: app.credit_score },
            { label: 'Proposed EMI', value: formatINR(emi) },
            { label: 'DTI Ratio', value: `${(dti * 100).toFixed(1)}%`, color: dti > 0.6 ? '#ef4444' : undefined },
            { label: 'ML Confidence', value: `${((app.ml_confidence || 0) * 100).toFixed(1)}%` },
            { label: 'Risk Band', value: app.ml_risk_band || '—' },
          ].map(row => (
            <div key={row.label} style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: row.color || 'var(--text)' }}>{row.value}</div>
            </div>
          ))}
        </div>

        {/* Confidence bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Model Confidence</span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{((app.ml_confidence || 0) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(app.ml_confidence || 0) * 100}%`, backgroundColor: app.ml_confidence > 0.7 ? 'var(--success)' : '#f59e0b', borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          {app.status === 'submitted' && (
            <Button variant="primary" onClick={() => onAssignAndReview(app.id)}>
              Assign & Review <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </Button>
          )}
          {app.status === 'under_review' && (
            <Button variant="primary" onClick={() => onAssignAndReview(app.id)}>
              Open Review <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [stats, setStats] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('oldest');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const [previewApp, setPreviewApp] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get('/officer/dashboard-stats');
      setStats(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchQueue = useCallback(async (filter = statusFilter, sort = sortBy) => {
    setQueueLoading(true);
    try {
      const res = await apiClient.get(`/officer/queue?status_filter=${filter}&sort_by=${sort}`);
      setQueue(res.data || []);
    } catch (e) { console.error(e); }
    finally { setQueueLoading(false); }
  }, [statusFilter, sortBy]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchQueue()]);
    setLoading(false);
  }, [fetchStats, fetchQueue]);

  useEffect(() => {
    loadAll();
    intervalRef.current = setInterval(() => { fetchStats(); fetchQueue(); }, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    fetchQueue(statusFilter, sortBy);
  }, [statusFilter, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleAssign = async (appId) => {
    setAssigningId(appId);
    try {
      const res = await apiClient.post(`/officer/assign/${appId}`);
      navigate(`/officer/review/${appId}`, { state: { application: res.data } });
    } catch (e) { console.error('Assignment failed', e); }
    finally { setAssigningId(null); }
  };

  const handleAssignAndPreview = async (appId) => {
    setPreviewApp(null);
    await handleAssign(appId);
  };

  const handleBulkAssign = async () => {
    if (!selected.length) return;
    setBulkAssigning(true);
    try {
      await apiClient.post('/officer/bulk-assign', { application_ids: selected });
      setSelected([]);
      await Promise.all([fetchStats(), fetchQueue()]);
    } catch (e) { console.error(e); }
    finally { setBulkAssigning(false); }
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(filtered.map(a => a.id));
  const clearSelect = () => setSelected([]);

  // Filter by search
  const filtered = queue.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.applicant_name || '').toLowerCase().includes(q) ||
      String(a.id).includes(q) ||
      (a.purpose || '').toLowerCase().includes(q)
    );
  });

  // Loading screen
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '2.5px solid var(--lime)', borderTopColor: 'transparent' }} />
        <span style={{ color: 'var(--lime-dark)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Syncing Pipeline…</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 32 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 16 : 0, borderBottom: '1px solid var(--glass-border)', paddingBottom: 24 }}>
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
            <span style={{ color: '#d97706', fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Live Action Queue</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 26 : 34, fontWeight: 900, color: 'var(--text)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Decision Pipeline</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Applications awaiting review and officer decisions.</p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={handleRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', backgroundColor: 'white', border: '1px solid var(--glass-border)', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}
        >
          <RefreshCw size={15} style={{ transition: 'transform 0.6s', transform: refreshing ? 'rotate(360deg)' : 'none' }} />
          Refresh
        </motion.button>
      </div>

      {/* ── KPI Cards ── */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 18 }}
        >
          <KPICard icon={<Clock size={22} />} label="Pending Review" value={stats.pending_count} sub="waiting for assignment" color="#f59e0b" pulse={stats.pending_count > 5} glow onClick={() => setStatusFilter('pending')} />
          <KPICard icon={<Users size={22} />} label="Assigned to Me" value={stats.assigned_to_me} sub="under your review" color="#3b82f6" onClick={() => setStatusFilter('my_queue')} />
          <KPICard icon={<CheckCircle2 size={22} />} label="Completed Today" value={stats.completed_today} sub={`${stats.approval_rate_today}% approved`} color="var(--success)" glow />
          <KPICard icon={<TrendingUp size={22} />} label="Avg Decision Time" value={`${stats.avg_decision_minutes}m`} sub="from submission to decision" color="var(--lime-dark)" />
        </motion.div>
      )}

      {/* ── SLA Alert Banner ── */}
      <AnimatePresence>
        {stats?.sla_breached_count > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '14px 18px', borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontWeight: 600, fontSize: 13 }}>
              <AlertTriangle size={17} />
              {stats.sla_breached_count} application{stats.sla_breached_count > 1 ? 's' : ''} ha{stats.sla_breached_count > 1 ? 've' : 's'} breached the 24-hour SLA and need immediate attention.
            </div>
            <button onClick={() => setStatusFilter('sla_breach')} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '5px 12px', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              View SLA Queue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Queue Table ── */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ backgroundColor: 'white', border: '1px solid var(--glass-border)', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>

          {/* Controls bar */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            {/* Left: title + filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', margin: 0 }}>Application Queue</h3>
              <SelectFilter
                value={statusFilter}
                onChange={v => { setStatusFilter(v); setSelected([]); }}
                options={[
                  { value: 'pending', label: `⏳ Pending (${stats?.pending_count ?? '…'})` },
                  { value: 'under_review', label: `👁 Under Review (${stats?.under_review_count ?? '…'})` },
                  { value: 'my_queue', label: `👤 My Queue (${stats?.assigned_to_me ?? '…'})` },
                  { value: 'sla_breach', label: `🚨 SLA Breached (${stats?.sla_breached_count ?? '…'})` },
                  { value: 'all', label: '📋 All Applications' },
                ]}
              />
              <SelectFilter
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'oldest', label: '🕐 Oldest First (FIFO)' },
                  { value: 'newest', label: '🕑 Newest First' },
                  { value: 'amount', label: '💰 Highest Amount' },
                  { value: 'risk', label: '⚠ Highest Risk' },
                ]}
              />
            </div>

            {/* Right: search + bulk */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or ID…"
                  style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 13, backgroundColor: '#f8fafc', outline: 'none', fontFamily: 'inherit', width: 180 }}
                />
              </div>
              {selected.length > 0 && (
                <Button variant="primary" onClick={handleBulkAssign} loading={bulkAssigning} icon={<UserCheck size={15} />}>
                  Assign {selected.length} to Me
                </Button>
              )}
              {filtered.length > 0 && selected.length === 0 && statusFilter === 'pending' && (
                <button onClick={selectAll} style={{ fontSize: 12, fontWeight: 600, color: 'var(--lime-dark)', background: 'none', border: 'none', cursor: 'pointer' }}>Select All</button>
              )}
              {selected.length > 0 && (
                <button onClick={clearSelect} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
              )}
            </div>
          </div>

          {/* Table */}
          {queueLoading ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <Activity size={24} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              Loading queue…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Inbox size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: 0 }}>Queue is clear</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
                {search ? 'No applications match your search.' : 'No applications in this filter.'}
              </p>
              <Button variant="secondary" onClick={handleRefresh}>Refresh Pipeline</Button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                    {['', 'ID', 'Applicant', 'Loan Details', 'AI Recommendation', 'Wait Time', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', textAlign: 'left', whiteSpace: 'nowrap', backgroundColor: '#fafafa' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((app, idx) => {
                      const pri = priorityMeta(app.waiting_hours || 0);
                      const isSelected = selected.includes(app.id);
                      const emi = app.loan_amount_term > 0 ? app.loan_amount / app.loan_amount_term : 0;

                      return (
                        <motion.tr
                          key={app.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          style={{
                            borderBottom: '1px solid var(--glass-border)',
                            backgroundColor: isSelected ? 'rgba(200,241,53,0.05)' : 'white',
                            cursor: 'pointer',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white'; }}
                          onClick={() => setPreviewApp(app)}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '14px 8px 14px 16px', width: 36 }} onClick={e => e.stopPropagation()}>
                            {app.status === 'submitted' && (
                              <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(app.id)}
                                style={{ width: 15, height: 15, accentColor: 'var(--lime-dark)', cursor: 'pointer' }} />
                            )}
                          </td>

                          {/* ID */}
                          <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>
                              #{app.id}
                            </span>
                          </td>

                          {/* Applicant */}
                          <td style={{ padding: '14px 16px', minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                backgroundColor: avatarColor(app.applicant_name),
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: 13,
                              }}>
                                {avatarInitials(app.applicant_name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{app.applicant_name || `APP-${app.id}`}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{app.purpose || '—'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Loan Details */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'monospace', color: 'var(--text)', marginBottom: 2 }}>{formatINR(app.loan_amount)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.loan_amount_term}m · EMI {formatINR(emi)}</div>
                          </td>

                          {/* AI Recommendation */}
                          <td style={{ padding: '14px 16px', minWidth: 180 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <Badge variant={app.ml_prediction === 'Y' ? 'success' : 'danger'}>
                                {app.ml_prediction === 'Y' ? '✓ Approve' : '✗ Reject'}
                              </Badge>
                              {/* Confidence bar */}
                              <div>
                                <div style={{ height: 5, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden', width: 120 }}>
                                  <div style={{ height: '100%', width: `${(app.ml_confidence || 0) * 100}%`, backgroundColor: app.ml_confidence > 0.7 ? 'var(--success)' : '#f59e0b', borderRadius: 99 }} />
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{((app.ml_confidence || 0) * 100).toFixed(0)}% conf · {app.ml_risk_band} risk</div>
                              </div>
                            </div>
                          </td>

                          {/* Wait Time */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: pri.color }}>
                                {pri.dot} {(app.waiting_hours || 0).toFixed(0)}h
                              </div>
                              {app.sla_breached && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SLA Breach</span>
                              )}
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(app.submitted_at)}</div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setPreviewApp(app)}
                                title="Quick Preview"
                                style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                              >
                                <Eye size={15} />
                              </button>
                              {app.status === 'submitted' && (
                                <Button
                                  variant="primary"
                                  style={{ height: 34, padding: '0 14px', fontSize: 12 }}
                                  loading={assigningId === app.id}
                                  onClick={() => handleAssign(app.id)}
                                  icon={<UserCheck size={14} />}
                                >
                                  Assign
                                </Button>
                              )}
                              {app.status === 'under_review' && (
                                <Button
                                  variant="secondary"
                                  style={{ height: 34, padding: '0 14px', fontSize: 12 }}
                                  onClick={() => navigate(`/officer/review/${app.id}`, { state: { application: app } })}
                                >
                                  Review <ArrowRight size={13} style={{ marginLeft: 4 }} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
              {/* Footer */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Showing <strong>{filtered.length}</strong> application{filtered.length !== 1 ? 's' : ''}
                  {selected.length > 0 && ` · ${selected.length} selected`}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-refreshes every 30s</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Risk Distribution mini stats ── */}
      {stats?.risk_distribution && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}
        >
          {[
            { band: 'Low', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
            { band: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
            { band: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
            { band: 'Very High', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.25)' },
          ].map(({ band, color, bg, border }) => (
            <div key={band} style={{ padding: '16px 20px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{band} Risk</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 26, color, lineHeight: 1 }}>{stats.risk_distribution[band] ?? 0}</div>
              </div>
              <BarChart2 size={22} style={{ color, opacity: 0.5 }} />
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Quick Preview Modal ── */}
      <AnimatePresence>
        {previewApp && (
          <QuickPreview
            app={previewApp}
            onClose={() => setPreviewApp(null)}
            onAssignAndReview={handleAssignAndPreview}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
