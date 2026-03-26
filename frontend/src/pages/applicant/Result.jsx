import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import ShapChart from '../../components/ui/ShapChart';
import WhatIfSimulator from '../../components/ui/WhatIfSimulator';
import { ArrowLeft, BrainCircuit, Activity } from 'lucide-react';

export default function ApplicantResult() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const application = location.state?.application;

  if (!application) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: 80, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
          <BrainCircuit size={26} />
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>No application context found.</p>
        <Button variant="secondary" onClick={() => navigate('/applicant/dashboard')}>Return to Dashboard</Button>
      </motion.div>
    );
  }

  let parsedShap = {};
  if (typeof application.shap_values === 'string') {
    try { parsedShap = JSON.parse(application.shap_values); } catch (e) {}
  } else if (application.shap_values) {
    parsedShap = application.shap_values;
  }

  const isApproved = application.ml_prediction === 'Y';
  const decisionColor = isApproved ? 'var(--success)' : 'var(--danger)';

  const dataRow = (label, value) => (
    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/applicant/dashboard')}
          style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Decision Breakdown
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
            Application LS-{application.id?.toString().padStart(4, '0')}
          </p>
        </div>
      </motion.div>

      {/* Main 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Decision card */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', border: `1px solid ${isApproved ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}` }}>
            {/* Background word */}
            <div style={{ position: 'absolute', top: 8, right: 16, fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 900, fontStyle: 'italic', color: isApproved ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)', pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>
              {isApproved ? 'PASS' : 'RISK'}
            </div>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: decisionColor, borderRadius: '50%', filter: 'blur(50px)', opacity: 0.06, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-faint)', marginBottom: 12 }}>
                AI Prediction
              </div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900, lineHeight: 1, color: decisionColor, marginBottom: 20 }}>
                {isApproved ? 'Favorable' : 'High Risk'}
              </motion.div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Confidence Score', value: `${(application.ml_confidence * 100).toFixed(1)}%` },
                  { label: 'Risk Category', value: (application.ml_risk_band || 'N/A').replace('_', ' ') },
                  { label: 'Loan Amount', value: `₹${application.loan_amount?.toLocaleString()}` },
                  { label: 'Purpose', value: application.purpose || 'Personal' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: label === 'Risk Category' || label === 'Confidence Score' ? decisionColor : 'var(--text)' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 300, color: 'var(--text-faint)', lineHeight: 1.65, fontStyle: 'italic' }}>
                  Our XGBoost classifier analyzed financial vectors. This prediction is awaiting final verification by an accredited officer.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SHAP chart card */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Activity size={14} style={{ color: 'var(--lime)' }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-faint)' }}>
                Feature Impact (SHAP)
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 300, color: 'var(--text-faint)', lineHeight: 1.65, marginBottom: 16, maxWidth: 340 }}>
              Each bar shows how much a data point pushed the AI toward
              <span style={{ color: 'var(--success)', fontWeight: 600, marginLeft: 4, marginRight: 4 }}>Approval</span>or
              <span style={{ color: 'var(--danger)', fontWeight: 600, marginLeft: 4 }}>Rejection</span>.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 12 }}>
              <ShapChart shapValues={parsedShap} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* What-If Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}>
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark)' }}>
              <Activity size={18} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
              What-If Simulator
            </h3>
          </div>
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'var(--lime)', borderRadius: '2px 0 0 2px' }} />
            <div style={{ paddingLeft: 16 }}>
              <WhatIfSimulator application={application} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
