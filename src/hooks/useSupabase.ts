import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Autonomy,
  AutonomyGrade,
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

export const useCurrentUser = (email: string | undefined) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user')
          .select('id, created_at, updated_at, first_name, last_name, email, role_id, grade_level_id')
          .eq('email', email)
          .single();

        if (error) throw error;
        setCurrentUser(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [email]);

  return { currentUser, loading, error };
};

export const useStudentAutonomy = (studentId: string | undefined) => {
  const [studentAutonomy, setStudentAutonomy] = useState<{
    autonomy: Autonomy | null;
    autonomyGrade: AutonomyGrade | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStudentAutonomy = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        // First get the student's autonomy score
        type ScoreResponse = {
          autonomy_id: string;
          autonomy_grade_id: string;
          autonomy: {
            id: string;
            name: string;
            description: string;
            created_at?: string;
            updated_at?: string;
          };
          autonomy_grade: {
            id: string;
            name: string;
            created_at?: string;
            updated_at?: string;
          };
        };

        const { data: scoreData, error: scoreError } = await supabase
          .from('student_autonomy_score')
          .select(`
            autonomy_id,
            autonomy_grade_id,
            autonomy (
              id,
              name,
              description,
              created_at,
              updated_at
            ),
            autonomy_grade (
              id,
              name,
              created_at,
              updated_at
            )
          `)
          .eq('student_id', studentId)
          .single();

        if (scoreError) throw scoreError;

        if (scoreData) {
          const data = scoreData as unknown as ScoreResponse;
          const autonomyData = data.autonomy;
          const gradeData = data.autonomy_grade;

          if (!autonomyData || !gradeData) {
            setStudentAutonomy(null);
            return;
          }

          const autonomy: Autonomy = {
            id: String(autonomyData.id),
            created_at: autonomyData.created_at || new Date().toISOString(),
            updated_at: autonomyData.updated_at || new Date().toISOString(),
            name: autonomyData.name,
            description: autonomyData.description
          };

          const autonomyGrade: AutonomyGrade = {
            id: String(gradeData.id),
            created_at: gradeData.created_at || new Date().toISOString(),
            updated_at: gradeData.updated_at || new Date().toISOString(),
            name: gradeData.name
          };

          setStudentAutonomy({
            autonomy,
            autonomyGrade
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAutonomy();
  }, [studentId]);

  return { studentAutonomy, loading, error };
};

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
