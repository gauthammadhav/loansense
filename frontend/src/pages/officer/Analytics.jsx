import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';


export default function OfficerAnalytics() {
  const [modelHistory, setModelHistory] = useState([]);
  const [datasetStats, setDatasetStats] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [histRes, statsRes, featRes] = await Promise.all([
        apiClient.get('/model/comparison').catch(() => ({ data: [] })),
        apiClient.get('/model/dataset-stats').catch(() => ({ data: null })),
        apiClient.get('/model/feature-importance').catch(() => ({ data: null }))
      ]);

      setModelHistory(histRes.data || []);
      setDatasetStats(statsRes.data);
      setFeatureImportance(featRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val) => new Intl.NumberFormat('en-IN').format(val || 0);

  if (loading) {
    return (
      <>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--muted)' }}>
          Loading AI Analytics...
        </div>
      </>
    );
  }

  const featArray = featureImportance 
    ? Object.entries(featureImportance).sort((a,b) => b[1] - a[1]).slice(0, 10)
    : [];

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark)' }}>
            System Analytics & Data Drift
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Monitor global model performance, new dataset characteristics, and macro feature impacts.
          </p>
        </div>

        {/* Dataset Stats Overview */}
        {datasetStats && (
          <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--dark)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Training Data Overview (New Dataset)
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ background: 'var(--page)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Records</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>{datasetStats.total_rows?.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--page)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '8px' }}>Base Approval Rate</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>{datasetStats.approval_rate}%</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{datasetStats.approved_count} approvals</div>
              </div>
              <div style={{ background: 'var(--page)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Monthly Income</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>₹{formatINR(datasetStats.avg_monthly_income)}</div>
              </div>
              <div style={{ background: 'var(--page)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Credit Score</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>{datasetStats.avg_credit_score?.toFixed(0)}</div>
              </div>
            </div>

            {datasetStats.employment_distribution && Object.keys(datasetStats.employment_distribution).length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', marginBottom: '12px' }}>Applicant Employment Profile</div>
                <div style={{ display: 'flex', gap: '8px', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                  {Object.entries(datasetStats.employment_distribution).map(([type, count]) => {
                    const pct = (count / datasetStats.total_rows) * 100;
                    if (pct === 0) return null;
                    return (
                      <div key={type} title={`${type}: ${count}`} style={{ width: `${pct}%`, background: type === 'salaried' ? 'var(--lime-dark)' : type === 'self-employed' ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {pct > 15 ? `${type} (${pct.toFixed(1)}%)` : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
          
          {/* Model Performance */}
          <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--dark)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Model Performance Benchmark
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Model Pipeline</th>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Accuracy</th>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>F1 Score</th>
                    <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modelHistory.length > 0 ? modelHistory.map((model, i) => {
                    const isNew = model.name.includes('(New)');
                    const accValue = model.accuracy ? (model.accuracy * 100).toFixed(1) + '%' : '-';
                    const f1Value = model.f1 ? (model.f1 * 100).toFixed(1) + '%' : '-';
                    
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {model.best && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />}
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dark)' }}>{model.name}</span>
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '13px', fontFamily: 'monospace' }}>{accValue}</td>
                        <td style={{ padding: '16px 8px', fontSize: '13px', fontFamily: 'monospace' }}>{f1Value}</td>
                        <td style={{ padding: '16px 8px' }}>
                          {model.best ? (
                            <span style={{ padding: '4px 8px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ACTIVE</span>
                          ) : model.status === 'not_trained' ? (
                            <span style={{ padding: '4px 8px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>UNAVAILABLE</span>
                          ) : (
                            <span style={{ padding: '4px 8px', background: 'var(--page)', color: 'var(--muted)', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>STANDBY</span>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={4} style={{ padding: '24px 8px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>No model evaluations found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Global Feature Importance */}
          <div style={{ background: 'var(--white)', padding: '32px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--dark)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              Global Feature Importance
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.4 }}>
              Relative weight of input features parsed from the active Random Forest classifier.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {featArray.length > 0 ? featArray.map(([feat, imp], i) => {
                const max = featArray[0][1];
                const pct = (imp / max) * 100;
                return (
                  <div key={feat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--dark)' }}>{feat.replace(/_/g, ' ')}</span>
                      <span style={{ color: 'var(--muted)' }}>{imp.toFixed(3)}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--page)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: i < 3 ? 'var(--lime-dark)' : 'var(--muted)' }} />
                    </div>
                  </div>
                )
              }) : (
                <div style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                  Feature importance data unavailable.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
