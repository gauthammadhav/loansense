import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';


export default function ApplyWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  
  const [formData, setFormData] = useState({
    monthly_income: '',
    monthly_expenses: '',
    loan_amount: '',
    loan_tenure_months: 60,
    credit_score: '',
    existing_loans_count: 0,
    total_existing_emi: 0,
    employment_type: 'salaried',
    employment_years: '',
    late_payment_history: 0,
    loan_purpose: 'General'
  });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseNum = (val) => val === '' ? '' : Number(val);

  const calculatePreview = () => {
    const d = {
      income: Number(formData.monthly_income) || 0,
      expenses: Number(formData.monthly_expenses) || 0,
      loan: Number(formData.loan_amount) || 0,
      tenure: Number(formData.loan_tenure_months) || 1,
      emi: Number(formData.total_existing_emi) || 0
    };
    const savings = d.income - d.expenses;
    const newEmi = d.loan / d.tenure;
    const dti = d.income > 0 ? (d.emi + newEmi) / d.income : 0;
    const disposable = d.income - d.expenses - d.emi - newEmi;
    return { savings, newEmi, dti, disposable };
  };

  const preview = calculatePreview();

  const checkEligibility = async () => {
    try {
      const payload = {
        ...formData,
        monthly_income: Number(formData.monthly_income) || 0,
        monthly_expenses: Number(formData.monthly_expenses) || 0,
        loan_amount: Number(formData.loan_amount) || 0,
        credit_score: Number(formData.credit_score) || 300,
        employment_years: Number(formData.employment_years) || 0
      };
      const res = await apiClient.post('/applications/new/whatif', payload);
      setEligibilityResult(res.data);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map(d => `${d.loc[d.loc.length-1]}: ${d.msg}`).join(' | ') : (typeof detail === 'string' ? detail : 'Validation failed. Please check your inputs.'));
    }
  };

  const handleSubmit = async () => {
    if (!consent) return;
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        monthly_income: Number(formData.monthly_income) || 0,
        monthly_expenses: Number(formData.monthly_expenses) || 0,
        loan_amount: Number(formData.loan_amount) || 0,
        credit_score: Number(formData.credit_score) || 300,
        employment_years: Number(formData.employment_years) || 0
      };
      const res = await apiClient.post('/applications/new', payload);
      navigate(`/applicant/result`, { state: { application: res.data } });
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map(d => `${d.loc[d.loc.length-1]}: ${d.msg}`).join(' | ') : (typeof detail === 'string' ? detail : 'Submission failed. Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const formatINR = (val) => new Intl.NumberFormat('en-IN').format(val);

  const getCibilBand = (score) => {
    if (!score) return null;
    if (score < 550) return { label: 'Poor', color: 'var(--danger)' };
    if (score < 650) return { label: 'Fair', color: 'var(--warning)' };
    if (score < 750) return { label: 'Good', color: 'var(--lime-dark)' };
    if (score < 800) return { label: 'Very good', color: 'var(--lime)' };
    return { label: 'Excellent', color: 'var(--success)' };
  };

  const cibilBand = getCibilBand(formData.credit_score);

  return (
    <>
      <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map((i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            let bg = 'var(--page)';
            let color = 'var(--text-faint)';
            if (isCompleted) { bg = 'var(--dark)'; color = 'var(--white)'; }
            else if (isCurrent) { bg = 'var(--lime)'; color = 'var(--dark)'; }

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: bg, 
                  color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: '14px', zIndex: 2
                }}>
                  {isCompleted ? '✓' : i}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
                  {i === 1 ? 'Income' : i === 2 ? 'Loan' : i === 3 ? 'Credit' : i === 4 ? 'Employment' : 'Review'}
                </div>
                {i < 5 && (
                  <div style={{
                    position: 'absolute', top: '16px', left: '60%', right: '-40%', height: '2px',
                    background: isCompleted ? 'var(--dark)' : 'var(--border)', zIndex: 1
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-card)', padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)',
          animation: 'scaleIn 0.3s ease-out'
        }}>
          
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '4px', color: 'var(--dark)' }}>
            {step === 1 ? 'Financial profile' : 
             step === 2 ? 'Loan requirements' : 
             step === 3 ? 'Credit history' : 
             step === 4 ? 'Employment details' : 'Review & submit'}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
            {step === 1 ? 'Your income and expenses' : 
             step === 2 ? 'Details about the loan you need' : 
             step === 3 ? 'Your past credit behavior' : 
             step === 4 ? 'Your work and stability' : 'Almost done. Review your details.'}
          </p>

          {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Monthly income</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>₹</span>
                  <input type="text" placeholder="e.g. 75000"
                    value={formData.monthly_income} onChange={e => updateForm('monthly_income', e.target.value.replace(/\\D/g, ''))}
                    style={{ width: '100%', padding: '12px 12px 12px 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Your take-home salary or business income per month</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Monthly expenses</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>₹</span>
                  <input type="text" placeholder="e.g. 45000"
                    value={formData.monthly_expenses} onChange={e => updateForm('monthly_expenses', e.target.value.replace(/\\D/g, ''))}
                    style={{ width: '100%', padding: '12px 12px 12px 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Rent, utilities, groceries — all regular monthly outgoings</p>
              </div>

              {formData.monthly_income && formData.monthly_expenses && (
                <div style={{ background: preview.savings >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '16px', borderRadius: '12px', border: `1px solid ${preview.savings >= 0 ? 'var(--success)' : 'var(--danger)'}40` }}>
                  <div style={{ fontSize: '13px', color: preview.savings >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    Estimated savings capacity: ₹{formatINR(preview.savings)}/month
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Loan amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>₹</span>
                  <input type="text" placeholder="e.g. 500000"
                    value={formData.loan_amount} onChange={e => updateForm('loan_amount', e.target.value.replace(/\\D/g, ''))}
                    style={{ width: '100%', padding: '12px 12px 12px 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', marginBottom: '8px' }}>Total amount you wish to borrow</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[{l: '₹1L', v: 100000}, {l:'₹2L', v: 200000}, {l:'₹5L', v: 500000}, {l:'₹10L', v: 1000000}, {l:'₹20L', v: 2000000}, {l:'₹50L', v: 5000000}].map(p => (
                    <button key={p.l} onClick={() => updateForm('loan_amount', p.v)}
                      style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'var(--dark)' }}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Repayment tenure</label>
                <select value={formData.loan_tenure_months} onChange={e => updateForm('loan_tenure_months', parseNum(e.target.value))}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', background: 'var(--page)', fontFamily: 'var(--font-body)', fontSize: '14px', cursor: 'pointer' }}>
                  <option value="12">12 months (1 year)</option>
                  <option value="24">24 months (2 years)</option>
                  <option value="36">36 months (3 years)</option>
                  <option value="60">60 months (5 years)</option>
                  <option value="84">84 months (7 years)</option>
                  <option value="120">120 months (10 years)</option>
                  <option value="180">180 months (15 years)</option>
                  <option value="240">240 months (20 years)</option>
                  <option value="360">360 months (30 years)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Purpose of loan</label>
                <select value={formData.loan_purpose} onChange={e => updateForm('loan_purpose', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', background: 'var(--page)', fontFamily: 'var(--font-body)', fontSize: '14px', cursor: 'pointer' }}>
                  <option value="Home Purchase">Home Purchase</option>
                  <option value="Home Construction">Home Construction</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                  <option value="Personal">Personal</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.loan_amount && formData.loan_tenure_months && (
                <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: '12px', border: `1px solid var(--success)40` }}>
                  <div style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>
                    Estimated monthly EMI: ₹{formatINR(preview.newEmi.toFixed(0))}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--success)', opacity: 0.8, marginTop: '2px' }}>
                    at standard interest rates, actual EMI may vary
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>CIBIL / Credit score</label>
                <input type="number" min="300" max="900"
                  value={formData.credit_score} onChange={e => updateForm('credit_score', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', marginBottom: '8px' }}>Your credit score from CIBIL, Experian, or CRIF. Range: 300–900</p>
                
                {cibilBand && (
                  <div style={{ background: 'var(--page)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: cibilBand.color, width: '12px', height: '12px', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dark)' }}>{cibilBand.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Late payment history</label>
                <input type="number" min="0" max="20"
                  value={formData.late_payment_history} onChange={e => updateForm('late_payment_history', parseNum(e.target.value))}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Number of times you have paid EMIs/bills late in the past 2 years</p>
                
                {formData.late_payment_history > 3 && (
                  <div style={{ marginTop: '8px', padding: '10px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                    ⚠ More than 3 late payments significantly reduces approval chances
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Employment type</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['salaried', 'self-employed', 'business'].map(type => {
                    const isSelected = formData.employment_type === type;
                    return (
                      <div key={type} onClick={() => updateForm('employment_type', type)}
                        style={{
                          flex: 1, padding: '14px 18px', textAlign: 'center', cursor: 'pointer',
                          borderRadius: '12px', border: `1px solid ${isSelected ? 'var(--lime-dark)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--success-bg)' : 'var(--white)',
                          color: isSelected ? 'var(--success)' : 'var(--muted)',
                          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize'
                        }}>
                        {type.replace('-', ' ')}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Years in current employment</label>
                <input type="number" min="0" max="50"
                  value={formData.employment_years} onChange={e => updateForm('employment_years', e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', marginBottom: '8px' }}>How long you have been at your current job or running your business</p>
                {formData.employment_years !== '' && (
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--lime-dark)' }}>
                    {Number(formData.employment_years) < 1 ? 'Very new — higher risk' : Number(formData.employment_years) <= 3 ? 'Building stability' : Number(formData.employment_years) <= 5 ? 'Stable' : 'Strong stability'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Number of existing loans</label>
                  <input type="number" min="0" max="20"
                    value={formData.existing_loans_count} onChange={e => updateForm('existing_loans_count', parseNum(e.target.value))}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '6px' }}>Total monthly EMI</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>₹</span>
                    <input type="text" placeholder="e.g. 10000"
                      value={formData.total_existing_emi} onChange={e => updateForm('total_existing_emi', e.target.value.replace(/\\D/g, ''))}
                      style={{ width: '100%', padding: '12px 12px 12px 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--page)', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>Income</span>₹{formatINR(formData.monthly_income)}/mo</div>
                <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>Loan Amount</span>₹{formatINR(formData.loan_amount)}</div>
                <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>Tenure</span>{formData.loan_tenure_months} months</div>
                <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>CIBIL Score</span>{formData.credit_score}</div>
                <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>Employment</span>{formData.employment_type} ({formData.employment_years} yrs)</div>
                <div><span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>Existing EMI</span>₹{formatINR(formData.total_existing_emi)}/mo</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--success)40' }}>
                  <div style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 600 }}>Estimated EMI</div>
                  <div style={{ fontSize: '18px', color: 'var(--success)', fontWeight: 700 }}>₹{formatINR(preview.newEmi.toFixed(0))}/month</div>
                </div>
                
                <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--success)40' }}>
                  <div style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 600 }}>Debt-to-income ratio</div>
                  <div style={{ fontSize: '18px', color: preview.dti < 0.4 ? 'var(--success)' : preview.dti < 0.6 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>
                    {(preview.dti * 100).toFixed(1)}%
                  </div>
                </div>

                <div style={{ background: preview.disposable >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '16px', borderRadius: '12px', border: `1px solid ${preview.disposable >= 0 ? 'var(--success)' : 'var(--danger)'}40` }}>
                  <div style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 600 }}>Disposable income</div>
                  <div style={{ fontSize: '18px', color: preview.disposable >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                    ₹{formatINR(preview.disposable.toFixed(0))}/month
                  </div>
                </div>
              </div>

              <div>
                <button onClick={checkEligibility} style={{ width: '100%', padding: '12px', background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>
                  Check eligibility first
                </button>
                {eligibilityResult && (
                  <div style={{ textAlign: 'center', color: eligibilityResult.prediction === 'Y' ? 'var(--success)' : 'var(--danger)', fontWeight: 600, marginBottom: '16px' }}>
                    {eligibilityResult.prediction === 'Y' ? 'Likely Approved ✓' : 'Likely Rejected ✗'} ({Math.round(eligibilityResult.confidence * 100)}%)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '4px' }} />
                <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                  I confirm all information provided is accurate and authorize LoanSense to assess my application
                </p>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={!consent || loading}
                style={{
                  width: '100%', padding: '16px', background: consent ? 'var(--lime)' : 'var(--page)', 
                  color: 'var(--dark)', border: 'none', borderRadius: 'var(--radius-input)',
                  fontSize: '15px', fontWeight: 700, cursor: consent && !loading ? 'pointer' : 'not-allowed',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
            </div>
          )}

          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={handleBack} disabled={step === 1}
              style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', cursor: step === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: step === 1 ? 0.5 : 1 }}>
              Back
            </button>
            {step < 5 && (
              <button 
                onClick={handleNext}
                style={{ padding: '10px 24px', background: 'var(--dark)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Next
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
