import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

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


  if (showConfirmation) {
    return (
      <div className="auth-container text-center">
        <h2>Confirm Your Signup</h2>
        <p>Check your email for a confirmation link from Supabase Auth</p>
        <button
          onClick={() => {
            setShowConfirmation(false);
            setIsLogin(true);
          }}
          className="auth-link"
        >
          Back to login
        </button>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="auth-container text-center">
        <h2>Reset Your Password</h2>
        <p>Check your email for a password reset link from Supabase Auth</p>
        <button
          onClick={() => {
            setResetSent(false);
            setError(null);
          }}
          className="auth-link"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">5th Day Dashboard</h1>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="form-group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input with-button"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
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
          className="auth-button"
        >
          {loading 
            ? (isLogin ? 'Logging in...' : 'Creating account...') 
            : (isLogin ? 'Login' : 'Sign Up')}
        </button>

        <div className="auth-links">
          {isLogin ? (
            <>
              <div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="auth-link"
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
                  className="auth-link"
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
                className="auth-link"
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
