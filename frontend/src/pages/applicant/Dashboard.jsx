import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/client';
import { Card, ActionCard } from '../../components/ui/Card';
import { AnimatedTable } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

import { FileText, CheckCircle, Clock, PlusCircle } from 'lucide-react';

function StatCard({ icon, label, value, color, pulse }) {
  return (
    <motion.div
      className="glass-card p-6 relative overflow-hidden group"
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <motion.div 
          className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center bg-white/5"
          style={{ color }}
          animate={pulse ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      </div>
      <div className="relative z-10">
        <div className="text-[40px] leading-none font-heading font-extrabold text-white mb-2">
          {value.toLocaleString()}
        </div>
        <p className="text-sm text-text-muted font-medium">{label}</p>
      </div>
      {/* Dynamic interactive glow mapping to the color property */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl pointer-events-none" style={{ backgroundColor: color }} />
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/applications');
        const apps = res.data;
        setApplications(apps);
        setStats({
          total: apps.length,
          approved: apps.filter(a => a.status === 'approved' || a.ml_prediction === 'Y').length,
          pending: apps.filter(a => a.status === 'pending').length
        });
      } catch (e) {
        console.error("Dashboard fetch error", e);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
        <h1 className="text-[40px] tracking-tight font-heading font-extrabold mb-2">
          Welcome back, <span className="text-lime">{user?.full_name || user?.email?.split('@')?.[0] || 'Applicant'}</span>
        </h1>
        <p className="text-text-muted text-lg font-light">Here is the latest overview of your workspace.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<FileText />} label="Total Applications" value={stats.total} color="var(--info)" />
        <StatCard icon={<CheckCircle />} label="Approved Loans" value={stats.approved} color="var(--success)" />
        <StatCard icon={<Clock />} label="Pending Verification" value={stats.pending} color="var(--warning)" pulse={stats.pending > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="Start Application Pipeline"
          description="Initialize a new application request using our 5-step ML verification wizard."
          icon={<PlusCircle size={24} />}
          onClick={() => navigate('/applicant/apply')}
          glowColor="var(--lime)"
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card title="Applications History">
          <AnimatedTable
            data={applications}
            columns={[
              { key: 'id', label: 'ID', render: (row) => <Badge variant="outline">#{row.id}</Badge> },
              { key: 'loan_amount', label: 'Amount', format: formatCurrency },
              { key: 'status', label: 'Status', render: (row) => (
                  <Badge variant={row.ml_prediction === 'Y' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'} pulse={row.status === 'pending'}>
                    {row.status === 'pending' ? 'Pending' : row.ml_prediction === 'Y' ? 'Approved' : 'Rejected'}
                  </Badge>
                ) 
              },
              { key: 'submitted_at', label: 'Submission Date', render: (row) => new Date(row.submitted_at).toLocaleDateString() }
            ]}
            onRowClick={(app) => navigate(`/applicant/result/${app.id}`)}
          />
        </Card>
      </motion.div>
    </div>
  );
}
