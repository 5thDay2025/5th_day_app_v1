import React from 'react';
import { supabase } from '../lib/supabase';
import type { StudentCourseScore, Course } from '../types/database.types';

interface Props {
  studentId: string;
}

export const StudentScores: React.FC<Props> = ({ studentId }) => {
  const [scores, setScores] = React.useState<StudentCourseScore[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);

  React.useEffect(() => {
    // TypeScript knows exactly what fields are available
    const fetchScores = async () => {
      const { data, error } = await supabase
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
      
      if (data) {
        setScores(data);
        // TypeScript would error if we tried to access invalid properties
        // data[0].invalid_field would show an error
        
        // Get related courses
        const courseIds = data.map(score => score.course_id);
        const { data: coursesData } = await supabase
          .from('course')
          .select('*')
          .in('id', courseIds);
          
        if (coursesData) {
          setCourses(coursesData);
        }
      }
    };

    fetchScores();
  }, [studentId]);

  return (
    <div>
      <h2>Student Scores</h2>
      {scores.map(score => {
        // TypeScript helps us find the matching course
        const course = courses.find(c => c.id === score.course_id);
        return (
          <div key={score.id}>
            <h3>{course?.name || 'Unknown Course'}</h3>
            <p>Score ID: {score.id}</p>
            <p>Recorded: {new Date(score.created_at).toLocaleDateString()}</p>
          </div>
        );
      })}
    </div>
  );
}; 