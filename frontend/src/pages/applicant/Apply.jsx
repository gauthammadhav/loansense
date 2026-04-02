import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import apiClient from '../../api/client';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
      setLoading(true);
      const res = await apiClient.post('/applications/new/whatif', payload);
      setEligibilityResult(res.data);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map(d => `${d.loc[d.loc.length-1]}: ${d.msg}`).join(' | ') : (typeof detail === 'string' ? detail : 'Validation failed. Please check your inputs.'));
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
        employment_years: Number(formData.employment_years) || 0
      };
      const res = await apiClient.post('/applications/new', payload);
      navigate(`/applicant/result/${res.data.id}`, { state: { application: res.data } });
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

  const steps = [
    { id: 1, title: 'Financial Profile', desc: 'Income and expenses' },
    { id: 2, title: 'Loan Details', desc: 'Requirements and purpose' },
    { id: 3, title: 'Credit History', desc: 'CIBIL and behavior' },
    { id: 4, title: 'Employment', desc: 'Work and stability' },
    { id: 5, title: 'Review', desc: 'Verify and submit' }
  ];

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 mt-4">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-black mb-3">Loan Application</h1>
        <p className="text-text-muted">Complete the following steps to initialize your machine-learning risk assessment.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center relative mb-12">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 z-0 rounded-full" />
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-lime z-0 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        />
        
        {steps.map((s, index) => {
          const isCompleted = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <motion.div 
                animate={{ 
                  backgroundColor: isCurrent ? 'var(--lime)' : isCompleted ? 'var(--lime-dark)' : 'var(--dark2)',
                  borderColor: isCurrent || isCompleted ? 'var(--lime)' : 'var(--border)'
                }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${isCurrent ? 'text-dark shadow-[0_0_15px_rgba(200,241,53,0.3)]' : isCompleted ? 'text-dark' : 'text-text-muted'}`}
              >
                {isCompleted ? <Check size={16} /> : s.id}
              </motion.div>
              <div className="absolute top-12 whitespace-nowrap text-center">
                 <div className={`text-xs font-bold font-heading hidden sm:block ${isCurrent ? 'text-lime' : isCompleted ? 'text-white' : 'text-text-muted'}`}>{s.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
             initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
             className="mb-8 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium flex items-center gap-2"
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Container */}
      <div className="glass-strong rounded-[24px] p-8 sm:p-10 relative overflow-hidden min-h-[400px]">
        
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={step}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="w-full flex-1"
          >
            <h2 className="text-2xl font-heading font-bold mb-1 text-white">{steps[step-1].title}</h2>
            <p className="text-sm text-text-muted mb-8">{steps[step-1].desc}</p>

            {/* STEP 1: FINANCIALS */}
            {step === 1 && (
              <div className="space-y-6">
                <Input 
                  label="Monthly Income"
                  value={formData.monthly_income}
                  onChange={e => updateForm('monthly_income', e.target.value.replace(/\D/g, ''))}
                  icon={<span className="font-bold text-lg">₹</span>}
                  placeholder="e.g. 75000"
                />
                
                <Input 
                  label="Monthly Expenses"
                  value={formData.monthly_expenses}
                  onChange={e => updateForm('monthly_expenses', e.target.value.replace(/\D/g, ''))}
                  icon={<span className="font-bold text-lg">₹</span>}
                  placeholder="e.g. 45000"
                />

                <AnimatePresence>
                  {formData.monthly_income && formData.monthly_expenses && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                      <div className={`p-4 rounded-xl border flex items-center gap-3 ${preview.savings >= 0 ? 'bg-success/5 border-success/20 text-success' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                        <Activity size={20} />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider mb-0.5">Estimated Savings Capacity</div>
                          <div className="text-lg font-bold font-mono">₹{formatINR(preview.savings)}/mo</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 2: LOAN DETAILS */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <Input 
                    label="Loan Amount Required"
                    value={formData.loan_amount}
                    onChange={e => updateForm('loan_amount', e.target.value.replace(/\D/g, ''))}
                    icon={<span className="font-bold text-lg">₹</span>}
                    placeholder="e.g. 500000"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[{l: '₹1L', v: 100000}, {l:'₹2L', v: 200000}, {l:'₹5L', v: 500000}, {l:'₹10L', v: 1000000}, {l:'₹20L', v: 2000000}].map(p => (
                      <button key={p.l} onClick={() => updateForm('loan_amount', p.v)} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-colors text-white">
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted font-bold uppercase tracking-wider ml-1">Repayment Tenure</label>
                    <div className="relative border border-white/10 rounded-xl bg-white/5 hover:border-lime/50 transition-colors">
                      <select value={formData.loan_tenure_months} onChange={e => updateForm('loan_tenure_months', parseNum(e.target.value))} className="w-full bg-transparent text-white p-4 outline-none appearance-none cursor-pointer">
                        {[12, 24, 36, 60, 84, 120, 180, 240, 360].map(m => (
                          <option key={m} value={m} className="bg-dark text-white">{m} months ({m/12} years)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted font-bold uppercase tracking-wider ml-1">Purpose of Loan</label>
                    <div className="relative border border-white/10 rounded-xl bg-white/5 hover:border-lime/50 transition-colors">
                      <select value={formData.loan_purpose} onChange={e => updateForm('loan_purpose', e.target.value)} className="w-full bg-transparent text-white p-4 outline-none appearance-none cursor-pointer">
                        {['Home Purchase', 'Home Construction', 'Vehicle', 'Education', 'Business', 'Personal', 'Medical', 'Other'].map(type => (
                          <option key={type} value={type} className="bg-dark text-white">{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {formData.loan_amount && (
                   <div className="p-4 rounded-xl border bg-info/5 border-info/20 text-info flex items-center gap-3">
                      <Activity size={20} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-0.5">Estimated Monthly EMI</div>
                        <div className="text-lg font-bold font-mono">₹{formatINR(preview.newEmi.toFixed(0))}</div>
                      </div>
                   </div>
                )}
              </div>
            )}

            {/* STEP 3: CREDIT HISTORY */}
            {step === 3 && (
              <div className="space-y-6">
                <Input 
                  label="Credit Score (CIBIL)"
                  value={formData.credit_score}
                  onChange={e => updateForm('credit_score', e.target.value)}
                  type="number"
                  placeholder="Range 300 - 900"
                />

                <Input 
                  label="Late Payment History"
                  value={formData.late_payment_history}
                  onChange={e => updateForm('late_payment_history', parseNum(e.target.value))}
                  type="number"
                  placeholder="Number of missed EMIs in 2 years"
                />

                <AnimatePresence>
                  {formData.late_payment_history > 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-2 text-sm font-bold">
                      <AlertCircle size={16} /> More than 3 late payments severely impacts ML approval probability.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STEP 4: EMPLOYMENT */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-muted font-bold uppercase tracking-wider ml-1">Employment Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['salaried', 'self-employed', 'business'].map(type => (
                      <div 
                        key={type} 
                        onClick={() => updateForm('employment_type', type)}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all font-medium text-sm capitalize ${formData.employment_type === type ? 'bg-lime/10 border-lime text-lime shadow-[0_0_10px_rgba(200,241,53,0.1)]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                      >
                        {type.replace('-', ' ')}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Years Employed"
                    value={formData.employment_years}
                    onChange={e => updateForm('employment_years', e.target.value)}
                    type="number"
                  />
                  <Input 
                    label="Active Loans Count"
                    value={formData.existing_loans_count}
                    onChange={e => updateForm('existing_loans_count', parseNum(e.target.value))}
                    type="number"
                  />
                </div>

                <Input 
                  label="Total Active EMI Value"
                  value={formData.total_existing_emi}
                  onChange={e => updateForm('total_existing_emi', e.target.value.replace(/\D/g, ''))}
                  icon={<span className="font-bold text-lg">₹</span>}
                />
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {step === 5 && (
              <div className="space-y-6">
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">Total Savings</div>
                      <div className="text-lg font-bold font-mono text-white">₹{formatINR(preview.savings)}/mo</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">DTI Ratio</div>
                      <div className={`text-lg font-bold font-mono ${preview.dti > 0.6 ? 'text-danger' : 'text-success'}`}>{Number(preview.dti * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 col-span-2 md:col-span-1">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">Expected EMI</div>
                      <div className="text-lg font-bold font-mono text-white">₹{formatINR(preview.newEmi.toFixed(0))}</div>
                    </div>
                 </div>

                 {/* Pre-flight Check */}
                 <div className="pt-4 border-t border-white/10">
                    <Button variant="secondary" onClick={checkEligibility} loading={loading && !eligibilityResult} className="w-full mb-4" icon={<Activity size={18} />}>
                      Run Preliminary Assessment
                    </Button>

                    <AnimatePresence>
                      {eligibilityResult && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-xl border mb-4 flex items-center gap-3 ${eligibilityResult.prediction === 'Y' ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
                           {eligibilityResult.prediction === 'Y' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                           <div>
                             <div className="font-bold">ML Model Pre-Approval: {eligibilityResult.prediction === 'Y' ? 'Favorable' : 'High Risk'}</div>
                             <div className="text-xs opacity-80">Confidence: {(eligibilityResult.confidence * 100).toFixed(1)}%</div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>

                 <label className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="mt-1 accent-lime w-4 h-4" checked={consent} onChange={e => setConsent(e.target.checked)} />
                    <span className="text-xs text-text-muted leading-relaxed">I confirm the above financial information is truthful. I authorize LoanSense to utilize algorithmic fairness processing on this data to render an approval decision.</span>
                 </label>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center mt-8">
        <Button variant="ghost" disabled={step === 1} onClick={handleBack} icon={<ArrowLeft size={16} />}>
          Previous
        </Button>
        
        {step < 5 ? (
          <Button variant="primary" onClick={handleNext} className="min-w-[120px]">
            Continue <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={!consent || loading} loading={loading} className="min-w-[160px] bg-white text-dark hover:bg-white/90 focus-visible:ring-white">
            Submit Application <ShieldCheck size={16} className="ml-2" />
          </Button>
        )}
      </div>

    </div>
  );
}
