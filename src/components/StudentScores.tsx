import React from 'react';
import { supabase } from '../lib/supabase';
import type { StudentCourseScore, Course } from '../types/database.types';

interface Props {
  studentId: string;
}

export const StudentScores: React.FC<Props> = ({ studentId }) => {
  const [scores, setScores] = React.useState<StudentCourseScore[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data, error: scoresError } = await supabase
          .from('student_course_score')
          .select(`
            id,
            created_at,
            updated_at,
            student_id,
            course_grade_id,
            course_id
          `)
          .eq('student_id', studentId);
        
        if (scoresError) {
          throw scoresError;
        }
        
        if (data) {
          setScores(data);
          
          // Get related courses
          const courseIds = data.map(score => score.course_id);
          const { data: coursesData, error: coursesError } = await supabase
            .from('course')
            .select('*')
            .in('id', courseIds);
            
          if (coursesError) {
            throw coursesError;
          }
            
          if (coursesData) {
            setCourses(coursesData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred fetching scores');
      }
    };

    fetchScores();
  }, [studentId]);

  if (error) {
    return (
      <div style={{ color: 'red', padding: '1rem' }}>
        <h2>Error Loading Scores</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Student Scores</h2>
      {scores.length === 0 ? (
        <p>No scores found for this student.</p>
      ) : (
        scores.map(score => {
          const course = courses.find(c => c.id === score.course_id);
          return (
            <div key={score.id} style={{ 
              border: '1px solid #ccc',
              padding: '1rem',
              margin: '1rem 0',
              borderRadius: '4px'
            }}>
              <h3>{course?.name || 'Unknown Course'}</h3>
              <p>Score ID: {score.id}</p>
              <p>Recorded: {new Date(score.created_at).toLocaleDateString()}</p>
            </div>
          );
        })
      )}
    </div>
  );
}; 