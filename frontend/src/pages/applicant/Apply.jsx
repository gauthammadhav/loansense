import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

export default function ApplyWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State strictly mapping to ML Pipeline requirements
  // NOTE: income is MONTHLY, loan_amount is in THOUSANDS — matching training data scale
  const [formData, setFormData] = useState({
    gender: 'Male',
    married: false,
    dependents: 0,
    education: 'Graduate',
    self_employed: false,
    applicant_income: 6000,       // Monthly income in dollars
    coapplicant_income: 0,        // Monthly co-applicant income
    loan_amount: 150,             // In thousands (150 = $150,000)
    loan_amount_term: 360,        // In months
    purpose: 'Personal',
    property_type: 'Semiurban',   // Urban / Semiurban / Rural — used directly by ML model
    credit_score: 750
  });

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseNum = (val) => val === '' ? 0 : Number(val);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // POST to backend API (real-time ML inference occurs here)
      const res = await apiClient.post('/applications/', formData);
      
      // Navigate to results page passing the application data (which includes SHAP values)
      navigate('/applicant/result', { state: { application: res.data } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`h-2 flex-1 rounded-full overflow-hidden ${i <= step ? 'bg-lime' : 'bg-border'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-dark">Loan Application</h2>
        <p className="text-sm font-body text-muted mt-1">
          Complete these 5 steps to receive an instant, AI-powered decision.
        </p>
      </div>

      <Card>
        {renderStepIndicator()}
        
        {error && (
          <div className="p-3 mb-6 bg-danger-bg text-danger text-sm rounded-[10px] border border-danger/20">
            {error}
          </div>
        )}

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-heading font-bold border-b border-border pb-2 mb-4">Step 1: Personal Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>GENDER</Label>
                <Select value={formData.gender} onChange={e => updateForm('gender', e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
              <div>
                <Label>MARITAL STATUS</Label>
                <Select value={formData.married} onChange={e => updateForm('married', e.target.value === 'true')}>
                  <option value="false">Single</option>
                  <option value="true">Married</option>
                </Select>
              </div>
            </div>

            <div>
              <Label>NUMBER OF DEPENDENTS</Label>
              <Input 
                type="number" min="0" max="10"
                value={formData.dependents} 
                onChange={e => updateForm('dependents', parseNum(e.target.value))} 
              />
            </div>
          </div>
        )}

        {/* STEP 2: Education & Employment */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-heading font-bold border-b border-border pb-2 mb-4">Step 2: Education & Employment</h3>
            
            <div>
              <Label>EDUCATION LEVEL</Label>
              <Select value={formData.education} onChange={e => updateForm('education', e.target.value)}>
                <option value="Graduate">Graduate</option>
                <option value="Not Graduate">Not Graduate</option>
              </Select>
            </div>

            <div>
              <Label>EMPLOYMENT TYPE</Label>
              <Select value={formData.self_employed} onChange={e => updateForm('self_employed', e.target.value === 'true')}>
                <option value="false">Salaried / Employed</option>
                <option value="true">Self Employed / Business</option>
              </Select>
            </div>
          </div>
        )}

        {/* STEP 3: Financial Info */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-heading font-bold border-b border-border pb-2 mb-4">Step 3: Financial Information</h3>
            
            <div>
              <Label>MONTHLY APPLICANT INCOME ($)</Label>
              <Input 
                type="number" step="500" min="0"
                value={formData.applicant_income} 
                onChange={e => updateForm('applicant_income', parseNum(e.target.value))} 
              />
              <p className="text-xs text-muted mt-1">Enter your gross monthly salary (e.g. 6000 for $6,000/month).</p>
            </div>

            <div>
              <Label>MONTHLY CO-APPLICANT INCOME ($)</Label>
              <Input 
                type="number" step="500" min="0"
                value={formData.coapplicant_income} 
                onChange={e => updateForm('coapplicant_income', parseNum(e.target.value))} 
              />
              <p className="text-xs text-muted mt-1">Leave as 0 if applying alone. Enter monthly amount.</p>
            </div>
          </div>
        )}

        {/* STEP 4: Loan Request */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-heading font-bold border-b border-border pb-2 mb-4">Step 4: Loan Details</h3>
            
            <div>
              <Label>LOAN AMOUNT (IN THOUSANDS $)</Label>
              <Input 
                type="number" step="10" min="10" max="700"
                value={formData.loan_amount} 
                onChange={e => updateForm('loan_amount', parseNum(e.target.value))} 
              />
              <p className="text-xs text-muted mt-1">Enter in thousands. E.g. type <strong>150</strong> for a $150,000 loan.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>LOAN TERM (MONTHS)</Label>
                <Select value={formData.loan_amount_term} onChange={e => updateForm('loan_amount_term', parseNum(e.target.value))}>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="120">120 Months (10 Years)</option>
                  <option value="180">180 Months (15 Years)</option>
                  <option value="240">240 Months (20 Years)</option>
                  <option value="300">300 Months (25 Years)</option>
                  <option value="360">360 Months (30 Years)</option>
                  <option value="480">480 Months (40 Years)</option>
                </Select>
              </div>
              <div>
                <Label>LOAN PURPOSE</Label>
                <Select value={formData.purpose} onChange={e => updateForm('purpose', e.target.value)}>
                  <option value="Personal">Personal</option>
                  <option value="Business">Business</option>
                  <option value="Home">Home Purchase</option>
                  <option value="Education">Education</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Property & Credit */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-heading font-bold border-b border-border pb-2 mb-4">Step 5: Property & Credit</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PROPERTY AREA</Label>
                <Select value={formData.property_area} onChange={e => updateForm('property_area', e.target.value)}>
                  <option value="Urban">Urban</option>
                  <option value="Semiurban">Semiurban</option>
                  <option value="Rural">Rural</option>
                </Select>
              </div>
              <div>
                <Label>PROPERTY TYPE</Label>
                <Select value={formData.property_type} onChange={e => updateForm('property_type', e.target.value)}>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial">Commercial</option>
                </Select>
              </div>
            </div>

            <div>
              <Label>CREDIT SCORE (300–850)</Label>
              <Input 
                type="number" min="300" max="850" step="1"
                value={formData.credit_score} 
                onChange={e => updateForm('credit_score', parseNum(e.target.value))} 
              />
              <p className="text-xs text-muted mt-1">Score above 750 = clean credit history. Below 500 = poor history.</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={step === 1 || loading}
            className="w-28 gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>

          {step < 5 ? (
            <Button onClick={handleNext} className="w-28 gap-2">
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="w-36 gap-2 bg-success hover:bg-success/90">
              {loading ? 'Processing...' : <><CheckCircle size={16} /> Submit</>}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
