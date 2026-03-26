import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Badge } from './Badge';

export default function WhatIfSimulator({ application }) {
  const [params, setParams] = useState({
    applicant_income:  application.applicant_income  || 0,
    loan_amount:       application.loan_amount        || 0,
    loan_amount_term:  application.loan_amount_term   || 360,
    credit_score:      application.credit_score       || 700,
  });

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const defaultParams = {
      applicant_income: application.applicant_income,
      loan_amount:      application.loan_amount,
      loan_amount_term: application.loan_amount_term,
      credit_score:     application.credit_score,
    };
    if (JSON.stringify(params) === JSON.stringify(defaultParams)) {
      setSimResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const payload = {
          gender:              application.gender         || 'Male',
          married:             application.married        || false,
          dependents:          application.dependents     || 0,
          education:           application.education      || 'Graduate',
          self_employed:       application.self_employed  || false,
          applicant_income:    params.applicant_income,
          coapplicant_income:  application.coapplicant_income || 0,
          loan_amount:         params.loan_amount,
          loan_amount_term:    params.loan_amount_term,
          credit_score:        params.credit_score,
          property_area:       application.property_area  || 'Urban',
          property_type:       application.property_type  || 'Urban',
        };
        const res = await apiClient.post('/predict/whatif', payload);
        setSimResult(res.data);
      } catch (err) {
        console.error('Simulation failed', err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [params, application]);

  const updateParam = (field, value) => setParams(prev => ({ ...prev, [field]: Number(value) }));

  const diffBadge = () => {
    if (!simResult) return null;
    const oldPred = application.ml_prediction;
    const newPred = simResult.prediction;
    if (oldPred === 'N' && newPred === 'Y') return <Badge status="approved">Flipped to Favorable</Badge>;
    if (oldPred === 'Y' && newPred === 'N') return <Badge status="rejected">Flipped to High Risk</Badge>;
    return <Badge status="submitted">Unchanged</Badge>;
  };

  const sliders = [
    { label: 'Applicant Income', field: 'applicant_income', min: 0, max: 250000, step: 1000, fmt: v => `₹${Number(v).toLocaleString()}` },
    { label: 'Loan Amount',      field: 'loan_amount',      min: 1000, max: 500000, step: 1000, fmt: v => `₹${Number(v).toLocaleString()}` },
    { label: 'Credit Score',     field: 'credit_score',     min: 300, max: 850, step: 1, fmt: v => v },
  ];

  return (
    <>
      <style>{`
        .whatif-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: var(--glass-border);
          outline: none;
          cursor: pointer;
        }
        .whatif-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--lime);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(200,241,53,0.15);
          transition: box-shadow 0.2s;
        }
        .whatif-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(200,241,53,0.2);
        }
        .whatif-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--lime);
          cursor: pointer;
          border: none;
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sliders.map(({ label, field, min, max, step, fmt }) => (
            <div key={field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--lime-dark)' }}>{fmt(params[field])}</span>
              </div>
              <input
                type="range"
                className="whatif-slider"
                min={min} max={max} step={step}
                value={params[field]}
                onChange={e => updateParam(field, e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-faint)' }}>{fmt(min)}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-faint)' }}>{fmt(max)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live outcome panel */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 180,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, zIndex: 10 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lime)' }}>Simulating...</span>
            </div>
          )}

          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 12 }}>
            Simulated Outcome
          </div>

          {simResult ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, lineHeight: 1,
                color: simResult.prediction === 'Y' ? 'var(--success)' : 'var(--danger)',
                marginBottom: 8,
              }}>
                {simResult.prediction === 'Y' ? 'Favorable' : 'High Risk'}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Confidence: <strong style={{ color: 'var(--text)' }}>{(simResult.confidence * 100).toFixed(1)}%</strong>
              </div>
              {diffBadge()}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6, marginBottom: 12 }}>
                Move the sliders to see how live variations affect the model decision.
              </p>
              <Badge status="submitted">Baseline Mode</Badge>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
