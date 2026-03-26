import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { ArrowRight, Clock } from 'lucide-react';

export default function OfficerDashboard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await apiClient.get('/officer/queue');
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (appId) => {
    try {
      const res = await apiClient.post(`/officer/assign/${appId}`);
      navigate(`/officer/review`, { state: { application: res.data } });
    } catch (err) {
      console.error("Assignment failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-dark">Officer Decision Queue</h2>
          <p className="text-sm font-body text-muted mt-1">
            Applications awaiting manual review and final decision. (FIFO)
          </p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border">
        {loading ? (
          <div className="p-8 text-center text-muted font-body text-sm">Loading queue...</div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center mb-4 text-success border border-success/20">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold font-heading text-dark">The queue is empty</h3>
            <p className="text-sm font-body text-muted mt-2 max-w-sm">
              All applications have been processed. You're all caught up!
            </p>
            <Button className="mt-6" variant="outline" onClick={fetchQueue}>Refresh Queue</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SLA</TableHead>
                <TableHead>Applicant ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>ML Prediction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    {app.days_pending > 0 ? (
                      <span className="text-danger font-bold font-body text-xs flex items-center gap-1"><Clock size={12}/>{app.days_pending} Days Old</span>
                    ) : (
                      <span className="text-muted font-bold font-body text-xs flex items-center gap-1"><Clock size={12}/>New</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-dark font-mono text-xs">APP-{app.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>${app.loan_amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {app.ml_prediction === 'Y' ? (
                      <Badge variant="approved">FAVORABLE</Badge>
                    ) : (
                      <Badge variant="rejected">HIGH RISK</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {app.status === 'under_review' ? (
                      <Badge variant="review">IN REVIEW</Badge>
                    ) : (
                      <Badge>PENDING</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="primary" 
                      className="h-8 px-4 text-xs gap-1"
                      onClick={() => handleAssign(app.id)}
                    >
                      Review <ArrowRight size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
