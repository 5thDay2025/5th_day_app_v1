// TODO should ids be ints?
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

export interface Course {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  name: string;
  description: string;
  is_archived: boolean;
}

export interface CourseGrade {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface CourseStudent {
  id: string;
  created_at: string;
  updated_at: string;
  course_id: string;
  student_id: string;
}

export interface CourseFocusArea {
  id: string;
  created_at: string;
  updated_at: string;
  course_id: string;
  focus_area_id: string;
}

export interface FocusArea {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

export interface FocusAreaGrade {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface GradeLevel {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface Presence {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

export interface PresenceGrade {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface Role {
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
}

export interface StudentCourseScore {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  course_grade_id: string;
  course_id: string;
}

export interface StudentFocusAreaScore {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  focus_area_grade_id: string;
  course_focus_area_id: string;
}

export interface StudentPresenceScore {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  presence_grade_id: string;
  presence_id: string;
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
