import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Plus, ArrowRight } from 'lucide-react';

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get('/applications/');
        setApplications(res.data);
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <Badge variant="approved">APPROVED</Badge>;
      case 'rejected': return <Badge variant="rejected">REJECTED</Badge>;
      case 'under_review':
      case 'escalated':
      case 'submitted':
        return <Badge variant="review">IN REVIEW</Badge>;
      default: return <Badge>{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-dark">My Applications</h2>
          <p className="text-sm font-body text-muted mt-1">Track the status of your loan requests.</p>
        </div>
        <Button onClick={() => navigate('/applicant/apply')} className="gap-2">
          <Plus size={16} /> New Application
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted font-body text-sm">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-page flex items-center justify-center mb-4 text-faint border border-border">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-bold font-heading text-dark">No applications yet</h3>
            <p className="text-sm font-body text-muted mt-2 max-w-sm mb-6">
              You haven't submitted any loan requests. Apply now to get an instant ML-powered decision.
            </p>
            <Button onClick={() => navigate('/applicant/apply')}>Start Application</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium text-dark">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${app.loan_amount?.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{app.purpose || 'Personal'}</TableCell>
                  <TableCell>
                    {app.ml_prediction === 'Y' ? (
                      <span className="text-success font-bold font-body text-sm">Favorable</span>
                    ) : app.ml_prediction === 'N' ? (
                      <span className="text-danger font-bold font-body text-sm">High Risk</span>
                    ) : (
                      <span className="text-muted font-body text-sm">Pending</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      className="h-8 px-3 text-xs gap-1"
                      onClick={() => navigate('/applicant/result', { state: { application: app } })}
                    >
                      View ML <ArrowRight size={14} />
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
