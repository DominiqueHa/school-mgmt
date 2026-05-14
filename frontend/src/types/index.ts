export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  nationality?: string;
  address?: string;
  id_card_number?: string;
  photo_url?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  education_level?: string;
  is_active: boolean;
  must_change_password: boolean;
}

export interface Student {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  registration_number: string;
  date_of_birth?: string;
  class_name?: string;
  is_active: boolean;
  enrollment_status: 'enrolled' | 'suspended' | 'graduated' | 'transferred' | 'dropped';
}

export interface Teacher {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  employee_number: string;
  speciality?: string;
  hire_date?: string;
  is_active: boolean;
  employment_status: 'active' | 'on_leave' | 'suspended' | 'retired' | 'terminated';
  contract_type: 'permanent' | 'temporary' | 'volunteer';
}

export interface Staff {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  employee_number: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  employment_status: 'active' | 'on_leave' | 'suspended' | 'retired' | 'terminated';
  contract_type: 'permanent' | 'temporary' | 'volunteer';
}

export interface SchoolYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  school_year: string;
  student_count: number;
  max_students: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}
