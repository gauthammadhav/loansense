import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';


export default function ApplicantResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application;

  const [simParams, setSimParams] = useState(null);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (application && application.shap_values) {
      try {
        const parsed = typeof application.shap_values === 'string' 
          ? JSON.parse(application.shap_values) 
          : application.shap_values;
          
        const initData = parsed.form_data || {};
        const params = {
          monthly_income: initData.monthly_income || 0,
          loan_amount: initData.loan_amount || 0,
          loan_tenure_months: initData.loan_tenure_months || 60,
          credit_score: initData.credit_score || 700,
          total_existing_emi: initData.total_existing_emi || 0,
          monthly_expenses: initData.monthly_expenses || 0,
          existing_loans_count: initData.existing_loans_count || 0,
          employment_type: initData.employment_type || 'salaried',
          employment_years: initData.employment_years || 0,
          late_payment_history: initData.late_payment_history || 0,
          loan_purpose: initData.loan_purpose || 'General',
          property_type: initData.property_type || 'Urban',
          property_area: initData.property_area || 'Urban',
        };
        setSimParams(params);
      } catch (e) { console.error(e) }
    }
  }, [application]);

  useEffect(() => {
    if (!simParams) return;
    
    const timer = setTimeout(async () => {
      setSimLoading(true);
      try {
        const res = await apiClient.post('/applications/new/whatif', simParams);
        setSimResult(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setSimLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [simParams]);

  if (!application) {
    return (
    <>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <p>No application data found.</p>
          <button onClick={() => navigate('/applicant/dashboard')}>Dashboard</button>
        </div>
    </>
    );
  }

  let parsedShap = {};
  let derived = application.derived_features || {};
  let originalPrediction = application.ml_prediction;
  let originalConfidence = application.ml_confidence;
  let originalRisk = application.ml_risk_band;

  try {
    const rawShap = typeof application.shap_values === 'string' 
      ? JSON.parse(application.shap_values) 
      : application.shap_values;
    parsedShap = rawShap.shap || {};
  } catch (e) {}

  // If simResult exists, use it to override displayed outputs
  const currentPrediction = simResult ? simResult.prediction : originalPrediction;
  const currentConfidence = simResult ? simResult.confidence : originalConfidence;
  const currentRisk = simResult ? simResult.risk_band : originalRisk;
  const currentDerived = simResult ? simResult.derived_features : derived;
  const currentShap = simResult ? simResult.shap_values : parsedShap;

  const isApproved = currentPrediction === 'Y';

  const formatINR = (val) => new Intl.NumberFormat('en-IN').format(val || 0);

  // Map SHAP to Plain text
  const getShapText = (key) => {
    const map = {
      'monthly_income': 'Income Amount',
      'monthly_expenses': 'Living Expenses',
      'loan_amount': 'Loan Size',
      'loan_tenure_months': 'Repayment Tenure',
      'credit_score': 'CIBIL Score',
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

  const shapArray = Object.entries(currentShap || {})
    .map(([k, v]) => ({ key: k, label: getShapText(k), val: Number(v), abs: Math.abs(Number(v)) }))
    .sort((a,b) => b.abs - a.abs)
    .slice(0, 8);

  return (
    <>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => navigate('/applicant/dashboard')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            ← Back to Dashboard
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark)' }}>Application #{application.id}</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* Main Decision */}
          <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: `2px solid ${isApproved ? 'var(--success)' : 'var(--danger)'}`, boxShadow: `0 8px 30px ${isApproved ? 'rgba(26,138,46,0.1)' : 'rgba(204,34,34,0.1)'}` }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>
              Machine Learning Decision
            </h3>
            <div style={{ fontSize: '42px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: isApproved ? 'var(--success)' : 'var(--danger)', marginBottom: '16px' }}>
              {isApproved ? 'Favorable' : 'High Risk'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)', marginBottom: '8px' }}>
              Decision Confidence: {(currentConfidence * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dark)', marginBottom: '24px' }}>
              Risk Band: {currentRisk?.replace('_', ' ').toUpperCase()}
            </div>
            
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '16px' }} />
            
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
              This is a preliminary AI-driven decision. A loan officer will review this manually for final approval.
            </p>
          </div>

          {/* Derived Metrics */}
          <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--muted)', marginBottom: '16px' }}>
              Financial Capacity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--page)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Proposed Monthly EMI</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark)' }}>₹{formatINR(currentDerived?.new_emi?.toFixed(0))}</span>
              </div>
              
              <div style={{ background: 'var(--page)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Debt-to-Income (DTI)</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: currentDerived?.debt_to_income > 0.6 ? 'var(--danger)' : 'var(--dark)' }}>
                  {((currentDerived?.debt_to_income || 0) * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{ background: currentDerived?.disposable_income < 0 ? 'var(--danger-bg)' : 'var(--page)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Disposable Income</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: currentDerived?.disposable_income < 0 ? 'var(--danger)' : 'var(--dark)' }}>
                  ₹{formatINR(currentDerived?.disposable_income?.toFixed(0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explainability */}
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', marginTop: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark)', marginBottom: '8px' }}>
            Why did the AI make this decision?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
            Green bars indicate factors pushing towards approval. Red bars pushed towards rejection.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {shapArray.length > 0 ? shapArray.map(item => {
              const cap = Math.max(shapArray[0].abs, 0.001);
              const pct = (item.abs / cap) * 100;
              const isPos = item.val > 0;
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '140px', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', textAlign: 'right' }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, height: '24px', background: 'var(--page)', position: 'relative', borderRadius: '4px' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: !isPos && '50%', right: isPos && '50%', width: isPos ? `${pct/2}%` : `${pct/2}%`, background: isPos ? 'var(--chart-approve)' : 'var(--chart-reject)', borderRadius: '2px' }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--muted)', opacity: 0.3 }} />
                  </div>
                  <div style={{ width: '60px', fontSize: '10px', fontWeight: 600, color: isPos ? 'var(--chart-approve)' : 'var(--chart-reject)' }}>
                    {isPos ? '+' : ''}{item.val.toFixed(3)}
                  </div>
                </div>
              );
            }) : (
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No explainability data available.</div>
            )}
          </div>
        </div>

        {/* What-If Simulator */}
        {simParams && (
          <div style={{ background: 'var(--dark)', padding: '32px', borderRadius: 'var(--radius-card)', marginTop: '24px', color: 'var(--white)', position: 'relative', overflow: 'hidden' }}>
            {simLoading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>
                Simulating outcome...
              </div>
            )}
            
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '8px', color: 'var(--lime)' }}>
              Live "What-If" Simulator
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
              Adjust the sliders below to see how changes to your application would affect the AI decision in real-time.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Monthly Income</span>
                  <span style={{ color: 'var(--lime)' }}>₹{formatINR(simParams.monthly_income)}</span>
                </label>
                <input type="range" min="10000" max="500000" step="5000"
                  value={simParams.monthly_income} 
                  onChange={(e) => setSimParams({...simParams, monthly_income: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--lime)' }} />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Loan Amount</span>
                  <span style={{ color: 'var(--lime)' }}>₹{formatINR(simParams.loan_amount)}</span>
                </label>
                <input type="range" min="50000" max="10000000" step="50000"
                  value={simParams.loan_amount} 
                  onChange={(e) => setSimParams({...simParams, loan_amount: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--lime)' }} />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>CIBIL Score</span>
                  <span style={{ color: 'var(--lime)' }}>{simParams.credit_score}</span>
                </label>
                <input type="range" min="300" max="900" step="10"
                  value={simParams.credit_score} 
                  onChange={(e) => setSimParams({...simParams, credit_score: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--lime)' }} />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                  <span>Tenure (Months)</span>
                  <span style={{ color: 'var(--lime)' }}>{simParams.loan_tenure_months}</span>
                </label>
                <input type="range" min="12" max="360" step="12"
                  value={simParams.loan_tenure_months} 
                  onChange={(e) => setSimParams({...simParams, loan_tenure_months: Number(e.target.value)})}
                  style={{ width: '100%', accentColor: 'var(--lime)' }} />
              </div>
            </div>

            {originalPrediction !== currentPrediction && (
              <div style={{ marginTop: '24px', padding: '12px', background: currentPrediction === 'Y' ? 'rgba(26,138,46,0.2)' : 'rgba(204,34,34,0.2)', border: `1px solid ${currentPrediction === 'Y' ? 'var(--success)' : 'var(--danger)'}`, borderRadius: '8px', color: currentPrediction === 'Y' ? 'var(--success)' : 'var(--danger)', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                Outcome flipped to {currentPrediction === 'Y' ? 'Favorable' : 'High Risk'}!
              </div>
            )}
            {originalPrediction === currentPrediction && simResult && (
              <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--white)', opacity: 0.7, fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                Baseline Outcome Unchanged
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
