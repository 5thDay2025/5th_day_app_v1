import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, info]);
  };

  useEffect(() => {
    const setupSession = async () => {
      try {
        // Log the full URL for debugging
        const fullUrl = window.location.href;
        addDebugInfo(`Full URL: ${fullUrl}`);

        // Parse the hash parameters
        const hash = window.location.hash.substring(1); // Remove first #
        addDebugInfo(`Hash: ${hash}`);

        // Split by # to handle double hash
        const hashParts = hash.split('#');
        const lastPart = hashParts[hashParts.length - 1];
        addDebugInfo(`Processing hash part: ${lastPart.substring(0, 50)}...`);

        // Parse the parameters
        const params = new URLSearchParams(lastPart);
        
        // Get tokens
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        addDebugInfo(`Access token present: ${!!accessToken}`);
        addDebugInfo(`Refresh token present: ${!!refreshToken}`);
        addDebugInfo(`Type: ${type}`);

        if (!accessToken || !refreshToken || type !== 'recovery') {
          throw new Error('Missing or invalid tokens');
        }

        // Set the session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw sessionError;
        }

        // Verify the session was set
        const { data: sessionData } = await supabase.auth.getSession();
        addDebugInfo(`Session established: ${!!sessionData.session}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addDebugInfo(`Error: ${errorMessage}`);
        setError(`Setup error: ${errorMessage}`);
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
      addDebugInfo('Attempting to update password...');
      
      // First check if we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      addDebugInfo(`Session before update: ${!!sessionData.session}`);

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      addDebugInfo('Password updated successfully');
      setSuccess(true);

      // After 3 seconds, redirect to login
      setTimeout(() => {
        window.location.href = '/5th_day_app_v1/';
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      addDebugInfo(`Password update error: ${errorMessage}`);
      setError(errorMessage);
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
        <h2>Password Updated!</h2>
        <p>Your password has been successfully reset.</p>
        <p>Redirecting to login page in 3 seconds...</p>
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

        {/* Debug Information */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '14px',
          border: '1px solid #dee2e6',
          color: '#000',
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#000' }}>Debug Info:</h3>
          {debugInfo.map((info, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '8px',
                padding: '4px 0',
                borderBottom: index < debugInfo.length - 1 ? '1px solid #dee2e6' : 'none'
              }}
            >
              {info}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}; 