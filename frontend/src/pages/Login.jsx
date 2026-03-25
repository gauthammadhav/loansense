import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      const meResponse = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      const user = meResponse.data;
      setAuth(user, access_token, user.role);
      
      // Strict role-based routing
      if (user.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/applicant/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 w-full">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading font-bold text-dark">LoanSense<span className="text-lime">.</span></h1>
          <p className="text-muted mt-2 text-sm font-body">Sign in to your account</p>
        </div>
        
        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-danger-bg text-danger text-sm rounded-[10px] border border-danger/20 font-body">
                {error}
              </div>
            )}
            
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
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-[13px] font-body text-muted">
            Don't have an account? <Link to="/register" className="text-dark font-bold hover:underline">Apply here</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
