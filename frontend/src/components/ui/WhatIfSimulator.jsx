import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Badge } from './Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function WhatIfSimulator({ application }) {
  const [params, setParams] = useState({
    applicant_income: application.applicant_income || 0,
    loan_amount: application.loan_amount || 0,
    loan_amount_term: application.loan_amount_term || 360,
    credit_score: application.credit_score || 700
  });

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const defaultParams = {
      applicant_income: application.applicant_income,
      loan_amount: application.loan_amount,
      loan_amount_term: application.loan_amount_term,
      credit_score: application.credit_score
    };

    if (JSON.stringify(params) === JSON.stringify(defaultParams)) {
      setSimResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let parsedFormData = {};
        try {
          const parsedShap = JSON.parse(application.shap_values || '{}');
          parsedFormData = parsedShap.form_data || {};
        } catch(e) { console.error('Error extracting form data', e); }

        const payload = {
          monthly_income: params.applicant_income,
          monthly_expenses: parsedFormData.monthly_expenses || 0,
          loan_amount: params.loan_amount,
          loan_tenure_months: params.loan_amount_term,
          credit_score: params.credit_score,
          existing_loans_count: parsedFormData.existing_loans_count || 0,
          total_existing_emi: parsedFormData.total_existing_emi || 0,
          employment_type: parsedFormData.employment_type || 'salaried',
          employment_years: parsedFormData.employment_years || 0,
          late_payment_history: parsedFormData.late_payment_history || 0,
          loan_purpose: application.purpose || "Medical",
          property_type: application.property_type || "Urban"
        };
        
        const res = await apiClient.post('/applications/new/whatif', payload);
        setSimResult(res.data);
      } catch (err) {
        console.error("Simulation failed", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [params, application]);

  const handleChange = (field, value) => setParams(prev => ({ ...prev, [field]: Number(value) }));

  const getDiffStatus = () => {
    if (!simResult) return null;
    const oldPred = application.ml_prediction;
    const newPred = simResult.prediction;
    
    if (oldPred === 'N' && newPred === 'Y') {
      return <Badge variant="success" pulse icon={<Zap size={12}/>}>FLIPPED TO FAVORABLE</Badge>;
    } else if (oldPred === 'Y' && newPred === 'N') {
      return <Badge variant="danger" pulse icon={<AlertTriangle size={12}/>}>FLIPPED TO HIGH RISK</Badge>;
    }
    return <Badge variant="outline">UNCHANGED</Badge>;
  };

  const getSliderTrackGradient = (min, max, val, isInverse) => {
    const percent = ((val - min) / (max - min)) * 100;
    const color = isInverse ? (percent < 40 ? '#4ADE80' : percent < 70 ? '#FBBF24' : '#F87171') : (percent < 30 ? '#F87171' : percent < 70 ? '#FBBF24' : '#4ADE80');
    return `linear-gradient(to right, ${color} ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
        
        {/* Sliders Input Area */}
        <div className="lg:col-span-3 space-y-8">
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-sm font-bold text-[var(--text)] tracking-wide block mb-1">MONTHLY INCOME</label>
                <span className="text-xs text-[var(--text-muted)]">Adjust total provable monthly income</span>
              </div>
              <span className="text-xl font-bold text-lime-dark tracking-tight">₹{params.applicant_income.toLocaleString('en-IN')}</span>
            </div>
            <div className="relative group/slider pb-2">
              <input 
                type="range" min="5000" max="500000" step="5000"
                value={params.applicant_income}
                onChange={(e) => handleChange('applicant_income', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none relative z-10 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover/slider:[&::-webkit-slider-thumb]:w-5 group-hover/slider:[&::-webkit-slider-thumb]:h-5 group-hover/slider:[&::-webkit-slider-thumb]:transition-all"
                style={{ background: getSliderTrackGradient(5000, 500000, params.applicant_income, false) }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-sm font-bold text-[var(--text)] tracking-wide block mb-1">LOAN AMOUNT REQUIRED</label>
                <span className="text-xs text-[var(--text-muted)]">Total capital required (INR)</span>
              </div>
              <span className="text-xl font-bold text-lime-dark tracking-tight">₹{params.loan_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="relative group/slider pb-2">
              <input 
                type="range" min="10000" max="10000000" step="10000"
                value={params.loan_amount}
                onChange={(e) => handleChange('loan_amount', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none relative z-10 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover/slider:[&::-webkit-slider-thumb]:w-5 group-hover/slider:[&::-webkit-slider-thumb]:h-5 group-hover/slider:[&::-webkit-slider-thumb]:transition-all"
                style={{ background: getSliderTrackGradient(10000, 10000000, params.loan_amount, true) }}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <label className="text-sm font-bold text-[var(--text)] tracking-wide block mb-1">CREDIT SCORE</label>
                <span className="text-xs text-[var(--text-muted)]">FICO/Vantage score equivalent</span>
              </div>
              <span className={`text-xl font-bold tracking-tight ${params.credit_score >= 750 ? 'text-[var(--success-dark)]' : params.credit_score >= 650 ? 'text-[var(--warning-dark)]' : 'text-[var(--danger-dark)]'}`}>
                {params.credit_score}
              </span>
            </div>
            <div className="relative group/slider pb-2">
              <input 
                type="range" min="300" max="850" step="1"
                value={params.credit_score}
                onChange={(e) => handleChange('credit_score', e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none relative z-10 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover/slider:[&::-webkit-slider-thumb]:w-5 group-hover/slider:[&::-webkit-slider-thumb]:h-5 group-hover/slider:[&::-webkit-slider-thumb]:transition-all"
                style={{ background: getSliderTrackGradient(300, 850, params.credit_score, false) }}
              />
            </div>
          </div>

        </div>

        {/* Live Simulation Outcome Area */}
        <motion.div 
           className="lg:col-span-2 shadow-2xl rounded-[32px] p-8 flex flex-col items-center justify-center relative min-h-[300px] overflow-hidden border transition-colors duration-500"
           animate={{
            backgroundColor: simResult ? (simResult.prediction === 'Y' ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)') : 'rgba(255,255,255,0.02)',
            borderColor: simResult ? (simResult.prediction === 'Y' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)') : 'rgba(255,255,255,0.1)'
           }}
        >
          {/* Animated Glow */}
          <div className="absolute inset-0 z-0">
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-20 blur-[50px] transition-colors duration-1000 ${simResult ? (simResult.prediction === 'Y' ? 'bg-success' : 'bg-danger') : 'bg-white'}`} />
          </div>

          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-20"
              >
                <div className="relative">
                   <div className="absolute inset-0 bg-[var(--lime-glow)] blur-xl rounded-full" />
                   <div className="w-16 h-16 rounded-full border border-[var(--lime-subtle)] flex items-center justify-center bg-[var(--light)] mb-4 relative z-10 shadow-sm">
                     <Loader2 size={24} className="text-[var(--lime-dark)] animate-spin" />
                   </div>
                </div>
                <span className="text-xs font-bold text-[var(--lime-dark)] uppercase tracking-[0.3em]">Running Inference</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative z-10 w-full flex flex-col items-center text-center">
            <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6">Live Outcome Prediction</h4>
            
            <AnimatePresence mode="wait">
              {simResult ? (
                <motion.div 
                  key="simResult"
                  initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                  className="w-full flex flex-col items-center"
                >
                  <div className={`text-[42px] leading-tight font-heading font-black mb-4 tracking-tight ${simResult.prediction === 'Y' ? 'text-[var(--success)] drop-shadow-sm' : 'text-[var(--danger)] drop-shadow-sm'}`}>
                    {simResult.prediction === 'Y' ? 'Favorable' : 'High Risk'}
                  </div>
                  <div className="bg-white/80 border border-[var(--glass-border)] rounded-full px-5 py-2 flex items-center gap-3 mb-6 shadow-sm backdrop-blur-xl">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Confidence</span>
                    <span className="text-sm font-bold text-[var(--text)] font-mono object-tabular-nums">{(simResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  {getDiffStatus()}
                </motion.div>
              ) : (
                <motion.div 
                   key="baseline"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="flex flex-col items-center px-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-[var(--light3)] border border-[var(--glass-border)] flex items-center justify-center mb-6 text-[var(--text-muted)] shadow-sm">
                    <ShieldCheck size={28} />
                  </div>
                  <p className="text-[var(--text-muted)] text-sm max-w-[200px] leading-relaxed mb-6">
                    Adjust the sliders to see how live data variations affect the Random Forest algorithm.
                  </p>
                  <Badge variant="outline" className="opacity-50 tracking-widest border-dashed">BASELINE ACTIVE</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
