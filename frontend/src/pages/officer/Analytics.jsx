import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, TrendingUp, BarChart2, Activity, Users, FileBarChart, CheckCircle2, ShieldAlert } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AnimatedTable } from '../../components/ui/Table';

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

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <Activity className="text-lime-dark animate-spin opacity-50" size={48} />
        <div className="text-lime-dark font-bold uppercase tracking-widest text-sm animate-pulse">
          Aggregating Telemetry...
        </div>
      </div>
    );
  }

  const featArray = featureImportance 
    ? Object.entries(featureImportance).sort((a,b) => b[1] - a[1]).slice(0, 10)
    : [];

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-info animate-pulse" />
            <span className="text-info font-bold text-xs tracking-widest uppercase">System Telemetry</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-[var(--text)]">Analytics Hub</h1>
          <p className="text-[var(--text-muted)] mt-2">Macro-level observation of active AI endpoints and underlying dataset drift.</p>
        </motion.div>
      </div>

      {/* Primary KPI Grid */}
      {datasetStats && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--light3)] rounded-3xl p-6 border border-[var(--glass-border)] shadow-sm flex flex-col justify-between hover:bg-[var(--light4)] transition-colors group">
             <div className="flex justify-between items-start mb-6">
                <Database className="text-[var(--text-muted)] group-hover:text-[var(--lime-dark)] transition-colors" size={24} />
                <Badge variant="outline">DATASET</Badge>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Global Records</div>
                <div className="text-3xl font-mono font-bold text-[var(--text)] tracking-tight">{datasetStats.total_rows?.toLocaleString()}</div>
             </div>
          </div>
          
          <div className="bg-[var(--light3)] rounded-3xl p-6 border border-[var(--glass-border)] shadow-sm flex flex-col justify-between hover:bg-[var(--light4)] transition-colors group relative overflow-hidden">
             <div className="absolute right-0 bottom-0 w-32 h-32 bg-[var(--success-subtle)] blur-3xl rounded-full" />
             <div className="flex justify-between items-start mb-6 relative z-10">
                <TrendingUp className="text-[var(--success-dark)] group-hover:scale-110 transition-transform" size={24} />
                <Badge variant="success">INFERRED</Badge>
             </div>
             <div className="relative z-10">
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Approval Baseline</div>
                <div className="text-3xl font-mono font-bold text-[var(--success-dark)] tracking-tight">{datasetStats.approval_rate}%</div>
             </div>
          </div>

          <div className="bg-[var(--light3)] rounded-3xl p-6 border border-[var(--glass-border)] shadow-sm flex flex-col justify-between hover:bg-[var(--light4)] transition-colors group">
             <div className="flex justify-between items-start mb-6">
                <BarChart2 className="text-[var(--text-muted)] group-hover:text-[var(--lime-dark)] transition-colors" size={24} />
                <Badge variant="outline">MEDIAN</Badge>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Applicant Income</div>
                <div className="text-3xl font-mono font-bold text-[var(--text)] tracking-tight">{formatCurrency(datasetStats.avg_monthly_income)}</div>
             </div>
          </div>

          <div className="bg-[var(--light3)] rounded-3xl p-6 border border-[var(--glass-border)] shadow-sm flex flex-col justify-between hover:bg-[var(--light4)] transition-colors group">
             <div className="flex justify-between items-start mb-6">
                <ShieldAlert className="text-[var(--text-muted)] group-hover:text-[var(--lime-dark)] transition-colors" size={24} />
                <Badge variant="outline">RISK</Badge>
             </div>
             <div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Global Credit Avg</div>
                <div className="text-3xl font-mono font-bold text-[var(--text)] tracking-tight">{datasetStats.avg_credit_score?.toFixed(0)}</div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Dataset Demographic Segments */}
      {datasetStats?.employment_distribution && Object.keys(datasetStats.employment_distribution).length > 0 && (
         <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card title="Employment Portfolio Distribution" icon={<Users size={20} />}>
               <div className="flex h-12 w-full rounded-xl overflow-hidden mt-2 relative border border-[var(--glass-border)] bg-[var(--light3)] shadow-inner">
                  {Object.entries(datasetStats.employment_distribution).map(([type, count]) => {
                     const pct = (count / datasetStats.total_rows) * 100;
                     if (pct === 0) return null;
                     const bgDict = {
                        'salaried': 'bg-[var(--lime-dark)]',
                        'self-employed': 'bg-info',
                        'business': 'bg-[var(--warning-dark)]'
                     };
                     const colorDict = {
                        'salaried': 'text-white',
                        'self-employed': 'text-white',
                        'business': 'text-white'
                     };
                     return (
                        <div key={type} className={`${bgDict[type] || 'bg-[var(--glass-border)]'} ${colorDict[type] || 'text-[var(--text)]'} flex items-center justify-center transition-all hover:brightness-110`} style={{ width: `${pct}%`}}>
                           <span className="text-xs font-bold uppercase tracking-wider shadow-sm">{pct > 10 ? `${type.replace('-', ' ')} (${pct.toFixed(0)}%)` : ''}</span>
                        </div>
                     )
                  })}
               </div>
               
               <div className="flex justify-center gap-6 mt-6">
                 {Object.entries(datasetStats.employment_distribution).map(([type, count]) => (
                   <div key={type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${type === 'salaried' ? 'bg-[var(--lime-dark)]' : type === 'self-employed' ? 'bg-info' : 'bg-[var(--warning-dark)]'}`} />
                      <span className="text-xs font-bold text-[var(--text)] capitalize">{type.replace('-', ' ')} <span className="text-[var(--text-muted)] font-normal ml-1">({count.toLocaleString()})</span></span>
                   </div>
                 ))}
               </div>
            </Card>
         </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="h-full flex flex-col">
            <Card title="Algorithm Registry" icon={<Activity size={20} />} className="flex-1">
               <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">Active deployment registry tracking endpoint accuracy and F1 metrics for ongoing Random Forest models.</p>
               
               <div className="space-y-4">
                  {modelHistory.length > 0 ? modelHistory.map((model, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between transition-colors hover:bg-[var(--light4)] ${model.best ? 'bg-success/5 border-[var(--success-subtle)]' : 'bg-[var(--light3)] border-[var(--glass-border)]'}`}>
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${model.best ? 'bg-success/20 text-[var(--success-dark)]' : 'bg-[var(--light4)] border border-[var(--glass-border)] text-[var(--text-muted)]'}`}>
                             {model.best ? <CheckCircle2 size={20} /> : <Database size={20} />}
                          </div>
                          <div>
                             <h4 className="font-bold text-[var(--text)] tracking-wide">{model.name}</h4>
                             {model.best ? (
                               <Badge variant="success" className="mt-1 shadow-sm">ACTIVE PIPELINE</Badge>
                             ) : model.status === 'not_trained' ? (
                               <Badge variant="danger" className="mt-1 shadow-sm">UNTRAINED</Badge>
                             ) : (
                               <Badge variant="outline" className="mt-1">COLD STORAGE</Badge>
                             )}
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-8 text-right pr-4">
                          <div>
                             <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Accuracy</div>
                             <div className="font-mono font-bold text-[var(--text)]">{model.accuracy ? (model.accuracy * 100).toFixed(1) + '%' : '-'}</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">F1 Score</div>
                             <div className="font-mono font-bold text-[var(--text)]">{model.f1 ? (model.f1 * 100).toFixed(1) + '%' : '-'}</div>
                          </div>
                       </div>
                    </div>
                  )) : (
                     <div className="text-center py-8 text-[var(--text-muted)] text-sm font-medium border border-[var(--glass-border)] rounded-2xl border-dashed">No execution histories registered in vault.</div>
                  )}
               </div>
            </Card>
         </motion.div>

         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="h-full flex flex-col">
            <Card title="Global Feature Weights" icon={<FileBarChart size={20} />} className="flex-1">
               <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
                  Aggregated Gini impurity reduction logic. Represents the universal percentage of influence each variable asserts across the entire deployed model.
               </p>

               <div className="space-y-5">
                  {featArray.length > 0 ? featArray.map(([feat, imp], i) => {
                     const max = featArray[0][1];
                     const pct = (imp / max) * 100;
                     return (
                        <div key={feat} className="group relative">
                           <div className="flex justify-between items-end mb-2">
                              <span className="text-xs font-bold text-[var(--text)] capitalize tracking-wide group-hover:text-[var(--lime-dark)] transition-colors">{feat.replace(/_/g, ' ')}</span>
                              <span className="font-mono text-xs font-bold text-[var(--text-muted)]">{(imp * 100).toFixed(1)}%</span>
                           </div>
                           <div className="w-full h-2 bg-[var(--light3)] shadow-inner border border-[var(--glass-border)] rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                                 className={`h-full rounded-full relative ${i === 0 ? 'bg-[var(--lime-dark)]' : i === 1 ? 'bg-[var(--lime-light)]' : i === 2 ? 'bg-[var(--lime-subtle)]' : 'bg-[var(--glass-border)]'}`}
                              />
                           </div>
                        </div>
                     )
                  }) : (
                     <div className="text-center py-8 text-[var(--text-muted)] text-sm font-medium border border-[var(--glass-border)] rounded-2xl border-dashed">Feature weight mapping currently absent.</div>
                  )}
               </div>
            </Card>
         </motion.div>
      </div>
      
    </div>
  );
}
