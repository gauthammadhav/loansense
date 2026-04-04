import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/client';
import { AnimatedTable } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { FileText, CheckCircle, Clock, PlusCircle, ArrowRight } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

function StatCard({ icon, label, value, color, pulse }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: 'white',
        border: '1px solid var(--glass-border)',
        borderRadius: 20,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <motion.div
          animate={pulse ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 46, height: 46, borderRadius: 12,
            border: '1px solid var(--glass-border)',
            backgroundColor: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, boxShadow: 'var(--shadow-sm)',
          }}
        >
          {icon}
        </motion.div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 38, lineHeight: 1, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>
          {value.toLocaleString()}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>{label}</p>
      </div>
      {/* Hover glow */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0, backgroundColor: color, filter: 'blur(40px)', pointerEvents: 'none', transition: 'opacity 0.4s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.06'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
      />
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [applications, setApplications] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/applications');
        const apps = res.data;
        setApplications(apps);
        setStats({
          total: apps.length,
          approved: apps.filter(a => a.status === 'approved' || a.ml_prediction === 'Y').length,
          pending: apps.filter(a => a.status === 'pending').length,
        });
      } catch (e) {
        console.error('Dashboard fetch error', e);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 28 : 38, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 8px 0', lineHeight: 1.1 }}>
          Welcome back,{' '}
          <span style={{ color: 'var(--lime-dark)' }}>
            {user?.full_name || user?.email?.split('@')?.[0] || 'Applicant'}
          </span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400, margin: 0 }}>
          Here is the latest overview of your workspace.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 20 }}>
        <StatCard icon={<FileText size={20} />} label="Total Applications" value={stats.total} color="var(--info)" />
        <StatCard icon={<CheckCircle size={20} />} label="Approved Loans" value={stats.approved} color="var(--success)" />
        <StatCard icon={<Clock size={20} />} label="Pending Verification" value={stats.pending} color="var(--warning)" pulse={stats.pending > 0} />
      </div>

      {/* Action card */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 20 }}>
        <motion.div
          whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/applicant/apply')}
          style={{
            backgroundColor: 'white', border: '1px solid var(--glass-border)',
            borderRadius: 20, padding: 28, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s',
            display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, backgroundColor: 'rgba(200,241,53,0.12)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />
          <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(200,241,53,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lime-dark)' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', margin: '0 0 6px 0' }}>Start Application Pipeline</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>Initialize a new application request using our 5-step ML verification wizard.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--lime-dark)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
            Get started <ArrowRight size={14} />
          </div>
        </motion.div>
      </div>

      {/* Applications table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div style={{
          backgroundColor: 'white', border: '1px solid var(--glass-border)',
          borderRadius: isMobile ? 16 : 20, padding: isMobile ? 16 : 28, boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text)', margin: '0 0 20px 0' }}>
            Applications History
          </h2>
          <div className={isMobile ? 'table-scroll-mobile' : ''}>
          <AnimatedTable
            data={applications}
            columns={[
              { key: 'id', label: 'ID', render: (row) => <Badge variant="outline">#{row.id}</Badge> },
              { key: 'loan_amount', label: 'Amount', format: formatCurrency },
              {
                key: 'status', label: 'Status', render: (row) => (
                  <Badge
                    variant={row.ml_prediction === 'Y' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'}
                    pulse={row.status === 'pending'}
                  >
                    {row.status === 'pending' ? 'Pending' : row.ml_prediction === 'Y' ? 'Approved' : 'Rejected'}
                  </Badge>
                )
              },
              { key: 'submitted_at', label: 'Submission Date', render: (row) => new Date(row.submitted_at).toLocaleDateString() }
            ]}
            onRowClick={(app) => navigate(`/applicant/result/${app.id}`)}
          />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
