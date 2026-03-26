import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ShapChart from '../../components/ui/ShapChart';
import WhatIfSimulator from '../../components/ui/WhatIfSimulator';
import { ArrowLeft } from 'lucide-react';

export default function ApplicantResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application;

  if (!application) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <p className="text-muted font-body mb-4">No application data found.</p>
        <Button onClick={() => navigate('/applicant/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  // Handle both string and parsed object for shap_values safely
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/applicant/dashboard')} className="p-2 border border-border rounded-full hover:bg-page transition-colors text-muted">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-heading font-bold text-dark">Loan Prediction Result</h2>
          <p className="text-sm font-body text-muted mt-1">Application #{application.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={isApproved ? 'border-success border-[2px]' : 'border-danger border-[2px]'}>
          <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-2">Machine Learning Decision</h3>
          <div className={`text-4xl font-heading font-bold ${isApproved ? 'text-success' : 'text-danger'}`}>
            {isApproved ? 'Favorable' : 'High Risk'}
          </div>
          <div className="mt-6 text-sm font-body text-dark">
            <span className="font-bold">Confidence:</span> {(application.ml_confidence * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-sm font-body text-dark">
            <span className="font-bold">Risk Band:</span> <span className="capitalize">{application.ml_risk_band?.replace('_', ' ')}</span>
          </div>
          
          <div className="mt-8 pt-4 border-t border-border">
            <p className="text-sm text-muted italic font-body">
              This prediction is preliminary. A loan officer will review your application shortly.
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-4">AI Explainability (SHAP)</h3>
          <p className="text-xs text-muted font-body mb-2">
            Features pushing <span className="text-success font-bold">Green</span> increase approval likelihood. 
            Features pushing <span className="text-danger font-bold">Red</span> increase rejection likelihood.
          </p>
          <ShapChart shapValues={parsedShap} />
        </Card>
      </div>
      
      {/* WhatIfSimulator component (Step 9) */}
      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-lg font-heading font-bold text-dark mb-4">What-If Analysis</h3>
        <Card className="bg-page/20 border-border">
          <WhatIfSimulator application={application} />
        </Card>
      </div>
    </div>
  );
}
