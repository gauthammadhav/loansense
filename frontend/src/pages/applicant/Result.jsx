import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ShapChart from '../../components/ui/ShapChart';
import WhatIfSimulator from '../../components/ui/WhatIfSimulator';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/applicant/dashboard')} className="p-2 border border-border rounded-full hover:bg-page transition-colors text-muted hover:text-dark">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-heading font-bold text-dark">Loan Prediction Result</h2>
          <p className="text-sm font-body text-muted mt-1">Application #{application.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, stiffness: 300, damping: 20 }}
        >
          <Card className={isApproved ? 'border-success border-[2px] shadow-[0_0_20px_rgba(46,204,113,0.1)]' : 'border-danger border-[2px] shadow-[0_0_20px_rgba(231,76,60,0.1)]'}>
            <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-2">Machine Learning Decision</h3>
            <div className={`text-5xl tracking-tight font-heading font-bold ${isApproved ? 'text-success' : 'text-danger'}`}>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 300, damping: 20 }}
        >
          <Card className="h-full">
            <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-4">AI Explainability (SHAP)</h3>
            <p className="text-xs text-muted font-body mb-2">
              Features pushing <span className="text-success font-bold">Green</span> increase approval likelihood. 
              Features pushing <span className="text-danger font-bold">Red</span> increase rejection likelihood.
            </p>
            <ShapChart shapValues={parsedShap} />
          </Card>
        </motion.div>
      </div>
      
      {/* WhatIfSimulator component (Step 9) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 pt-8 border-t border-border"
      >
        <h3 className="text-lg font-heading font-bold text-dark mb-4">What-If Analysis</h3>
        <Card className="bg-page/20 border-border">
          <WhatIfSimulator application={application} />
        </Card>
      </motion.div>
    </motion.div>
  );
}
