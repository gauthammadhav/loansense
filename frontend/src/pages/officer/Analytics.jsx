import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Database, Server, Settings } from 'lucide-react';

export default function OfficerAnalytics() {
  const [modelCurrent, setModelCurrent] = useState(null);
  const [modelQueue, setModelQueue] = useState(null);
  const [modelHistory, setModelHistory] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [currRes, queueRes, histRes, appRes] = await Promise.all([
        apiClient.get('/model/current').catch(() => ({ data: {} })),
        apiClient.get('/model/queue-status').catch(() => ({ data: {} })),
        apiClient.get('/model/comparison').catch(() => ({ data: [] })),
        apiClient.get('/officer/applications').catch(() => ({ data: [] }))
      ]);

      setModelCurrent(currRes.data);
      setModelQueue(queueRes.data);
      setModelHistory(histRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const forceRetrain = async () => {
    try {
      await apiClient.post('/model/retrain');
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Compute Bias Audit (Approval Rate by Gender)
  const biasData = React.useMemo(() => {
    const stats = { Male: { total: 0, approved: 0 }, Female: { total: 0, approved: 0 }, Other: { total: 0, approved: 0 } };
    applications.forEach(app => {
      const g = app.gender || 'Other';
      if (!stats[g]) stats[g] = { total: 0, approved: 0 };
      stats[g].total += 1;
      if (app.ml_prediction === 'Y') stats[g].approved += 1;
    });

    return Object.keys(stats).map(gender => ({
      name: gender,
      ApprovalRate: stats[gender].total > 0 ? (stats[gender].approved / stats[gender].total) * 100 : 0,
      Total: stats[gender].total
    })).filter(d => d.Total > 0);
  }, [applications]);

  if (loading) return <div className="p-8 text-center text-muted font-body">Loading Analytics...</div>;

  const queuePct = modelQueue?.threshold ? Math.min(100, (modelQueue.queued / modelQueue.threshold) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-dark">System Analytics & MLOps</h2>
          <p className="text-sm font-body text-muted mt-1">
            Monitor model drift, queue thresholds, and historical bias audits.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-lime/20 rounded-full text-lime-dark"><Server size={20} /></div>
          <div>
            <p className="text-xs font-bold text-faint uppercase">Active Model</p>
            <p className="font-heading font-bold text-lg">{modelCurrent?.version || 'v1.0'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-success-bg rounded-full text-success"><Activity size={20} /></div>
          <div>
            <p className="text-xs font-bold text-faint uppercase">Uptime Status</p>
            <p className="font-heading font-bold text-lg text-success">{modelCurrent?.status || 'Online'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 md:col-span-2">
          <div className="p-3 bg-page rounded-full text-dark"><Database size={20} /></div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold text-faint uppercase">Retraining Queue</p>
              <p className="text-xs font-bold">{modelQueue?.queued || 0} / {modelQueue?.threshold || 50} Records</p>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-dark h-2 rounded-full transition-all" style={{ width: `${queuePct}%` }}></div>
            </div>
            {queuePct >= 100 && <p className="text-[10px] text-lime-dark font-bold mt-1">Threshold reached. Retraining imminent.</p>}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bias Audit Chart */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase font-bold text-dark tracking-wider">Bias Audit: Approval Rate</h3>
            <Badge variant="default">GENDER</Badge>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biasData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip cursor={{ fill: 'var(--page)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }} />
                <Bar dataKey="ApprovalRate" fill="var(--chart-approve)" maxBarSize={60} radius={[4, 4, 0, 0]} name="Approval Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Model Execution / Ops Controls */}
        <Card className="bg-page/40">
          <h3 className="text-sm uppercase font-bold text-dark tracking-wider mb-2">Automated MLOps Pipeline</h3>
          <p className="text-sm text-muted font-body mb-6">
             The prediction engine actively monitors verified application outcomes. Once the buffer hits 
             the threshold ({modelQueue?.threshold || 50}), it automatically fits a new XGBoost model, checks its F1 score against the current baseline, and hot-swaps it into production if superior.
          </p>

          <div className="border border-border bg-white rounded-[var(--radius-input)] p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-dark">Force Manual Retrain</p>
                <p className="text-xs text-muted">Bypass the queue threshold ({modelQueue?.next_retrain_in} remaining)</p>
              </div>
              <Button onClick={forceRetrain} variant="outline" className="text-xs gap-2"><Settings size={14} /> Trigger Fit</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Model History Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm uppercase font-bold text-dark tracking-wider">Model Version History</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelHistory.length > 0 ? modelHistory.map((model) => (
              <TableRow key={model.name}>
                <TableCell className="font-bold font-mono text-xs">{model.name}</TableCell>
                <TableCell>{model.file || 'N/A'}</TableCell>
                <TableCell>{model.accuracy ? (model.accuracy * 100).toFixed(2) + '%' : '-'}</TableCell>
                <TableCell>
                  {model.status === 'not_trained' ? (
                    <span className="text-danger font-bold text-xs">Uninitialized</span>
                  ) : (
                    <span className="text-success font-bold text-xs">Ready</span>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted">No historical models found in registry.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
