export interface Autonomy {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

export interface AutonomyGrade {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface StudentAutonomyScore {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  autonomy_grade_id: string;
  autonomy_id: string;
  autonomy?: Autonomy;
  autonomy_grade?: AutonomyGrade;
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  grade_level_id?: number;
} 
