import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, FileText, History, Activity, AlertCircle, Calculator, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShapChart } from '../../components/ui/ShapChart';

export default function OfficerReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application;

  const [audits, setAudits] = useState([]);
  const [decision, setDecision] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (application) fetchAudits(application.id);
  }, [application]);

  const fetchAudits = async (id) => {
    try {
      const res = await apiClient.get(`/applications/${id}/audit`);
      setAudits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async () => {
    if (!decision) return;
    if (decision !== application.ml_prediction && !overrideReason.trim()) {
      setError("An override reason MUST be provided when diverging from the ML algorithm.");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/officer/decide/${application.id}`, { decision, override_reason: overrideReason });
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit final decision.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-text-muted mb-4 font-medium">No application selected for manual review.</p>
        <Button onClick={() => navigate('/officer/dashboard')} variant="secondary">Back to Queue</Button>
      </div>
    );
  }

  let parsedShap = {};
  let formData = {};
  
  try {
    const raw = typeof application.shap_values === 'string' ? JSON.parse(application.shap_values) : application.shap_values;
    parsedShap = raw?.shap || {};
    formData = raw?.form_data || {};
  } catch (e) {}

  const isFavorable = application.ml_prediction === 'Y';
  const needsOverride = decision && decision !== application.ml_prediction;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Auto-calculated derived on flight
  const newEmi = formData.loan_amount && formData.loan_tenure_months ? formData.loan_amount / formData.loan_tenure_months : 0;
  const dti = formData.monthly_income ? ((formData.total_existing_emi || 0) + newEmi) / formData.monthly_income : 0;
  const disposable = (formData.monthly_income || 0) - (formData.monthly_expenses || 0) - (formData.total_existing_emi || 0) - newEmi;

  const getShapText = (key) => {
    const map = {
      'monthly_income': 'Income Amount', 'monthly_expenses': 'Living Expenses',
      'loan_amount': 'Loan Size', 'loan_tenure_months': 'Repayment Tenure',
      'credit_score': 'Credit Score', 'existing_loans_count': 'Num of Loans',
      'total_existing_emi': 'Active EMI Load', 'employment_type': 'Work Profile',
      'employment_years': 'Job Stability', 'late_payment_history': 'Missed Payments',
      'new_emi': 'New Requested EMI', 'debt_to_income': 'DTI Ratio', 'disposable_income': 'Free Cash Flow'
    };
    return map[key] || key.replace(/_/g, ' ');
  };

  const shapArray = Object.entries(parsedShap || {})
    .map(([k, v]) => ({ feature: getShapText(k), value: Number(v), abs: Math.abs(Number(v)), feature_value: formData[k] !== undefined ? formData[k] : 'N/A' }))
    .sort((a,b) => b.abs - a.abs)
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 mt-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 border-b border-white/10 pb-6">
        <button 
          onClick={() => navigate('/officer/dashboard')}
          className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-lime transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-heading font-black text-white leading-tight">Manual Audit Panel</h1>
          <p className="text-lime text-sm font-bold tracking-widest uppercase mt-1">Application APP-{application.id.toString().padStart(4, '0')}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Data & Analysis) */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card title="Raw Applicant Data" icon={<FileText size={20} />}>
              {Object.keys(formData).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Monthly Income</span>
                    <span className="font-mono text-white text-lg font-bold">{formatCurrency(formData.monthly_income)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Monthly Expenses</span>
                    <span className="font-mono text-white text-lg font-bold">{formatCurrency(formData.monthly_expenses)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Loan Requirement</span>
                    <span className="font-mono text-white text-lg font-bold">{formatCurrency(formData.loan_amount)} <span className="text-sm font-sans text-text-muted">({formData.loan_tenure_months}m)</span></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Credit Score</span>
                    <span className={`font-mono text-lg font-bold ${formData.credit_score >= 700 ? 'text-success' : 'text-danger'}`}>{formData.credit_score}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Employment</span>
                    <span className="text-white text-md font-bold capitalize">{formData.employment_type} <span className="text-sm font-sans text-text-muted">({formData.employment_years}y)</span></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Active Debt</span>
                    <span className="font-mono text-white text-lg font-bold">{formatCurrency(formData.total_existing_emi)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Purpose / Context</span>
                    <span className="text-white text-md font-bold">{formData.loan_purpose} <span className="text-sm font-sans text-text-muted">({formData.property_type})</span></span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider mb-1">Missed Payments</span>
                    <span className={`text-md font-bold ${formData.late_payment_history > 0 ? 'text-danger' : 'text-success'}`}>{formData.late_payment_history} recorded incidents</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">Incomplete structured data payload detected.</p>
              )}
            </Card>
          </motion.div>

          {Object.keys(formData).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-5 bg-dark2 border border-white/5 rounded-2xl">
                   <div className="flex items-center gap-2 text-text-muted mb-2"><Calculator size={16} /><span className="text-xs uppercase tracking-wider font-bold">Projected EMI</span></div>
                   <div className="font-mono text-2xl font-bold text-white tracking-tight">{formatCurrency(newEmi.toFixed(0))}</div>
                 </div>
                 <div className="p-5 bg-dark2 border border-white/5 rounded-2xl relative overflow-hidden">
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${dti > 0.6 ? 'bg-danger' : 'bg-success'}`} />
                   <div className="flex items-center gap-2 text-text-muted mb-2"><Activity size={16} /><span className="text-xs uppercase tracking-wider font-bold">DTI Ratio</span></div>
                   <div className={`font-mono text-2xl font-bold tracking-tight ${dti > 0.6 ? 'text-danger' : 'text-white'}`}>{(dti * 100).toFixed(1)}%</div>
                 </div>
                 <div className={`p-5 border rounded-2xl ${disposable < 0 ? 'bg-danger/10 border-danger/20' : 'bg-dark2 border-white/5'}`}>
                   <div className={`flex items-center gap-2 mb-2 ${disposable < 0 ? 'text-danger' : 'text-text-muted'}`}><AlertCircle size={16} /><span className="text-xs uppercase tracking-wider font-bold">Free Cash Flow</span></div>
                   <div className={`font-mono text-2xl font-bold tracking-tight ${disposable < 0 ? 'text-danger' : 'text-white'}`}>{formatCurrency(disposable.toFixed(0))}</div>
                 </div>
               </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card title="Algorithm Explainability Context" icon={<Activity size={20} />}>
               <ShapChart data={shapArray} />
               <p className="text-xs text-text-muted mt-4 text-center">Global standard SHAP waterfall interpretation of local model inference</p>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card title="Audit Trajectory" icon={<History size={20} />}>
              <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10 ml-2">
                {audits.map((audit) => (
                  <div key={audit.id} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-dark2 border-2 border-lime flex items-center justify-center shadow-[0_0_10px_rgba(200,241,53,0.3)] z-10">
                       <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">{audit.action?.replace(/_/g, ' ')}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{new Date(audit.created_at).toLocaleString()}</p>
                      {audit.detail && <p className="text-sm text-text bg-white/5 border border-white/10 p-3 rounded-xl mt-3 leading-relaxed">{audit.detail}</p>}
                    </div>
                  </div>
                ))}
                {audits.length === 0 && <p className="text-sm text-text-muted pl-8">No historical footprint registered.</p>}
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Right Column (Decisions) */}
        <div className="space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className={`glass-strong rounded-[32px] p-8 border-2 relative overflow-hidden text-center shadow-2xl ${isFavorable ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}
          >
             <h3 className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mb-6">Algorithm Directive</h3>
             
             {isFavorable ? (
                <CheckCircle2 size={64} className="text-success mx-auto mb-4 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
              ) : (
                <XCircle size={64} className="text-danger mx-auto mb-4 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]" />
              )}
             
             <h2 className={`text-4xl font-heading font-black tracking-tight mb-4 ${isFavorable ? 'text-success' : 'text-danger'}`}>
              {isFavorable ? 'Approve' : 'Reject'}
             </h2>
             
             <div className="flex justify-between items-center bg-dark/50 border border-white/10 rounded-xl p-4 mt-6">
                <span className="text-xs font-bold text-text-faint uppercase font-mono tracking-wider">Confidence Level</span>
                <span className={`font-mono font-bold tracking-tight ${(application.ml_confidence * 100) > 80 ? 'text-success' : 'text-warning'}`}>{(application.ml_confidence * 100).toFixed(1)}%</span>
             </div>
             <div className="flex justify-between items-center bg-dark/50 border border-white/10 rounded-xl p-4 mt-3">
                <span className="text-xs font-bold text-text-faint uppercase font-mono tracking-wider">Risk Band</span>
                <span className="font-bold tracking-tight text-white">{application.ml_risk_band?.replace('_', ' ').toUpperCase()}</span>
             </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
             className="glass rounded-[32px] p-8 border border-white/10 shadow-xl relative"
          >
             <h3 className="text-lg font-heading font-bold text-white mb-6 flex items-center gap-2"><ShieldCheck className="text-lime" /> Final Adjudication</h3>

             <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                     <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm font-medium leading-relaxed">
                        {error}
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>

             <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => setDecision('Y')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all font-bold cursor-pointer ${decision === 'Y' ? 'bg-success border-success text-dark shadow-[0_0_15px_rgba(74,222,128,0.4)] scale-105' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
                >
                  <CheckCircle2 className="mb-2" />
                  Issue Approval
                </button>
                <button 
                  onClick={() => setDecision('N')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all font-bold cursor-pointer ${decision === 'N' ? 'bg-danger border-danger text-white shadow-[0_0_15px_rgba(248,113,113,0.4)] scale-105' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
                >
                  <XCircle className="mb-2" />
                  Issue Rejection
                </button>
             </div>

             <AnimatePresence>
                {decision && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                     <div className="pt-2">
                       <label className="flex items-center justify-between text-[10px] font-bold text-text-faint uppercase tracking-wider mb-2">
                         <span>Override Justification Notes</span>
                         {needsOverride && <span className="text-danger bg-danger/20 px-2 py-0.5 rounded text-[9px]">Required</span>}
                       </label>
                       <textarea 
                         value={overrideReason} 
                         onChange={e => setOverrideReason(e.target.value)}
                         placeholder={needsOverride ? "Explain the human reasoning for diverging from the AI model recommendation..." : "Optional: Append context to applicant footprint..."}
                         className={`w-full h-32 px-4 py-3 bg-dark/50 border transition-colors outline-none rounded-xl text-sm text-white resize-none mb-6 ${needsOverride && !overrideReason ? 'border-danger/50 focus:border-danger placeholder:text-danger/50' : 'border-white/10 focus:border-lime/50'}`}
                       />
                       
                       <Button variant="primary" loading={submitting} onClick={handleDecision} className="w-full h-12 text-sm bg-lime text-dark hover:bg-lime/90 font-bold tracking-wide">
                          Finalize Authorization
                       </Button>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
