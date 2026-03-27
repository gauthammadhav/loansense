import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Badge } from './Badge';

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

    // If completely unmodified, reset and skip network.
    if (JSON.stringify(params) === JSON.stringify(defaultParams)) {
      setSimResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Safely parse the original new banking dataset form data stored within SHAP
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

  const handleChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: Number(value) }));
  };

  const getDiffStatus = () => {
    if (!simResult) return null;
    const oldPred = application.ml_prediction;
    const newPred = simResult.prediction;
    
    if (oldPred === 'N' && newPred === 'Y') {
      return <Badge variant="approved">FLIPPED TO FAVORABLE</Badge>;
    } else if (oldPred === 'Y' && newPred === 'N') {
      return <Badge variant="rejected">FLIPPED TO HIGH RISK</Badge>;
    }
    return <Badge>UNCHANGED</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sliders Input Area */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1.5 align-middle">
              <label className="text-[13px] font-bold font-body text-dark tracking-wide">MONTHLY INCOME</label>
              <span className="text-sm font-bold text-lime-dark">${params.applicant_income.toLocaleString()}/mo</span>
            </div>
            <input 
              type="range" min="500" max="30000" step="500"
              value={params.applicant_income}
              onChange={(e) => handleChange('applicant_income', e.target.value)}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-lime"
            />
            <div className="flex justify-between text-[10px] text-muted font-bold mt-1">
              <span>$500</span><span>$30,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-[13px] font-bold font-body text-dark tracking-wide">LOAN AMOUNT (IN THOUSANDS)</label>
              <span className="text-sm font-bold text-lime-dark">${params.loan_amount}k = ${(params.loan_amount * 1000).toLocaleString()}</span>
            </div>
            <input 
              type="range" min="10" max="700" step="10"
              value={params.loan_amount}
              onChange={(e) => handleChange('loan_amount', e.target.value)}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-lime"
            />
            <div className="flex justify-between text-[10px] text-muted font-bold mt-1">
              <span>$10k</span><span>$700k</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-[13px] font-bold font-body text-dark tracking-wide">CREDIT SCORE</label>
              <span className={`text-sm font-bold ${params.credit_score >= 750 ? 'text-success' : params.credit_score >= 650 ? 'text-lime-dark' : 'text-danger'}`}>
                {params.credit_score} {params.credit_score >= 750 ? '(Excellent)' : params.credit_score >= 650 ? '(Good)' : '(Poor)'}
              </span>
            </div>
            <input 
              type="range" min="300" max="850" step="1"
              value={params.credit_score}
              onChange={(e) => handleChange('credit_score', e.target.value)}
              className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-lime"
            />
            <div className="flex justify-between text-[10px] text-muted font-bold mt-1">
              <span className="text-danger">300 (Poor)</span><span className="text-success">850 (Excellent)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Outcome Area */}
        <div className="p-6 rounded-[var(--radius-card)] bg-page/50 border border-border flex flex-col items-center justify-center relative min-h-[160px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-[var(--radius-card)] z-10 text-sm font-bold text-muted pointer-events-none">
              Simulating Inference...
            </div>
          )}
          
          <h4 className="text-xs font-bold text-faint uppercase tracking-wider mb-2">Simulated Outcome</h4>
          
          {simResult ? (
            <div className="text-center">
              <div className={`text-4xl font-heading font-bold mb-3 ${simResult.prediction === 'Y' ? 'text-success' : 'text-danger'}`}>
                {simResult.prediction === 'Y' ? 'Favorable' : 'High Risk'}
              </div>
              <div className="font-body text-sm font-bold mb-4">
                Confidence: {(simResult.confidence * 100).toFixed(1)}%
              </div>
              {getDiffStatus()}
            </div>
          ) : (
            <div className="text-center text-muted font-body text-sm px-4">
              <p>Move the sliders to see how live variations affect the model decision.</p>
              <div className="mt-4"><Badge variant="default">BASELINE MODE</Badge></div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
