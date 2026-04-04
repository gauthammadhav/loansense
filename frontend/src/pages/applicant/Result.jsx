import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, CheckCircle2, XCircle, Activity, Cpu, Percent, Wallet, FileText, Banknote, ShieldCheck } from 'lucide-react';

import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { ShapChart } from '../../components/ui/ShapChart';
import WhatIfSimulator from '../../components/ui/WhatIfSimulator';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function ApplicantResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const navApp = location.state?.application;

  const [application, setApplication] = useState(navApp);
  const [loading, setLoading] = useState(!navApp || !navApp.shap_values);

  useEffect(() => {
    const fetchFullApp = async () => {
      try {
        const res = await apiClient.get(`/applications/${id || navApp?.id}`);
        setApplication(res.data);
      } catch (e) {
        console.error('Failed to recover full application details:', e);
      } finally {
        setLoading(false);
      }
    };
    if (!navApp || !navApp.shap_values) {
      if (id || navApp?.id) fetchFullApp();
    }
  }, [navApp, id]);

  useEffect(() => {
    if (application?.ml_prediction === 'Y') triggerConfetti();
  }, [application]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    const rand = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const count = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount: count, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount: count, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 20 }}>
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            style={{ width: 72, height: 72, borderRadius: '50%', border: '2.5px solid var(--lime)', borderTopColor: 'transparent' }}
          />
          <Cpu size={22} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--lime-dark)', opacity: 0.6 }} />
        </div>
        <div style={{ color: 'var(--lime-dark)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Reconstructing ML Nodes…
        </div>
      </div>
    );
  }

  // Not found state
  if (!application) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No application data found.</p>
        <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
      </div>
    );
  }

  const isApproved = application.ml_prediction === 'Y';

  let parsedShap = {};
  let parsedForm = {};
  try {
    const rawShap = typeof application.shap_values === 'string' ? JSON.parse(application.shap_values) : application.shap_values;
    parsedShap = rawShap?.shap || {};
    parsedForm = rawShap?.form_data || {};
  } catch (e) {}

  const featureLabel = (key) => ({
    monthly_income: 'Income Amount', monthly_expenses: 'Living Expenses',
    loan_amount: 'Loan Size', loan_tenure_months: 'Repayment Tenure',
    credit_score: 'Credit Score', existing_loans_count: 'Num of Loans',
    total_existing_emi: 'Active EMI Load', employment_type: 'Work Profile',
    employment_years: 'Job Stability', late_payment_history: 'Missed Payments',
    new_emi: 'New Requested EMI', debt_to_income: 'DTI Ratio',
    disposable_income: 'Free Cash Flow',
  }[key] || key.replace(/_/g, ' '));

  const shapArray = Object.entries(parsedShap)
    .map(([k, v]) => ({ feature: featureLabel(k), value: Number(v), abs: Math.abs(Number(v)), feature_value: parsedForm[k] ?? 'N/A' }))
    .sort((a, b) => b.abs - a.abs)
    .slice(0, 10);

  let derived = application.derived_features || {};
  if (!derived.new_emi && (parsedForm.loan_amount || application.loan_amount)) {
    const loan_amount = parseFloat(parsedForm.loan_amount || application.loan_amount) || 0;
    const loan_tenure_months = Math.max(parseFloat(parsedForm.loan_tenure_months || application.loan_amount_term) || 1, 1);
    const monthly_income = Math.max(parseFloat(parsedForm.monthly_income || application.applicant_income) || 1, 1);
    const monthly_expenses = parseFloat(parsedForm.monthly_expenses) || 0;
    const total_existing_emi = parseFloat(parsedForm.total_existing_emi) || 0;
    const new_emi = loan_amount / loan_tenure_months;
    derived = {
      new_emi,
      debt_to_income: (total_existing_emi + new_emi) / monthly_income,
      disposable_income: monthly_income - monthly_expenses - total_existing_emi - new_emi,
    };
  }

  // ── Shared metric row style ──
  const metricRow = {
    backgroundColor: '#f8fafc',
    border: '1px solid var(--glass-border)',
    borderRadius: 16,
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const iconBox = (bg, color) => ({
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: bg, color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--glass-border)', paddingBottom: 24 }}
      >
        <button
          onClick={() => navigate('/applicant/dashboard')}
          style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            backgroundColor: '#f1f5f9', border: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text)', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(200,241,53,0.12)'; e.currentTarget.style.color = 'var(--lime-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = 'var(--text)'; }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Evaluation Report
          </h1>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime-dark)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Application #{application.id}
          </p>
        </div>
      </motion.div>

      {/* ── Document Verification Banner ── */}
      <AnimatePresence>
        {application.documents_uploaded && application.document_verification_status !== 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px 20px', borderRadius: 16,
              backgroundColor: application.document_verification_status === 'complete' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
              border: `1px solid ${application.document_verification_status === 'complete' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <ShieldCheck size={32} style={{ color: application.document_verification_status === 'complete' ? 'var(--success-dark)' : '#d97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>
                {application.document_verification_status === 'complete' ? 'Documents Verified' : 'Partially Verified'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Trust Score: <strong style={{ color: application.document_verification_status === 'complete' ? 'var(--success-dark)' : '#d97706' }}>{(application.overall_trust_score || 0).toFixed(1)}%</strong>
                {application.verification_boost > 0 && (
                  <span style={{ marginLeft: 8 }}>· ML Confidence Boost: <strong style={{ color: 'var(--success-dark)' }}>+{(application.verification_boost * 100).toFixed(1)}%</strong></span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ML Decision + Financial Capacity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ML Decision */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            backgroundColor: isApproved ? 'rgba(34,197,94,0.04)' : 'rgba(248,113,113,0.04)',
            border: `2px solid ${isApproved ? 'var(--success)' : 'var(--danger)'}`,
            borderRadius: 28, padding: '36px 28px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            gap: 16,
          }}
        >
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: isApproved ? 'var(--success)' : 'var(--danger)' }} />

          <Badge variant="outline" icon={<Cpu size={12} />}>Automated ML Engine</Badge>

          <motion.div
            initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          >
            {isApproved
              ? <CheckCircle2 size={68} style={{ color: 'var(--success)', filter: 'drop-shadow(0 0 16px rgba(34,197,94,0.45))' }} />
              : <XCircle size={68} style={{ color: 'var(--danger)', filter: 'drop-shadow(0 0 16px rgba(248,113,113,0.45))' }} />
            }
          </motion.div>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 900,
            color: isApproved ? 'var(--success)' : 'var(--danger)',
            margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {isApproved ? 'Favorable' : 'High Risk'}
          </h2>

          <p style={{ fontSize: 15, color: 'var(--text)', margin: 0 }}>
            Confidence Score:{' '}
            <span style={{
              fontFamily: 'monospace', fontWeight: 700,
              padding: '2px 10px', borderRadius: 8,
              backgroundColor: application.ml_confidence > 0.8 ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
              color: application.ml_confidence > 0.8 ? 'var(--success-dark)' : '#92400e',
            }}>
              {(application.ml_confidence * 100).toFixed(1)}%
            </span>
          </p>

          <div style={{
            width: '100%', backgroundColor: 'white', border: '1px solid var(--glass-border)',
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4 }}>
                Assessed Risk Band
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {application.ml_risk_band?.replace('_', ' ').toUpperCase() || '—'}
              </div>
            </div>
            <Activity size={26} style={{ color: isApproved ? 'var(--success)' : 'var(--danger)' }} />
          </div>
        </motion.div>

        {/* Financial Capacity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
        >
          <Card title="Financial Capacity" icon={<Wallet size={18} />} style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
              {/* Proposed EMI */}
              <motion.div whileHover={{ scale: 1.02 }} style={metricRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={iconBox('rgba(200,241,53,0.12)', 'var(--lime-dark)')}><Banknote size={20} /></div>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Proposed EMI</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: 'var(--lime-dark)' }}>
                  {formatCurrency(derived?.new_emi)}
                </span>
              </motion.div>

              {/* DTI Ratio */}
              <motion.div whileHover={{ scale: 1.02 }} style={metricRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={iconBox('rgba(59,130,246,0.08)', '#2563eb')}><Percent size={20} /></div>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>DTI Ratio</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: (derived?.debt_to_income || 0) > 0.6 ? 'var(--danger)' : 'var(--text)' }}>
                  {((derived?.debt_to_income || 0) * 100).toFixed(1)}%
                </span>
              </motion.div>

              {/* Free Cash Flow */}
              <motion.div whileHover={{ scale: 1.02 }} style={metricRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={iconBox(derived?.disposable_income < 0 ? 'rgba(248,113,113,0.1)' : 'rgba(34,197,94,0.1)', derived?.disposable_income < 0 ? 'var(--danger)' : 'var(--success)')}>
                    <Activity size={20} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Free Cash Flow</span>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 20, color: derived?.disposable_income < 0 ? 'var(--danger)' : 'var(--text)' }}>
                  {formatCurrency(derived?.disposable_income)}
                </span>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── SHAP Explainability ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card title="Model Explainability Context" icon={<FileText size={18} />}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 680, margin: '0 0 16px 0' }}>
            The Waterfall chart illustrates the exact mathematical weights assigned to your individual features by the Random Forest model. Features pushing right (green) favor approval, while features pushing left (yellow) increase risk.
          </p>
          <ShapChart data={shapArray} />
        </Card>
      </motion.div>

      {/* ── What-If Simulator ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card title="Interactive Model Engine" icon={<Cpu size={18} />}>
          <WhatIfSimulator application={application} />
        </Card>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ textAlign: 'center', paddingBottom: 16 }}
      >
        <Button onClick={() => navigate('/applicant/dashboard')} variant="ghost">
          Return to Dashboard
        </Button>
      </motion.div>

    </div>
  );
}
