import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (data && !isLogin) {
        alert('Check your email for the confirmation link!');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Add a specific hash format that Supabase expects
      const redirectUrl = new URL(`${window.location.origin}${window.location.pathname}`);
      redirectUrl.hash = 'type=recovery';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString()
      });
      
      if (error) throw error;
      
      setResetSent(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
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

  const linkButtonStyles = {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    padding: '0',
    font: 'inherit',
    textDecoration: 'underline',
  };

  if (resetSent) {
    return (
      <div className="auth-container" style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h2>Check Your Email</h2>
        <p>We've sent you a password reset link. Please check your email.</p>
        <button
          onClick={() => {
            setResetSent(false);
            setError(null);
          }}
          style={linkButtonStyles}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container" style={{
      maxWidth: '400px',
      margin: '40px auto',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome to 5th Day App</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyles}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          {loading 
            ? (isLogin ? 'Logging in...' : 'Creating account...') 
            : (isLogin ? 'Login' : 'Sign Up')}
        </button>

        <div style={{ 
          textAlign: 'center',
          marginTop: '8px',
          color: '#666',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {isLogin ? (
            <>
              <div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  style={linkButtonStyles}
                >
                  Forgot your password?
                </button>
              </div>
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  style={linkButtonStyles}
                >
                  Sign up
                </button>
              </div>
            </>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={linkButtonStyles}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}; 