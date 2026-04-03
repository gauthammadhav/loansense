import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const STEPS = [
  { id: 1, title: 'Financial Profile', desc: 'Income and monthly expenses' },
  { id: 2, title: 'Loan Details', desc: 'Amount, tenure and purpose' },
  { id: 3, title: 'Credit History', desc: 'CIBIL score and payment record' },
  { id: 4, title: 'Employment', desc: 'Work type and stability' },
  { id: 5, title: 'Review & Submit', desc: 'Verify and finalize' },
];

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
    loan_purpose: 'General',
  });

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const parseNum = (val) => val === '' ? '' : Number(val);
  const formatINR = (val) => new Intl.NumberFormat('en-IN').format(val);

  const preview = (() => {
    const income = Number(formData.monthly_income) || 0;
    const expenses = Number(formData.monthly_expenses) || 0;
    const loan = Number(formData.loan_amount) || 0;
    const tenure = Number(formData.loan_tenure_months) || 1;
    const emi = Number(formData.total_existing_emi) || 0;
    const newEmi = loan / tenure;
    return {
      savings: income - expenses,
      newEmi,
      dti: income > 0 ? (emi + newEmi) / income : 0,
      disposable: income - expenses - emi - newEmi,
    };
  })();

  const checkEligibility = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        monthly_income: Number(formData.monthly_income) || 0,
        monthly_expenses: Number(formData.monthly_expenses) || 0,
        loan_amount: Number(formData.loan_amount) || 0,
        credit_score: Number(formData.credit_score) || 300,
        employment_years: Number(formData.employment_years) || 0,
      };
      const res = await apiClient.post('/applications/new/whatif', payload);
      setEligibilityResult(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail)
        ? detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(' | ')
        : (typeof detail === 'string' ? detail : 'Validation failed. Please check your inputs.'));
    } finally {
      setLoading(false);
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
        employment_years: Number(formData.employment_years) || 0,
      };
      const res = await apiClient.post('/applications/new', payload);
      navigate(`/applicant/result/${res.data.id}`, { state: { application: res.data } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail)
        ? detail.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(' | ')
        : (typeof detail === 'string' ? detail : 'Submission failed. Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  // Shared select style
  const selectStyle = {
    width: '100%', backgroundColor: 'transparent', border: 'none',
    padding: '14px 16px', outline: 'none', appearance: 'none',
    cursor: 'pointer', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit',
  };
  const selectWrap = (focused) => ({
    border: `1.5px solid ${focused ? 'var(--lime)' : '#e2e8f0'}`,
    borderRadius: 12, backgroundColor: '#f8fafc',
    boxShadow: focused ? '0 0 0 3px rgba(200,241,53,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    overflow: 'hidden',
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Loan Application
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
          Complete the following steps to initialize your machine-learning risk assessment.
        </p>
      </div>

      {/* Progress Stepper */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
        {/* Track */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 3, backgroundColor: '#e2e8f0', borderRadius: 99, zIndex: 0 }} />
        <motion.div
          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 3, backgroundColor: 'var(--lime)', borderRadius: 99, zIndex: 0 }}
          initial={{ width: 0 }}
          animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ ease: 'easeInOut', duration: 0.5 }}
        />
        {STEPS.map((s) => {
          const isCompleted = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                animate={{
                  backgroundColor: isCurrent ? 'var(--lime)' : isCompleted ? 'var(--lime-dark)' : 'white',
                  borderColor: isCurrent || isCompleted ? 'var(--lime)' : '#e2e8f0',
                  scale: isCurrent ? 1.15 : 1,
                }}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: '2.5px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13,
                  color: isCurrent || isCompleted ? 'var(--text)' : 'var(--text-muted)',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(200,241,53,0.25)' : 'none',
                }}
              >
                {isCompleted ? <Check size={15} /> : s.id}
              </motion.div>
              <div style={{ position: 'absolute', top: 46, whiteSpace: 'nowrap', textAlign: 'center' }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.01em',
                  color: isCurrent ? 'var(--lime-dark)' : isCompleted ? 'var(--text)' : 'var(--text-muted)',
                }}>
                  {s.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 12,
              backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)',
              color: 'var(--danger-dark)', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step container */}
      <div style={{
        backgroundColor: 'white', border: '1px solid var(--glass-border)',
        borderRadius: 24, padding: '36px 40px',
        boxShadow: 'var(--shadow-md)',
        minHeight: 360, position: 'relative', overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -32, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                {STEPS[step - 1].title}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{STEPS[step - 1].desc}</p>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input
                  label="Monthly Income"
                  value={formData.monthly_income}
                  onChange={e => updateForm('monthly_income', e.target.value.replace(/\D/g, ''))}
                  icon={<span style={{ fontWeight: 700, fontSize: 16 }}>₹</span>}
                />
                <Input
                  label="Monthly Expenses"
                  value={formData.monthly_expenses}
                  onChange={e => updateForm('monthly_expenses', e.target.value.replace(/\D/g, ''))}
                  icon={<span style={{ fontWeight: 700, fontSize: 16 }}>₹</span>}
                />
                <AnimatePresence>
                  {formData.monthly_income && formData.monthly_expenses && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        padding: '14px 18px', borderRadius: 12,
                        backgroundColor: preview.savings >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${preview.savings >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`,
                        color: preview.savings >= 0 ? 'var(--success-dark)' : 'var(--danger-dark)',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <Activity size={18} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Estimated Savings Capacity</div>
                        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace' }}>₹{formatINR(preview.savings)}/mo</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <Input
                    label="Loan Amount Required"
                    value={formData.loan_amount}
                    onChange={e => updateForm('loan_amount', e.target.value.replace(/\D/g, ''))}
                    icon={<span style={{ fontWeight: 700, fontSize: 16 }}>₹</span>}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {[{ l: '₹1L', v: 100000 }, { l: '₹2L', v: 200000 }, { l: '₹5L', v: 500000 }, { l: '₹10L', v: 1000000 }, { l: '₹20L', v: 2000000 }].map(p => (
                      <button
                        key={p.l} onClick={() => updateForm('loan_amount', p.v)}
                        style={{
                          padding: '4px 14px', backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0', borderRadius: 99,
                          fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          color: 'var(--text)', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Repayment Tenure</label>
                    <div style={selectWrap(false)}>
                      <select
                        value={formData.loan_tenure_months}
                        onChange={e => updateForm('loan_tenure_months', parseNum(e.target.value))}
                        style={selectStyle}
                      >
                        {[12, 24, 36, 60, 84, 120, 180, 240, 360].map(m => (
                          <option key={m} value={m}>{m} months ({(m / 12).toFixed(0)} yrs)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Purpose of Loan</label>
                    <div style={selectWrap(false)}>
                      <select
                        value={formData.loan_purpose}
                        onChange={e => updateForm('loan_purpose', e.target.value)}
                        style={selectStyle}
                      >
                        {['Home Purchase', 'Home Construction', 'Vehicle', 'Education', 'Business', 'Personal', 'Medical', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {formData.loan_amount && (
                  <div style={{
                    padding: '14px 18px', borderRadius: 12,
                    backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
                    color: 'var(--info-dark)', display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <Activity size={18} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Estimated Monthly EMI</div>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace' }}>₹{formatINR(preview.newEmi.toFixed(0))}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Input
                  label="Credit Score (CIBIL)"
                  value={formData.credit_score}
                  onChange={e => updateForm('credit_score', e.target.value)}
                  type="number"
                />
                <Input
                  label="Late Payment History (last 2 years)"
                  value={formData.late_payment_history}
                  onChange={e => updateForm('late_payment_history', parseNum(e.target.value))}
                  type="number"
                />
                <AnimatePresence>
                  {formData.late_payment_history > 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{
                        padding: '12px 16px', borderRadius: 12,
                        backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)',
                        color: 'var(--danger-dark)', fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <AlertCircle size={16} /> More than 3 late payments severely impacts ML approval probability.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Employment Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {['salaried', 'self-employed', 'business'].map(type => (
                      <div
                        key={type}
                        onClick={() => updateForm('employment_type', type)}
                        style={{
                          padding: '12px 8px', borderRadius: 12,
                          border: `1.5px solid ${formData.employment_type === type ? 'var(--lime)' : '#e2e8f0'}`,
                          backgroundColor: formData.employment_type === type ? 'rgba(200,241,53,0.1)' : '#f8fafc',
                          textAlign: 'center', cursor: 'pointer',
                          fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                          color: formData.employment_type === type ? 'var(--lime-dark)' : 'var(--text)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {type.replace('-', ' ')}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Input label="Years Employed" value={formData.employment_years} onChange={e => updateForm('employment_years', e.target.value)} type="number" />
                  <Input label="Active Loans Count" value={formData.existing_loans_count} onChange={e => updateForm('existing_loans_count', parseNum(e.target.value))} type="number" />
                </div>

                <Input
                  label="Total Active EMI Value"
                  value={formData.total_existing_emi}
                  onChange={e => updateForm('total_existing_emi', e.target.value.replace(/\D/g, ''))}
                  icon={<span style={{ fontWeight: 700, fontSize: 16 }}>₹</span>}
                />
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Summary metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Total Savings', value: `₹${formatINR(preview.savings)}/mo`, color: 'var(--text)' },
                    { label: 'DTI Ratio', value: `${(preview.dti * 100).toFixed(1)}%`, color: preview.dti > 0.6 ? 'var(--danger-dark)' : 'var(--success-dark)' },
                    { label: 'Expected EMI', value: `₹${formatINR(preview.newEmi.toFixed(0))}`, color: 'var(--text)' },
                  ].map(m => (
                    <div key={m.label} style={{
                      padding: '16px', backgroundColor: '#f8fafc',
                      border: '1px solid var(--glass-border)', borderRadius: 14,
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* ML pre-check */}
                <div style={{ paddingTop: 8, borderTop: '1px solid var(--glass-border)' }}>
                  <Button variant="secondary" onClick={checkEligibility} loading={loading && !eligibilityResult} className="w-full" icon={<Activity size={17} />}>
                    Run Preliminary ML Assessment
                  </Button>
                </div>

                <AnimatePresence>
                  {eligibilityResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                      style={{
                        padding: '16px 20px', borderRadius: 14,
                        backgroundColor: eligibilityResult.prediction === 'Y' ? 'rgba(34,197,94,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${eligibilityResult.prediction === 'Y' ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)'}`,
                        color: eligibilityResult.prediction === 'Y' ? 'var(--success-dark)' : 'var(--danger-dark)',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}
                    >
                      {eligibilityResult.prediction === 'Y' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                          ML Pre-Approval: {eligibilityResult.prediction === 'Y' ? 'Favorable' : 'High Risk'}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                          Confidence: {(eligibilityResult.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Consent */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 18px', borderRadius: 14,
                  backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                    style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--lime-dark)', flexShrink: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    I confirm the above financial information is truthful. I authorize LoanSense to utilize algorithmic fairness processing on this data to render an approval decision.
                  </span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <Button variant="ghost" disabled={step === 1} onClick={handleBack} icon={<ArrowLeft size={16} />}>
          Previous
        </Button>
        {step < 5 ? (
          <Button variant="primary" onClick={handleNext}>
            Continue <ArrowRight size={16} style={{ marginLeft: 6 }} />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={!consent || loading} loading={loading}>
            Submit Application <ShieldCheck size={16} style={{ marginLeft: 6 }} />
          </Button>
        )}
      </div>
    </div>
  );
}
