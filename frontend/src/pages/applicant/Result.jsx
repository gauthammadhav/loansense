import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ShapChart from '../../components/ui/ShapChart';
import WhatIfSimulator from '../../components/ui/WhatIfSimulator';
import { ArrowLeft, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApplicantResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application;

  if (!application) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-24 text-center flex flex-col items-center gap-6"
      >
        <div className="w-16 h-16 rounded-full bg-page flex items-center justify-center text-muted border-2 border-border mb-4">
           <BrainCircuit size={32} />
        </div>
        <p className="text-muted font-bold text-xl tracking-tight">System Out of Sync: No Application Context</p>
        <Button variant="secondary" onClick={() => navigate('/applicant/dashboard')} className="h-12 px-8 rounded-xl shadow-lg">Return to Neural Dashboard</Button>
      </motion.div>
    );
  }

  let parsedShap = {};
  if (typeof application.shap_values === 'string') {
    try {
      parsedShap = JSON.parse(application.shap_values);
    } catch (e) {
      console.error(e);
    }
  } else if (application.shap_values) {
    parsedShap = application.shap_values;
  }

  const isApproved = application.ml_prediction === 'Y';
  
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-6"
      >
        <button 
          onClick={() => navigate('/applicant/dashboard')} 
          className="p-4 bg-white border-2 border-border rounded-2xl hover:bg-dark hover:text-white hover:border-dark transition-all shadow-soft group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h2 className="text-3xl font-heading font-black text-dark tracking-tight">Neural Logic Breakdown</h2>
          <p className="text-sm font-body font-bold text-muted mt-1 uppercase tracking-widest">Instance ID: {application.id?.toString().padStart(6, '0')}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
        >
          <Card className={`h-full border-[3px] shadow-2xl rounded-[40px] p-10 relative overflow-hidden transition-all ${
            isApproved ? 'border-success/30 shadow-success/10' : 'border-danger/30 shadow-danger/10'
          }`}>
            <div className={`absolute top-0 right-0 p-8 opacity-5 italic font-black text-8xl pointer-events-none`}>
              {isApproved ? 'PASS' : 'RISK'}
            </div>
            
            <h3 className="text-[10px] uppercase font-black text-faint tracking-[0.3em] mb-6 flex items-center gap-2">
              <BrainCircuit size={14} className="text-dark" />
              Algorithmic Consensus
            </h3>
            
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`text-[56px] font-heading font-black leading-none tracking-tighter ${isApproved ? 'text-success' : 'text-danger'}`}
            >
              {isApproved ? 'Favorable' : 'High Risk'}
            </motion.div>
            
            <div className="mt-12 space-y-4">
              <div className="p-5 rounded-3xl bg-page/50 border border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-muted">Confidence Score</span>
                <span className="text-lg font-black text-dark tracking-tighter">{(application.ml_confidence * 100).toFixed(1)}%</span>
              </div>
              
              <div className="p-5 rounded-3xl bg-page/50 border border-border flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-muted">Risk Category</span>
                <span className={`text-lg font-black tracking-tighter capitalize ${isApproved ? 'text-success' : 'text-danger'}`}>
                   {application.ml_risk_band?.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="mt-12 p-6 rounded-3xl bg-dark text-white shadow-2xl">
              <p className="text-xs font-medium leading-relaxed opacity-80 italic">
                "Our XGBoost classifier analyzed 14 biometric and financial vectors. This prediction is awaiting final verification by an accredited Human Officer."
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-2 border-border shadow-soft rounded-[40px] p-10">
            <h3 className="text-[10px] uppercase font-black text-faint tracking-[0.3em] mb-6 flex items-center gap-2">
              <Activity size={14} className="text-dark" />
              Feature Impact (SHAP)
            </h3>
            <p className="text-xs text-muted font-bold leading-relaxed mb-8 max-w-sm">
              Each bar represents how much a specific data point pushed our AI toward 
              <span className="text-success mx-1">Approval</span> or 
              <span className="text-danger mx-1">Rejection</span>.
            </p>
            <div className="rounded-3xl bg-page/30 p-4 border border-border/50">
              <ShapChart shapValues={parsedShap} />
            </div>
          </Card>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 pt-16 border-t-2 border-border border-dashed"
      >
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center text-dark shadow-lg shadow-lime/20">
              <Activity size={20} strokeWidth={3} />
           </div>
           <h3 className="text-2xl font-heading font-black text-dark tracking-tight">Stress Test & What-If Simulation</h3>
        </div>
        <Card className="bg-white border-2 border-border shadow-2xl rounded-[40px] p-8 lg:p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-lime" />
          <WhatIfSimulator application={application} />
        </Card>
      </motion.div>
    </div>
  );
}
