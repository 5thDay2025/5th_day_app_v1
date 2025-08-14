import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './ResetPassword.css';

export const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const setupSession = async () => {
      try {
        // Get token from URL query parameters
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'recovery') {
          return; // Not a recovery page, no need to show error
        }

        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });

        if (error) {
          throw error;
        }

      } catch (error) {
        setError('Unable to verify reset link. Please try again.');
      }
    };

    setupSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);

      // After 3 seconds, redirect to login
      setTimeout(() => {
        const baseUrl = import.meta.env.BASE_URL;
        window.location.href = baseUrl;
      }, 3000);
    } catch (error) {
      setError('Unable to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="reset-container text-center">
        <h2>Password successfully updated</h2>
        <p>Redirecting to your student page</p>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <h1 className="reset-title">Reset Your Password</h1>
      
      <form onSubmit={handleReset} className="reset-form">
        <div className="form-group">
          <label htmlFor="password" className="form-label">New Password</label>
          <div className="form-group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="form-input with-button"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? '⊖' : '⊕'}
            </button>
          </div>
          <div className="password-hint">
            Password must be at least 6 characters long
          </div>
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="reset-button"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}; 
