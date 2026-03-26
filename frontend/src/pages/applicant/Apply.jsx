import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  'Personal Details',
  'Education & Work',
  'Income',
  'Loan Request',
  'Property & Credit',
];

export default function ApplyWizard() {
  const navigate  = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [formData, setFormData] = useState({
    gender: 'Male',
    married: false,
    dependents: 0,
    education: 'Graduate',
    self_employed: false,
    applicant_income: 50000,
    coapplicant_income: 0,
    loan_amount: 150000,
    loan_amount_term: 360,
    purpose: 'Personal',
    property_area: 'Urban',
    property_type: 'House',
    credit_score: 700,
  });

  const update   = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const parseNum = (val) => val === '' ? 0 : Number(val);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/applications/', formData);
      navigate('/applicant/result', { state: { application: res.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const label = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-faint)',
    marginBottom: 6,
  };

  const sel = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--glass-border)',
    borderRadius: 10,
    padding: '11px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };

  const field = (labelText, children) => (
    <div>
      <label style={label}>{labelText}</label>
      {children}
    </div>
  );

  const stepContent = {
    1: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {field('Gender',
          <select style={sel} value={formData.gender} onChange={e => update('gender', e.target.value)}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        )}
        {field('Marital Status',
          <select style={sel} value={formData.married} onChange={e => update('married', e.target.value === 'true')}>
            <option value="false">Single</option><option value="true">Married</option>
          </select>
        )}
        {field('Number of Dependents',
          <Input type="number" min="0" max="10" value={formData.dependents} onChange={e => update('dependents', parseNum(e.target.value))} />
        )}
      </div>
    ),
    2: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {field('Education Level',
          <select style={sel} value={formData.education} onChange={e => update('education', e.target.value)}>
            <option>Graduate</option><option value="Not Graduate">Not Graduate</option>
          </select>
        )}
        {field('Employment Type',
          <select style={sel} value={formData.self_employed} onChange={e => update('self_employed', e.target.value === 'true')}>
            <option value="false">Salaried / Employed</option>
            <option value="true">Self Employed / Business</option>
          </select>
        )}
      </div>
    ),
    3: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {field('Annual Applicant Income (₹)',
          <Input type="number" step="1000" min="0" value={formData.applicant_income} onChange={e => update('applicant_income', parseNum(e.target.value))} />
        )}
        {field('Annual Co-Applicant Income (₹)',
          <>
            <Input type="number" step="1000" min="0" value={formData.coapplicant_income} onChange={e => update('coapplicant_income', parseNum(e.target.value))} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-faint)', marginTop: 5 }}>Leave as 0 if applying alone.</p>
          </>
        )}
      </div>
    ),
    4: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {field('Loan Amount Requested (₹)',
          <Input type="number" step="1000" min="1000" value={formData.loan_amount} onChange={e => update('loan_amount', parseNum(e.target.value))} />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Loan Term',
            <select style={sel} value={formData.loan_amount_term} onChange={e => update('loan_amount_term', parseNum(e.target.value))}>
              <option value="120">120 Days (4 mo)</option>
              <option value="360">360 Days (1 yr)</option>
              <option value="1800">1800 Days (5 yr)</option>
              <option value="3600">3600 Days (10 yr)</option>
            </select>
          )}
          {field('Purpose',
            <select style={sel} value={formData.purpose} onChange={e => update('purpose', e.target.value)}>
              <option>Personal</option><option>Business</option>
              <option value="Home">Home Purchase</option><option>Education</option>
            </select>
          )}
        </div>
      </div>
    ),
    5: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Property Area',
            <select style={sel} value={formData.property_area} onChange={e => update('property_area', e.target.value)}>
              <option>Urban</option><option>Semiurban</option><option>Rural</option>
            </select>
          )}
          {field('Property Type',
            <select style={sel} value={formData.property_type} onChange={e => update('property_type', e.target.value)}>
              <option>House</option><option>Apartment</option><option>Commercial</option>
            </select>
          )}
        </div>
        {field('Estimated Credit Score',
          <Input type="number" min="300" max="850" value={formData.credit_score} onChange={e => update('credit_score', parseNum(e.target.value))} />
        )}
      </div>
    ),
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Loan Application
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Complete these 5 steps to receive an instant AI-powered decision.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card" style={{ padding: 28 }}>

          {/* Step progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < step ? 'var(--lime)' : 'var(--glass-border)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--lime-dark)' }}>
                Step {step} of {STEPS.length}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {STEPS[step - 1]}
              </span>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--danger)', marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}>
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--glass-border)' }}>
            <Button
              variant="ghost"
              disabled={step === 1 || loading}
              onClick={() => setStep(s => Math.max(s - 1, 1))}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back
            </Button>

            {step < 5 ? (
              <Button
                variant="primary"
                onClick={() => setStep(s => Math.min(s + 1, 5))}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Next <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={loading}
                onClick={handleSubmit}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  : <><CheckCircle size={14} /> Submit</>
                }
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
