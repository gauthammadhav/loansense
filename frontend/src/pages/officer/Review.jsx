import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import ShapChart from '../../components/ui/ShapChart';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function OfficerReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const application = location.state?.application;

  const [audits, setAudits] = useState([]);
  const [decision, setDecision] = useState(''); // 'Y' or 'N'
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (application) {
      fetchAudits(application.id);
    }
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
      await apiClient.post(`/officer/decide/${application.id}`, {
        decision,
        override_reason: overrideReason
      });
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit decision.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <p className="text-muted font-body mb-4">No application selected for review.</p>
        <Button onClick={() => navigate('/officer/dashboard')}>Return to Queue</Button>
      </div>
    );
  }

  // Handle both string and parsed object for shap_values safely
  let parsedShap = {};
  if (typeof application.shap_values === 'string') {
    try { parsedShap = JSON.parse(application.shap_values); } catch (e) {}
  } else if (application.shap_values) {
    parsedShap = application.shap_values;
  }

  const isFavorable = application.ml_prediction === 'Y';
  const needsOverride = decision && decision !== application.ml_prediction;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/officer/dashboard')} className="p-2 border border-border rounded-full hover:bg-page transition-colors text-muted">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-heading font-bold text-dark">Review Application APP-{application.id.toString().padStart(4, '0')}</h2>
          <p className="text-sm font-body text-muted mt-1">Submitted on {new Date(application.submitted_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Details & Audit */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-4 border-b border-border pb-2">Applicant Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Gender & Marital</p>
                <p className="text-sm font-body font-medium text-dark">{application.gender || 'N/A'}, {application.married ? 'Married' : 'Single'}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Education</p>
                <p className="text-sm font-body font-medium text-dark">{application.education}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Employment</p>
                <p className="text-sm font-body font-medium text-dark">{application.self_employed ? 'Self Employed' : 'Salaried'}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Applicant Income</p>
                <p className="text-sm font-body font-medium text-dark">${application.applicant_income?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Co-Applicant Income</p>
                <p className="text-sm font-body font-medium text-dark">${application.coapplicant_income?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Credit Score</p>
                <p className="text-sm font-body font-medium text-dark">{application.credit_score}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Loan Request</p>
                <p className="text-sm font-body font-medium text-dark">${application.loan_amount?.toLocaleString()} / {application.loan_amount_term} days</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Purpose</p>
                <p className="text-sm font-body font-medium text-dark">{application.purpose}</p>
              </div>
              <div>
                <p className="text-[11px] text-faint font-bold font-body uppercase">Property</p>
                <p className="text-sm font-body font-medium text-dark">{application.property_type} ({application.property_area})</p>
              </div>
            </div>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-4 border-b border-border pb-2">Audit Timeline</h3>
            <div className="space-y-4">
              {audits.map((audit, i) => (
                <div key={audit.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-lime border-[2px] border-white ring-1 ring-border mt-1"></div>
                    {i !== audits.length - 1 && <div className="w-[1px] h-full bg-border mt-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-bold font-body text-dark uppercase">{audit.action?.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] font-body text-muted">{new Date(audit.created_at).toLocaleString()}</p>
                    {audit.detail && (
                      <p className="text-xs font-body text-dark bg-page/50 p-2 rounded-md mt-1 border border-border break-words overflow-hidden text-ellipsis max-w-full">
                        {audit.detail?.substring(0, 80)}{audit.detail?.length > 80 && '...'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {audits.length === 0 && <p className="text-sm text-muted font-body">No timeline available.</p>}
            </div>
          </Card>
        </div>

        {/* Right Col: ML & Decision */}
        <div className="space-y-6">
          <Card className={isFavorable ? 'border-success border-[2px]' : 'border-danger border-[2px]'}>
            <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-2">ML Recommendation</h3>
            <div className={`text-3xl font-heading font-bold ${isFavorable ? 'text-success' : 'text-danger'}`}>
              {isFavorable ? 'Approve' : 'Reject'}
            </div>
            <div className="mt-2 text-sm font-body text-dark">
              <span className="font-bold">Confidence:</span> {(application.ml_confidence * 100).toFixed(1)}%
            </div>
          </Card>

          <Card>
            <h3 className="text-xs uppercase font-bold text-faint tracking-wider mb-2 border-b border-border pb-2">Analysis</h3>
            <ShapChart shapValues={parsedShap} />
          </Card>

          <Card className="bg-page/50 border-border">
            <h3 className="text-xs uppercase font-bold text-dark tracking-wider mb-4">Final Decision</h3>
            
            {error && (
              <div className="p-3 mb-4 bg-danger-bg text-danger text-xs rounded-[10px] border border-danger/20 font-body">
                {error}
              </div>
            )}

            <div className="flex gap-4 mb-4">
              <Button 
                variant={decision === 'Y' ? 'primary' : 'outline'} 
                className={`flex-1 ${decision === 'Y' ? 'bg-success text-white border-success' : 'hover:border-success hover:text-success'}`}
                onClick={() => setDecision('Y')}
              >
                <CheckCircle size={16} className="mr-2"/> Approve
              </Button>
              <Button 
                variant={decision === 'N' ? 'primary' : 'outline'} 
                className={`flex-1 ${decision === 'N' ? 'bg-danger text-white border-danger' : 'hover:border-danger hover:text-danger'}`}
                onClick={() => setDecision('N')}
              >
                <XCircle size={16} className="mr-2"/> Reject
              </Button>
            </div>

            {decision && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div>
                  <label className="text-[12px] font-bold font-body text-dark tracking-wide mb-1.5 block">
                    OVERRIDE / REVIEW NOTES {needsOverride && <span className="text-danger">*</span>}
                  </label>
                  <textarea 
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full h-24 rounded-[var(--radius-input)] border-[1.5px] border-border bg-white p-3 text-sm text-dark focus:outline-none focus:border-dark resize-none"
                    placeholder={needsOverride ? "You must provide a reason for overriding the ML..." : "Optional internal notes..."}
                  />
                </div>
                
                <Button 
                  onClick={handleDecision} 
                  disabled={submitting || !decision} 
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Confirm Decision'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
