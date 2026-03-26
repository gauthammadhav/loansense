import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import apiClient from '../api/client';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', { 
        full_name: fullName,
        email, 
        password 
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 w-full">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-dark">LoanSense<span className="text-lime">.</span></h1>
          <p className="text-muted mt-2 text-sm font-body">Create your applicant account</p>
        </div>
        
        <Card>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-danger-bg text-danger text-sm rounded-[10px] border border-danger/20 font-body">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-success-bg text-success text-sm rounded-[10px] border border-success/20 font-body">
                {success}
              </div>
            )}
            
            <div>
              <Label htmlFor="fullname">FULL NAME</Label>
              <Input 
                id="fullname" 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">EMAIL ADDRESS</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">PASSWORD</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-[13px] font-body text-muted">
            Already have an account? <Link to="/login" className="text-dark font-bold hover:underline">Sign in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
