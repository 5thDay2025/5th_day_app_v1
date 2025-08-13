import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const setupSession = async () => {
      try {
        const hashString = window.location.hash.substring(1);
        const params = new URLSearchParams(hashString);
        
        // Get tokens
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          throw new Error('Please use the reset link from your email');
        }

        // Set the session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw sessionError;
        }

      } catch (error) {
        setError('Please use the reset link from your email');
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

  const inputStyles = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  };

  const buttonStyles = {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  if (success) {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h2>Password successfully updated!</h2>
        <p>Redirecting to your student page</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '40px auto',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Reset Your Password</h1>
      
      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                ...inputStyles,
                paddingRight: '40px',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#666',
                fontSize: '18px',
              }}
            >
              {showPassword ? '⊖' : '⊕'}
            </button>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '4px' 
          }}>
            Password must be at least 6 characters long
          </div>
        </div>
        {error && (
          <div style={{ color: 'red', textAlign: 'center' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={buttonStyles}
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}; 
