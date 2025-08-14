import { AutonomyList } from './AutonomyList';
import { Auth } from './Auth';
import { ResetPassword } from './ResetPassword';
import { StudentGrowthChart } from './StudentGrowthChart';
import { WellspringPulseCheck } from './WellspringPulseCheck';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../hooks/useSupabase';
import './App.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { currentUser, loading: userLoading } = useCurrentUser(user?.email);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're on a password reset page
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsResetPassword(true);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setError(null);

      // First check if we have a session
      await supabase.auth.getSession();

      try {
        // Try local sign out first
        await supabase.auth.signOut({ scope: 'local' });
      } catch (signOutError) {
        console.error('Initial sign out attempt failed:', signOutError);
      }

      // Clear any local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to base URL
      const baseUrl = import.meta.env.BASE_URL || '/5th_day_app_v1/';
      window.location.href = baseUrl;
      
    } catch (err) {
      console.error('Sign out process error:', err);
      setError('Unable to sign out properly. Please try refreshing the page.');
    } finally {
      setSigningOut(false);
    }
  };

  if (authLoading || userLoading) {
    return <div>Loading...</div>;
  }

  if (isResetPassword) {
    return <ResetPassword />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <div className="header">
        <div>
          <h1 className="app-title">5th Day Dashboard</h1>
          {currentUser && (
            <p className="welcome-text">
              Welcome, {currentUser.first_name} {currentUser.last_name}!
            </p>
          )}
        </div>
        <button 
          onClick={handleSignOut}
          disabled={signingOut}
          className="sign-out-button"
        >
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {currentUser?.role_id === 3 && (
        <>
          <StudentGrowthChart />
          <WellspringPulseCheck currentUser={currentUser} />
        </>
      )}
      <AutonomyList currentUser={currentUser} />
    </div>
  );
}

export default App;
