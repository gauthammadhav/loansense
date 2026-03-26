import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ArrowRight, Clock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfficerDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

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
      navigate(`/officer/review`, { state: { application: res.data } });
    } catch (err) {
      console.error("Assignment failed", err);
    }
  };

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-heading font-black text-dark tracking-tight">Priority Review Queue</h2>
          <p className="text-sm font-body font-bold text-muted mt-2 uppercase tracking-widest">
            Audit-Ready FIFO Processing Layer
          </p>
        </div>
        <Button variant="outline" className="h-12 px-6 border-2 font-black uppercase tracking-widest text-[10px]" onClick={fetchQueue}>
           Force Refresh
        </Button>
      </motion.div>

      <Card className="p-0 overflow-hidden border-2 border-border shadow-soft rounded-[40px]">
        {loading ? (
          <div className="p-32 text-center flex flex-col items-center gap-6">
            <Loader2 className="animate-spin text-dark" size={40} />
            <p className="text-muted font-black text-xs uppercase tracking-widest animate-pulse">Synchronizing Data Streams...</p>
          </div>
        ) : queue.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-32 text-center flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-[32px] bg-success/10 flex items-center justify-center mb-10 text-success border-2 border-success/20 shadow-xl shadow-success/5">
              <ShieldCheck size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black font-heading text-dark tracking-tight">System Status: Cleared</h3>
            <p className="text-base font-body text-muted mt-4 max-w-sm font-bold opacity-80 italic">
              "No pending applications assigned to this domain. Queue has been fully optimized."
            </p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-page/50">
                <TableRow className="border-b-2 border-border">
                  <TableHead className="font-black text-dark uppercase tracking-[0.2em] text-[10px] py-8">SLA Priority</TableHead>
                  <TableHead className="font-black text-dark uppercase tracking-[0.2em] text-[10px] py-8">Application Vector</TableHead>
                  <TableHead className="font-black text-dark uppercase tracking-[0.2em] text-[10px] py-8">Quantum</TableHead>
                  <TableHead className="font-black text-dark uppercase tracking-[0.2em] text-[10px] py-8 text-center">Inference Engine</TableHead>
                  <TableHead className="font-black text-dark uppercase tracking-[0.2em] text-[10px] py-8">Audit State</TableHead>
                  <TableHead className="font-black text-dark uppercase tracking-[0.2em] text-[10px] py-8 text-right">Execution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {queue.map((app, idx) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.08 }}
                      className="group border-b border-border last:border-0 hover:bg-page/50 transition-all cursor-default"
                    >
                      <TableCell className="py-8">
                        {app.days_pending > 0 ? (
                          <div className="flex items-center gap-2 text-danger font-black text-xs scale-105">
                             <AlertCircle size={16} strokeWidth={3} />
                             <span>CRITICAL: {app.days_pending}D</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted font-black text-xs opacity-60">
                             <Clock size={16} />
                             <span>NOMINAL (NEW)</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-black text-dark font-mono text-[11px] py-8 tracking-tighter">
                        ID_{app.id.toString().padStart(6, '0')}
                      </TableCell>
                      <TableCell className="py-8 font-black text-dark text-lg tracking-tighter">${app.loan_amount.toLocaleString()}</TableCell>
                      <TableCell className="py-8 text-center">
                        {app.ml_prediction === 'Y' ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-success/15 border border-success/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
                             <span className="text-success font-black text-[10px] uppercase tracking-widest">Favorable</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-danger/15 border border-danger/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-danger shadow-[0_0_8px_var(--danger)]" />
                             <span className="text-danger font-black text-[10px] uppercase tracking-widest">High risk</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-8">
                        {app.status === 'under_review' ? (
                          <Badge variant="review" className="shadow-lg">LOCK_REVIEW</Badge>
                        ) : (
                          <Badge className="bg-white border-2 border-border text-faint">QUEUED</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-8">
                        <Button 
                          variant="primary" 
                          className="h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-dark/10 group bg-dark text-white hover:bg-lime hover:text-dark transition-all duration-500 border-0"
                          onClick={() => handleAssign(app.id)}
                        >
                          Review Matrix <ArrowRight size={14} strokeWidth={3} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
