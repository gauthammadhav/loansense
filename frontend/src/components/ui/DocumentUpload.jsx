/**
 * frontend/src/components/ui/DocumentUpload.jsx
 *
 * Self-contained document upload + verification component.
 * Used in Apply.jsx Step 6 (optional) and Result.jsx debug panel.
 */
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, CheckCircle2, AlertTriangle, X, Eye, Trash2,
  ShieldCheck, TrendingUp, FileText, Banknote, CreditCard, List
} from 'lucide-react';
import apiClient from '../../api/client';

// ── Config ────────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  {
    type: 'bank_statement',
    label: 'Bank Statement',
    emoji: '🏦',
    description: 'Last 3 months — verifies income & spending patterns',
    verifies: ['Monthly Income', 'Expenses', 'Financial Stability'],
    boost: '+12%',
    icon: Banknote,
  },
  {
    type: 'salary_slip',
    label: 'Salary Slip',
    emoji: '💼',
    description: 'Latest month — confirms employment income',
    verifies: ['Monthly Income', 'Employment Type'],
    boost: '+8%',
    icon: FileText,
  },
  {
    type: 'credit_report',
    label: 'CIBIL Report',
    emoji: '📊',
    description: 'Credit score + loan history verification',
    verifies: ['Credit Score', 'Loan History', 'EMI Load'],
    boost: '+10%',
    icon: CreditCard,
  },
  {
    type: 'loan_statement',
    label: 'Loan Statement',
    emoji: '📄',
    description: 'Active loan EMI and outstanding details',
    verifies: ['EMI Amount', 'Loan Count'],
    boost: '+5%',
    icon: List,
  },
];

const TRUST_COLOR = (score) => {
  if (score >= 80) return '#16a34a';
  if (score >= 55) return '#d97706';
  return '#dc2626';
};

const TRUST_BG = (score) => {
  if (score >= 80) return 'rgba(34,197,94,0.06)';
  if (score >= 55) return 'rgba(245,158,11,0.06)';
  return 'rgba(239,68,68,0.06)';
};

const TRUST_BORDER = (score) => {
  if (score >= 80) return 'rgba(34,197,94,0.3)';
  if (score >= 55) return 'rgba(245,158,11,0.3)';
  return 'rgba(239,68,68,0.3)';
};

const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

// ── Sub-components ────────────────────────────────────────────────────────────

function TrustBar({ score, style = {} }) {
  return (
    <div style={{ width: '100%', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Trust Score</span>
        <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'monospace', color: TRUST_COLOR(score) }}>{score.toFixed(0)}%</span>
      </div>
      <div style={{ height: 7, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', backgroundColor: TRUST_COLOR(score), borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function UploadedBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      backgroundColor: 'rgba(34,197,94,0.1)', color: '#15803d',
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    }}>
      <CheckCircle2 size={12} /> Uploaded
    </div>
  );
}

function DetailModal({ doc, onClose }) {
  const extracted = doc.extracted_data || {};
  const discrepancies = doc.discrepancies || [];
  const risk_flags = doc.risk_flags || [];
  const trust = doc.trust_score || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white', borderRadius: 24, padding: 32,
          maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
              Verification Details
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{doc.original_filename}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Trust score panel */}
        <div style={{
          padding: '20px 24px', borderRadius: 16, marginBottom: 24,
          backgroundColor: TRUST_BG(trust), border: `1.5px solid ${TRUST_BORDER(trust)}`,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <TrustBar score={trust} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Status: <strong style={{ color: TRUST_COLOR(trust) }}>{doc.verification_status?.toUpperCase()}</strong></span>
            <span>OCR confidence: {((doc.ocr_confidence || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Extracted Data */}
        {Object.keys(extracted).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Extracted Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(extracted).map(([key, val]) => (
                <div key={key} style={{ backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                    {typeof val === 'number' && val > 1000
                      ? formatINR(val)
                      : Array.isArray(val)
                        ? val.map(v => typeof v === 'number' && v > 1000 ? formatINR(v) : v).join(', ')
                        : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discrepancies */}
        {discrepancies.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> {discrepancies.length} Discrepanc{discrepancies.length > 1 ? 'ies' : 'y'} Found
            </h4>
            {discrepancies.map((d, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: 12, marginBottom: 8,
                backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 6, textTransform: 'capitalize' }}>
                  {d.field?.replace(/_/g, ' ')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    You entered: <strong style={{ color: 'var(--text)' }}>{typeof d.user_entered === 'number' && d.user_entered > 1000 ? formatINR(d.user_entered) : d.user_entered}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Doc shows: <strong style={{ color: '#d97706' }}>{typeof d.document_shows === 'number' && d.document_shows > 1000 ? formatINR(d.document_shows) : d.document_shows}</strong>
                  </div>
                </div>
                {d.variance !== undefined && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Variance: {d.variance}{d.variance_type === 'percent' ? '%' : ' pts'} · Severity: <strong>{d.severity}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Risk Flags */}
        {risk_flags.length > 0 && (
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Risk Indicators
            </h4>
            {risk_flags.map((flag, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 6, fontSize: 13,
                backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626',
              }}>
                {flag}
              </div>
            ))}
          </div>
        )}

        {discrepancies.length === 0 && risk_flags.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
            <CheckCircle2 size={20} style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
            Everything checks out — no issues detected.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DocumentUpload({
  applicationId,
  onUploadComplete,
}) {
  const [uploadedDocs, setUploadedDocs] = useState([]); // [{...result, document_type}]
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileRefs = useRef({});

  const uploadedTypes = new Set(uploadedDocs.map(d => d.document_type));

  const triggerPicker = (docType) => {
    fileRefs.current[docType]?.click();
  };

  const handleFile = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';   // reset so same file can be re-selected

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setUploadError('Only PDF and image files (.pdf, .jpg, .jpeg, .png) are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File must be under 10 MB.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType);

      const res = await apiClient.post(
        `/documents/upload/${applicationId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const result = { ...res.data, document_type: docType, original_filename: file.name };
      setUploadedDocs(prev => {
        // Replace if same type was re-uploaded
        const filtered = prev.filter(d => d.document_type !== docType);
        return [...filtered, result];
      });
      onUploadComplete?.(result);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setUploadError(typeof detail === 'string' ? detail : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (docType) => {
    setUploadedDocs(prev => prev.filter(d => d.document_type !== docType));
  };

  // ── Overall stats (derived from last upload result) ─────────────────────
  const lastResult = uploadedDocs[uploadedDocs.length - 1];
  const overallTrust = lastResult?.overall_trust_score ?? 0;
  const verificationBoost = lastResult?.verification_boost ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Intro banner */}
      <div style={{
        padding: '20px 24px', borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(200,241,53,0.07) 0%, rgba(34,197,94,0.06) 100%)',
        border: '1.5px solid rgba(200,241,53,0.35)',
        display: 'flex', alignItems: 'flex-start', gap: 18,
      }}>
        <ShieldCheck size={28} style={{ color: 'var(--lime-dark)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text)', margin: '0 0 6px 0' }}>
            Optional Document Verification
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Upload financial documents to verify the information you entered. Verified data boosts our model's confidence.{' '}
            <strong style={{ color: 'var(--lime-dark)' }}>100% optional</strong> — skip if preferred.
          </p>
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', borderRadius: 12 }}
          >
            <div style={{ padding: '12px 14px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626', fontSize: 13, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={15} /> {uploadError}
              <button onClick={() => setUploadError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}><X size={15} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document type cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {DOCUMENT_TYPES.map((dt) => {
          const isUploaded = uploadedTypes.has(dt.type);
          const uploadedDoc = uploadedDocs.find(d => d.document_type === dt.type);
          const trust = uploadedDoc?.trust_score ?? 0;

          return (
            <motion.div
              key={dt.type}
              whileHover={!isUploaded ? { y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.1)' } : {}}
              style={{
                backgroundColor: 'white',
                border: isUploaded ? `2px solid ${TRUST_BORDER(trust)}` : '1.5px solid var(--glass-border)',
                borderRadius: 20, padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Top accent bar when uploaded */}
              {isUploaded && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: TRUST_COLOR(trust) }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{dt.emoji}</span>
                {isUploaded ? (
                  <UploadedBadge />
                ) : (
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--lime-dark)',
                    backgroundColor: 'rgba(200,241,53,0.15)', padding: '3px 10px', borderRadius: 20,
                  }}>
                    {dt.boost} confidence
                  </div>
                )}
              </div>

              <h4 style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', margin: '0 0 6px 0' }}>{dt.label}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>{dt.description}</p>

              {/* Verifies tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {dt.verifies.map(v => (
                  <span key={v} style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    backgroundColor: '#f1f5f9', color: 'var(--text-muted)', border: '1px solid var(--glass-border)',
                  }}>✓ {v}</span>
                ))}
              </div>

              {/* Trust bar if uploaded */}
              {isUploaded && <TrustBar score={trust} style={{ marginBottom: 14 }} />}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {isUploaded ? (
                  <>
                    <button
                      onClick={() => setPreviewDoc(uploadedDoc)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <Eye size={14} /> Details
                    </button>
                    <button
                      onClick={() => triggerPicker(dt.type)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, backgroundColor: 'rgba(200,241,53,0.12)', border: '1.5px solid var(--lime)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--lime-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <Upload size={14} /> Replace
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => triggerPicker(dt.type)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                      backgroundColor: 'var(--lime)', border: 'none',
                      fontSize: 13, fontWeight: 700, color: 'var(--text)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    <Upload size={15} /> Upload
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                ref={el => fileRefs.current[dt.type] = el}
                onChange={e => handleFile(e, dt.type)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Uploading overlay */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
              zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              style={{
                backgroundColor: 'white', borderRadius: 24, padding: '40px 48px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
                boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
                style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid var(--lime)', borderTopColor: 'transparent' }}
              />
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>Processing document…</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 240 }}>
                Extracting data and running verification checks
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary strip (if any uploaded) */}
      <AnimatePresence>
        {uploadedDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '18px 22px', borderRadius: 18,
              backgroundColor: TRUST_BG(overallTrust),
              border: `1.5px solid ${TRUST_BORDER(overallTrust)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldCheck size={22} style={{ color: TRUST_COLOR(overallTrust), flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>
                  {uploadedDocs.length} document{uploadedDocs.length > 1 ? 's' : ''} verified
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Overall trust: <strong style={{ color: TRUST_COLOR(overallTrust) }}>{overallTrust.toFixed(0)}%</strong>
                  {verificationBoost > 0 && (
                    <span style={{ marginLeft: 8 }}>· Confidence boost: <strong style={{ color: '#16a34a' }}>+{(verificationBoost * 100).toFixed(0)}%</strong></span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {uploadedDocs.map(d => {
                const meta = DOCUMENT_TYPES.find(dt => dt.type === d.document_type);
                return (
                  <div key={d.document_type} style={{
                    fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                    backgroundColor: 'white', border: `1px solid ${TRUST_BORDER(d.trust_score || 0)}`,
                    color: TRUST_COLOR(d.trust_score || 0), display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <TrendingUp size={10} /> {meta?.label}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {previewDoc && (
          <DetailModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
