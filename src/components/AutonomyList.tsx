import React from 'react';
import { supabase } from '../lib/supabase';
import type { Autonomy, User } from '../types/database.types';
import { useStudentAutonomy } from '../hooks/useSupabase';

interface Props {
  currentUser: User | null;
}

export const AutonomyList: React.FC<Props> = ({ currentUser }) => {
  console.log('AutonomyList component rendering');

  const [autonomies, setAutonomies] = React.useState<Autonomy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Fetch student's autonomy if they are a student
  const { studentAutonomy, loading: studentAutonomyLoading } = useStudentAutonomy(
    currentUser?.role_id === 3 ? currentUser.id : undefined
  );

  React.useEffect(() => {
    // Only fetch all autonomies if user is not a student
    if (currentUser?.role_id !== 3) {
      const fetchAutonomies = async () => {
        try {
          const { data, error } = await supabase
            .from('autonomy')
            .select('id, created_at, updated_at, name, description');

          if (error) throw error;

          if (!data) {
            setAutonomies([]);
            return;
          }

          const validatedData = data.map(item => ({
            id: String(item.id),
            created_at: item.created_at,
            updated_at: item.updated_at,
            name: item.name,
            description: item.description
          }));

          setAutonomies(validatedData);
        } catch (err) {
          console.error('Error fetching autonomies:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };

      fetchAutonomies();
    }
  }, [currentUser?.role_id]);

  const isStudent = currentUser?.role_id === 3;
  const isLoading = isStudent ? studentAutonomyLoading : loading;

  return (
    <div style={{ padding: '1rem' }}>
      {isLoading ? (
        <div style={{ padding: '1rem', margin: '1rem' }}>
          <h3>Loading...</h3>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', color: '#dc3545', margin: '1rem' }}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
        </div>
      ) : isStudent ? (
        <div>
          {studentAutonomy?.autonomy ? (
            <div style={{ 
              maxWidth: '800px',
              margin: '0 auto',
              padding: '2rem',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px'
            }}>
              <h2 style={{ 
                color: '#fff',
                marginBottom: '1.5rem',
                fontSize: '1.75rem'
              }}>
                Current Autonomy Level
              </h2>
              <h3 style={{ 
                color: '#fff',
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                {studentAutonomy.autonomy.name}
              </h3>
              <p style={{ 
                color: '#ccc',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                textAlign: 'left'
              }}>
                {studentAutonomy.autonomy.description}
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <p>No autonomy level has been assigned yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>All Autonomy Levels</h2>
          <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
            {autonomies.map(autonomy => (
              <div 
                key={autonomy.id}
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '1.5rem',
                  borderRadius: '6px'
                }}
              >
                <h3 style={{ color: '#fff' }}>Level {autonomy.id}: {autonomy.name}</h3>
                <p style={{ color: '#ccc' }}>{autonomy.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
