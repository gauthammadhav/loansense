import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';


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
      setError("An override reason must be provided if your decision differs from the ML Prediction.");
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(`/officer/decide/${application.id}`, { decision, override_reason: overrideReason });
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit decision.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!application) {
    return (
      <>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <p>No application selected for review.</p>
          <button onClick={() => navigate('/officer/dashboard')}>Return to Queue</button>
        </div>
      </>
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

  const formatINR = (val) => new Intl.NumberFormat('en-IN').format(val || 0);

  // Auto-calculated derived on flight
  const newEmi = formData.loan_amount && formData.loan_tenure_months ? formData.loan_amount / formData.loan_tenure_months : 0;
  const dti = formData.monthly_income ? ((formData.total_existing_emi || 0) + newEmi) / formData.monthly_income : 0;
  const disposable = (formData.monthly_income || 0) - (formData.monthly_expenses || 0) - (formData.total_existing_emi || 0) - newEmi;

  const getShapText = (key) => {
    const map = {
      'monthly_income': 'Income Amount', 'monthly_expenses': 'Living Expenses',
      'loan_amount': 'Loan Size', 'loan_tenure_months': 'Repayment Tenure',
      'credit_score': 'CIBIL Score', 'existing_loans_count': 'Num of Loans',
      'total_existing_emi': 'Active EMI Load', 'employment_type': 'Work Profile',
      'employment_years': 'Job Stability', 'late_payment_history': 'Missed Payments',
      'new_emi': 'New Requested EMI', 'debt_to_income': 'DTI Ratio', 'disposable_income': 'Free Cash Flow'
    };
    return map[key] || key.replace(/_/g, ' ');
  };

  const shapArray = Object.entries(parsedShap || {})
    .map(([k, v]) => ({ key: k, label: getShapText(k), val: Number(v), abs: Math.abs(Number(v)) }))
    .sort((a,b) => b.abs - a.abs)
    .slice(0, 8);

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => navigate('/officer/dashboard')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            ← Back to Queue
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark)' }}>Review Application APP-{application.id.toString().padStart(4, '0')}</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Submitted on {new Date(application.submitted_at).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Base Form Data */}
            <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Extracted Applicant Profile
              </h3>
              
              {Object.keys(formData).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Monthly Income</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>₹{formatINR(formData.monthly_income)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Monthly Expenses</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>₹{formatINR(formData.monthly_expenses)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Loan Requested</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>₹{formatINR(formData.loan_amount)} for {formData.loan_tenure_months} mo</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Credit Score</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>{formData.credit_score}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Employment</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>{formData.employment_type} ({formData.employment_years} yrs)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Exist. EMI / Loans</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>₹{formatINR(formData.total_existing_emi)} ({formData.existing_loans_count} loans)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Purpose & Property</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>{formData.loan_purpose} - {formData.property_type} ({formData.property_area})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Late Payments</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: formData.late_payment_history > 0 ? 'var(--danger)' : 'var(--success)' }}>{formData.late_payment_history} recorded</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Income</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>${application.applicant_income}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Loan Requested</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>${application.loan_amount} for {application.loan_amount_term} mo</span>
                  </div>
                </div>
              )}
            </div>

            {/* Derived Metrics */}
            {Object.keys(formData).length > 0 && (
              <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'var(--page)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Predicted EMI</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark)' }}>₹{formatINR(newEmi.toFixed(0))}</div>
                </div>
                <div style={{ background: 'var(--page)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Debt to Income</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: dti > 0.6 ? 'var(--danger)' : 'var(--dark)' }}>{(dti * 100).toFixed(1)}%</div>
                </div>
                <div style={{ background: disposable < 0 ? 'var(--danger-bg)' : 'var(--page)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Disposable Income</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: disposable < 0 ? 'var(--danger)' : 'var(--dark)' }}>₹{formatINR(disposable.toFixed(0))}</div>
                </div>
              </div>
            )}

            {/* AI Analysis and History */}
            <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Key Drivers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {shapArray.length > 0 ? shapArray.map(item => {
                  const cap = Math.max(shapArray[0].abs, 0.001);
                  const pct = (item.abs / cap) * 100;
                  const isPos = item.val > 0;
                  return (
                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '120px', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', textAlign: 'right', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {item.label}
                      </div>
                      <div style={{ flex: 1, height: '24px', background: 'var(--page)', position: 'relative', borderRadius: '4px' }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: !isPos && '50%', right: isPos && '50%', width: isPos ? `${pct/2}%` : `${pct/2}%`, background: isPos ? 'var(--chart-approve)' : 'var(--chart-reject)', borderRadius: '2px' }} />
                        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--muted)', opacity: 0.3 }} />
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No explainability data available.</div>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                Audit History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {audits.map((audit) => (
                  <div key={audit.id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--lime)', border: '2px solid var(--white)', boxShadow: '0 0 0 1px var(--border)', marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dark)', textTransform: 'uppercase' }}>{audit.action?.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{new Date(audit.created_at).toLocaleString()}</div>
                      {audit.detail && <div style={{ fontSize: '12px', padding: '8px', background: 'var(--page)', borderRadius: '6px', color: 'var(--dark)', marginTop: '4px' }}>{audit.detail}</div>}
                    </div>
                  </div>
                ))}
                {audits.length === 0 && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No audit history found.</div>}
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: `2px solid ${isFavorable ? 'var(--success)' : 'var(--danger)'}`, boxShadow: `0 8px 30px ${isFavorable ? 'rgba(26,138,46,0.1)' : 'rgba(204,34,34,0.1)'}` }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>
                ML Recommendation
              </h3>
              <div style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: isFavorable ? 'var(--success)' : 'var(--danger)' }}>
                {isFavorable ? 'Approve' : 'Reject'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginTop: '8px' }}>
                Confidence: {(application.ml_confidence * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)', marginTop: '2px' }}>
                Risk Band: {application.ml_risk_band?.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div style={{ background: 'var(--page)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--dark)', marginBottom: '16px' }}>
                Final Decision
              </h3>

              {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', lineHeight: 1.4 }}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button 
                  onClick={() => setDecision('Y')}
                  style={{ flex: 1, padding: '12px 16px', background: decision === 'Y' ? 'var(--success)' : 'var(--white)', color: decision === 'Y' ? 'var(--white)' : 'var(--dark)', border: `1px solid ${decision === 'Y' ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--radius-input)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Approve
                </button>
                <button 
                  onClick={() => setDecision('N')}
                  style={{ flex: 1, padding: '12px 16px', background: decision === 'N' ? 'var(--danger)' : 'var(--white)', color: decision === 'N' ? 'var(--white)' : 'var(--dark)', border: `1px solid ${decision === 'N' ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-input)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  ✗ Reject
                </button>
              </div>

              {decision && (
                <div style={{ animation: 'fade-in 0.3s' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--dark)', marginBottom: '8px' }}>
                    OVERRIDE / REVIEW NOTES {needsOverride && <span style={{ color: 'var(--danger)' }}>*</span>}
                  </label>
                  <textarea 
                    value={overrideReason} onChange={e => setOverrideReason(e.target.value)}
                    placeholder={needsOverride ? "Required: Why are you overriding the ML?" : "Optional notes..."}
                    style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '16px' }}
                  />
                  <button onClick={handleDecision} disabled={submitting} style={{ width: '100%', padding: '14px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-input)', fontSize: '14px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                    {submitting ? 'Submitting...' : 'Confirm Decision'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
