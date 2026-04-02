import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, AlertTriangle, Activity, UserCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AnimatedTable } from '../../components/ui/Table';

export default function OfficerDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
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
      navigate(`/officer/review/${appId}`, { state: { application: res.data } });
    } catch (err) {
      console.error("Assignment failed", err);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-warning font-bold text-xs tracking-widest uppercase">Live Action Queue</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-white">Decision Pipeline</h1>
          <p className="text-text-muted mt-2">Applications awaiting manual review and final decision overrides.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-4">
           <div className="bg-dark2 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Pending</span>
                <span className="text-2xl font-bold font-mono text-white tracking-tight">{queue.length}</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <Clock size={20} />
             </div>
           </div>
           <div className="bg-dark2 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">SLA Risks</span>
                <span className="text-2xl font-bold font-mono text-white tracking-tight">{queue.filter(q => q.days_pending > 2).length}</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
                <AlertTriangle size={20} />
             </div>
           </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-0 overflow-hidden bg-dark2/50 backdrop-blur-xl border-white/10">
          {loading ? (
             <div className="p-20 flex flex-col items-center justify-center gap-4">
               <Activity className="text-lime animate-spin opacity-50" size={32} />
               <span className="text-sm font-bold tracking-widest text-lime uppercase">Syncing Pipeline...</span>
             </div>
          ) : queue.length === 0 ? (
            <div className="p-20 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6 text-success shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                <Clock size={32} />
              </div>
              <h3 className="text-2xl font-black font-heading text-white">Inbox Zero</h3>
              <p className="text-text-muted mt-2 max-w-sm mb-8">
                All applications have been processed. The global risk queue is currently clear.
              </p>
              <Button variant="secondary" onClick={fetchQueue}>Refresh Pipeline</Button>
            </div>
          ) : (
            <div className="overflow-x-auto p-2">
              <AnimatedTable 
                data={queue}
                columns={[
                  { key: 'sla', label: 'Priority SLA', render: (app) => (
                      app.days_pending > 0 ? (
                        <div className="flex items-center gap-2 text-danger font-bold text-xs"><AlertTriangle size={14}/>{app.days_pending} Days Overdue</div>
                      ) : (
                        <div className="flex items-center gap-2 text-text-muted font-bold text-xs"><Clock size={14}/>Normal</div>
                      )
                    ) 
                  },
                  { key: 'id', label: 'Applicant', render: (app) => (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><UserCircle size={16} /></div>
                         <span className="font-mono text-white font-bold tracking-wider">APP-{app.id.toString().padStart(4, '0')}</span>
                      </div>
                    ) 
                  },
                  { key: 'loan_amount', label: 'Exposure', render: (app) => (
                      <span className="font-mono font-bold tracking-tight text-white">{formatCurrency(app.loan_amount)}</span>
                    ) 
                  },
                  { key: 'ml', label: 'Machine Inference', render: (app) => (
                      <Badge variant={app.ml_prediction === 'Y' ? 'success' : 'danger'} pulse={app.ml_prediction === 'N'} className="shadow-lg">
                        {app.ml_prediction === 'Y' ? 'FAVORABLE' : 'HIGH RISK'}
                      </Badge>
                    ) 
                  },
                  { key: 'action', label: 'Action', render: (app) => (
                      <div className="flex justify-end">
                        <Button 
                          variant="primary" 
                          className="h-9 px-5 text-xs text-dark bg-lime hover:bg-[#b0d829]"
                          onClick={(e) => { e.stopPropagation(); handleAssign(app.id); }}
                        >
                          Audit <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    ) 
                  }
                ]}
                onRowClick={(app) => handleAssign(app.id)}
              />
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
