import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get('/applications/');
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <Badge variant="approved">APPROVED</Badge>;
      case 'rejected': return <Badge variant="rejected">REJECTED</Badge>;
      case 'under_review':
      case 'escalated':
      case 'submitted':
        return <Badge variant="review">IN REVIEW</Badge>;
      default: return <Badge>{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-heading font-black text-dark tracking-tight">My Applications</h2>
          <p className="text-sm font-body font-medium text-muted mt-2">Track the live status of your loan requests and AI predictions.</p>
        </div>
        <Button onClick={() => navigate('/applicant/apply')} className="gap-2 h-12 px-6 shadow-xl shadow-dark/10 group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> New Application
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-0 overflow-hidden border-2 border-border shadow-soft rounded-[32px]">
          {loading ? (
            <div className="p-24 text-center flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-lime" size={32} />
              <p className="text-muted font-bold text-xs uppercase tracking-widest">Querying Blockchain...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-24 text-center flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-3xl bg-page flex items-center justify-center mb-8 text-faint border-2 border-border shadow-inner"
              >
                <Plus size={40} />
              </motion.div>
              <h3 className="text-2xl font-black font-heading text-dark tracking-tighter">No Applications Found</h3>
              <p className="text-base font-body text-muted mt-4 max-w-sm mb-10 font-medium">
                You haven't submitted any loan requests. Apply now to get an instant ML-powered decision from our neural engine.
              </p>
              <Button onClick={() => navigate('/applicant/apply')} variant="primary" className="h-14 px-10 rounded-2xl shadow-2xl">Initialize Application Wizard</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-page/50">
                  <TableRow className="border-b-2 border-border">
                    <TableHead className="font-black text-dark uppercase tracking-widest text-[10px] py-6">Date</TableHead>
                    <TableHead className="font-black text-dark uppercase tracking-widest text-[10px] py-6">Amount</TableHead>
                    <TableHead className="font-black text-dark uppercase tracking-widest text-[10px] py-6">Purpose</TableHead>
                    <TableHead className="font-black text-dark uppercase tracking-widest text-[10px] py-6">AI Prediction</TableHead>
                    <TableHead className="font-black text-dark uppercase tracking-widest text-[10px] py-6">Final Status</TableHead>
                    <TableHead className="font-black text-dark uppercase tracking-widest text-[10px] py-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app, idx) => (
                    <motion.tr 
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="group hover:bg-page/30 transition-colors border-b border-border last:border-0"
                    >
                      <TableCell className="font-bold text-dark py-6">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono font-bold py-6">${app.loan_amount?.toLocaleString()}</TableCell>
                      <TableCell className="capitalize py-6 font-medium">{app.purpose || 'Personal'}</TableCell>
                      <TableCell className="py-6">
                        {app.ml_prediction === 'Y' ? (
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                             <span className="text-success font-black text-xs uppercase">Favorable</span>
                          </div>
                        ) : app.ml_prediction === 'N' ? (
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                             <span className="text-danger font-black text-xs uppercase">High Risk</span>
                          </div>
                        ) : (
                          <span className="text-muted font-bold text-xs uppercase">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="py-6">{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right py-6">
                        <Button 
                          variant="outline" 
                          className="h-10 px-4 text-xs font-black uppercase tracking-widest gap-2 bg-white border-2 hover:bg-dark hover:text-white hover:border-dark transition-all"
                          onClick={() => navigate('/applicant/result', { state: { application: app } })}
                        >
                          View Logic <ArrowRight size={14} strokeWidth={3} />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
