import React from 'react';
import { supabase } from '../lib/supabase';
import type { Autonomy, User } from '../types/database.types';
import { useStudentAutonomy } from '../hooks/useSupabase';
import './AutonomyList.css';

interface Props {
  currentUser: User | null;
}

export const AutonomyList: React.FC<Props> = ({ currentUser }) => {
  console.log('AutonomyList component rendering');

  const [_, setAutonomies] = React.useState<Autonomy[]>([]);
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
    <div className="autonomy-container">
      {isLoading ? (
        <div className="loading-container">
          <h3>Loading...</h3>
        </div>
      ) : error ? (
        <div className="error-container">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
        </div>
      ) : isStudent ? (
        <div>
          {studentAutonomy?.autonomy ? (
            <div className="student-autonomy">
              <h2 className="autonomy-title">
                Current Autonomy Level
              </h2>
              <h3 className="autonomy-subtitle">
                {studentAutonomy.autonomy.name}
              </h3>
              <p className="autonomy-description">
                {studentAutonomy.autonomy.description}
              </p>
            </div>
          ) : (
            <div className="student-autonomy text-center">
              <h2 className="autonomy-title">
                Current Autonomy Level
              </h2>
              <p className="autonomy-description">
                No autonomy level has been assigned yet. Please check with your teacher.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-message text-center">
          <p className="autonomy-description">
            Nothing to see here.
          </p>
        </div>
      )}
    </div>
  );
}; 
