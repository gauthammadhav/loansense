import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, Activity, Cpu, Percent, Wallet, FileText, Banknote } from 'lucide-react';

import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { ShapChart } from '../../components/ui/ShapChart';
import WhatIfSimulator from '../../components/ui/WhatIfSimulator';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function ApplicantResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const navApp = location.state?.application;

  const [application, setApplication] = useState(navApp);
  const [loading, setLoading] = useState(!navApp || !navApp.shap_values);

  useEffect(() => {
    const fetchFullApp = async () => {
      try {
        const res = await apiClient.get(`/applications/${id || navApp?.id}`);
        setApplication(res.data);
      } catch (e) {
        console.error("Failed to recover full application details:", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (!navApp || !navApp.shap_values) {
      if(id || navApp?.id) fetchFullApp();
    }
  }, [navApp, id]);

  useEffect(() => {
    if (application?.ml_prediction === 'Y') {
      triggerConfetti();
    }
  }, [application]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (!application && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-text-muted mb-4 font-medium">No application data found.</p>
        <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 rounded-full border-2 border-lime border-t-transparent shadow-[0_0_20px_rgba(200,241,53,0.3)]"
          />
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lime opacity-50" size={24} />
        </div>
        <div className="text-lime font-bold uppercase tracking-widest text-sm animate-pulse">
          Reconstructing ML Nodes...
        </div>
      </div>
    );
  }

  const isApproved = application.ml_prediction === 'Y';
  let parsedShap = {};
  let parsedForm = {};
  
  try {
    const rawShap = typeof application.shap_values === 'string' ? JSON.parse(application.shap_values) : application.shap_values;
    parsedShap = rawShap.shap || {};
    parsedForm = rawShap.form_data || {};
  } catch (e) {}

  const getShapText = (key) => {
    const map = {
      'monthly_income': 'Income Amount',
      'monthly_expenses': 'Living Expenses',
      'loan_amount': 'Loan Size',
      'loan_tenure_months': 'Repayment Tenure',
      'credit_score': 'Credit Score',
      'existing_loans_count': 'Num of Loans',
      'total_existing_emi': 'Active EMI Load',
      'employment_type': 'Work Profile',
      'employment_years': 'Job Stability',
      'late_payment_history': 'Missed Payments',
      'new_emi': 'New Requested EMI',
      'debt_to_income': 'DTI Ratio',
      'disposable_income': 'Free Cash Flow'
    };
    return map[key] || key.replace(/_/g, ' ');
  };

  const shapArray = Object.entries(parsedShap || {})
    .map(([k, v]) => {
       const featureValue = parsedForm[k] !== undefined ? parsedForm[k] : 'N/A';
       return { feature: getShapText(k), value: Number(v), abs: Math.abs(Number(v)), feature_value: featureValue }
    })
    .sort((a,b) => b.abs - a.abs)
    .slice(0, 10);

  let derived = application.derived_features || {};

  if (!derived.new_emi && (parsedForm.loan_amount || application.loan_amount)) {
     const loan_amount = parseFloat(parsedForm.loan_amount || application.loan_amount) || 0;
     const loan_tenure_months = Math.max(parseFloat(parsedForm.loan_tenure_months || application.loan_amount_term) || 1, 1);
     const monthly_income = Math.max(parseFloat(parsedForm.monthly_income || application.applicant_income) || 1, 1);
     const monthly_expenses = parseFloat(parsedForm.monthly_expenses) || 0;
     const total_existing_emi = parseFloat(parsedForm.total_existing_emi) || 0;

     const new_emi = loan_amount / loan_tenure_months;
     const debt_to_income = (total_existing_emi + new_emi) / monthly_income;
     const disposable_income = monthly_income - monthly_expenses - total_existing_emi - new_emi;

     derived = { new_emi, debt_to_income, disposable_income };
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 mt-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 border-b border-white/10 pb-6">
        <button 
          onClick={() => navigate('/applicant/dashboard')}
          className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-lime transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-heading font-black text-white leading-tight">Evaluation Report</h1>
          <p className="text-lime text-sm font-bold tracking-widest uppercase mt-1">Application #{application.id}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ML Decision Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`glass-strong rounded-[32px] p-10 border-2 relative overflow-hidden group ${isApproved ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] z-0 pointer-events-none" />
          <div className={`absolute top-0 left-0 w-full h-1.5 ${isApproved ? 'bg-success' : 'bg-danger'}`} />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-8 opacity-80" icon={<Cpu size={14} />}>Automated ML Engine</Badge>
            
            <motion.div 
               initial={{ scale: 0, rotate: -45 }} 
               animate={{ scale: 1, rotate: 0 }} 
               transition={{ type: 'spring', damping: 15, delay: 0.2 }}
            >
              {isApproved ? (
                <CheckCircle2 size={72} className="text-success mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
              ) : (
                <XCircle size={72} className="text-danger mb-6 drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]" />
              )}
            </motion.div>
            
            <h2 className={`text-6xl font-heading font-black tracking-tight mb-4 ${isApproved ? 'text-success drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]' : 'text-danger drop-shadow-[0_0_10px_rgba(248,113,113,0.2)]'}`}>
              {isApproved ? 'Favorable' : 'High Risk'}
            </h2>
            <p className="text-xl text-white font-medium mb-10">
              Confidence Score: <span className={`font-mono font-bold px-3 py-1 rounded-lg ${application.ml_confidence > 0.8 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{(application.ml_confidence * 100).toFixed(1)}%</span>
            </p>

            <div className="w-full bg-dark2/80 border border-white/10 rounded-2xl p-5 flex justify-between items-center text-left shadow-inner">
              <div>
                <div className="text-xs text-text-faint uppercase tracking-[0.2em] font-bold mb-1">Assessed Risk Band</div>
                <div className="text-white font-bold text-lg">{application.ml_risk_band?.replace('_', ' ').toUpperCase()}</div>
              </div>
              <Activity className={isApproved ? "text-success" : "text-danger"} size={28} />
            </div>
          </div>
        </motion.div>

        {/* Financial Derived Capacity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col h-full"
        >
          <Card title="Financial Capacity" icon={<Wallet size={20} />} className="flex-1 h-full">
            <div className="space-y-4 pt-2 flex flex-col h-full justify-center">
              <div className="bg-dark2 border border-white/5 p-5 rounded-2xl flex justify-between items-center group-hover:border-white/20 transition-all hover:scale-[1.02]">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-lime/10 text-lime flex items-center justify-center shadow-[0_0_15px_rgba(200,241,53,0.1)]"><Banknote size={24} /></div>
                   <span className="font-bold text-white tracking-wide">Proposed EMI</span>
                 </div>
                 <span className="text-2xl font-bold font-mono text-lime tracking-tight drop-shadow-[0_0_10px_rgba(200,241,53,0.2)]">{formatCurrency(derived?.new_emi)}</span>
              </div>
              
              <div className="bg-dark2 border border-white/5 p-5 rounded-2xl flex justify-between items-center group-hover:border-white/20 transition-all hover:scale-[1.02]">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center shadow-[0_0_15px_rgba(129,140,248,0.1)]"><Percent size={24} /></div>
                   <span className="font-bold text-white tracking-wide">DTI Ratio</span>
                 </div>
                 <span className={`text-2xl font-bold font-mono tracking-tight ${(derived?.debt_to_income || 0) > 0.6 ? 'text-danger drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'text-white'}`}>
                    {((derived?.debt_to_income || 0) * 100).toFixed(1)}%
                 </span>
              </div>

              <div className="bg-dark2 border border-white/5 p-5 rounded-2xl flex justify-between items-center group-hover:border-white/20 transition-all hover:scale-[1.02]">
                 <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(currentColor,0.1)] ${derived?.disposable_income < 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}><Activity size={24} /></div>
                   <span className="font-bold text-white tracking-wide">Free Cash Flow</span>
                 </div>
                 <span className={`text-2xl font-bold font-mono tracking-tight ${derived?.disposable_income < 0 ? 'text-danger drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'text-white'}`}>
                    {formatCurrency(derived?.disposable_income)}
                 </span>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card title="Model Explainability Context" icon={<FileText size={20} />}>
          <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-2xl">
            The Waterfall chart illustrates the exact mathematical weights assigned to your individual features by the Random Forest model. Features pushing left (yellow) increase risk, while features pushing right (green) favor approval.
          </p>
          <ShapChart data={shapArray} />
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card title="Interactive Model Engine" icon={<Cpu size={20} />}>
           <WhatIfSimulator application={application} />
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center pb-8"
      >
         <Button onClick={() => navigate('/applicant/dashboard')} variant="ghost" size="lg">
            Return to Dashboard
         </Button>
      </motion.div>
    </div>
  );
}
