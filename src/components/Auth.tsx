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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw error;
      } else {
        // Get the base URL from Vite's environment for signup
        const baseUrl = import.meta.env.BASE_URL;
        const fullRedirectUrl = `${window.location.origin}${baseUrl}`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: fullRedirectUrl
          }
        });
        
        if (error) throw error;

        // Check if the user already exists
        if (data?.user?.identities?.length === 0) {
          setError('This email is already registered. Please try logging in instead.');
          return;
        }

        if (data) {
          setShowConfirmation(true);
        }
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
      // Get the base URL from Vite's environment
      const baseUrl = import.meta.env.BASE_URL;
      const fullRedirectUrl = `${window.location.origin}${baseUrl}`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: fullRedirectUrl
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

  if (showConfirmation) {
    return (
      <div className="auth-container" style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h2>Confirm Your Signup</h2>
        <p>Check your email for a confirmation link from Supabase Auth</p>
        <button
          onClick={() => {
            setShowConfirmation(false);
            setIsLogin(true);
          }}
          style={linkButtonStyles}
        >
          Back to login
        </button>
      </div>
    );
  }

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
        <h2>Reset Your Password</h2>
        <p>Check your email for a password reset link from Supabase Auth</p>
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
                  onClick={() => {
                    setIsLogin(false);
                    setError(null);  // Clear error when switching to signup
                  }}
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
                onClick={() => {
                  setIsLogin(true);
                  setError(null);  // Clear error when switching to login
                }}
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
