import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Autonomy,
  Course,
  User,
  StudentCourseScore,
} from '../types/database.types';

export const useAutonomies = () => {
  const [autonomies, setAutonomies] = useState<Autonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAutonomies = async () => {
      try {
        const { data, error } = await supabase
          .from('autonomy')
          .select('id, created_at, updated_at, name, description');

        if (error) throw error;
        setAutonomies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchAutonomies();
  }, []);

  return { autonomies, loading, error };
};

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('course')
          .select('id, created_at, updated_at, created_by, name, description, is_archived');

        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user')
          .select('id, created_at, updated_at, first_name, last_name, email, role_id, grade_level_id');

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

// Example of a more complex query with relationships
export const useStudentCourseScores = (studentId: string) => {
  const [scores, setScores] = useState<StudentCourseScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
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

        if (error) throw error;
        setScores(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchScores();
    }
  }, [studentId]);

  return { scores, loading, error };
}; 
