// Supabase 데이터베이스 타입 정의

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: Role;
        Insert: Omit<Role, 'role_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Role, 'role_id' | 'created_at'>>;
      };
      permissions: {
        Row: Permission;
        Insert: Omit<Permission, 'permission_id' | 'created_at'>;
        Update: Partial<Omit<Permission, 'permission_id' | 'created_at'>>;
      };
      role_permissions: {
        Row: RolePermission;
        Insert: Omit<RolePermission, 'created_at'>;
        Update: Partial<
          Omit<RolePermission, 'role_id' | 'permission_id' | 'created_at'>
        >;
      };
      members: {
        Row: Member;
        Insert: Omit<Member, 'member_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Member, 'member_id' | 'created_at' | 'auth_id'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'task_id' | 'created_at'>>;
      };
      cost_groups: {
        Row: CostGroup;
        Insert: Omit<CostGroup, 'cost_group_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CostGroup, 'cost_group_id' | 'created_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'service_id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'project_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'project_id' | 'created_at'>>;
      };
      codes: {
        Row: Code;
        Insert: Omit<Code, 'code_id' | 'created_at'>;
        Update: Partial<Omit<Code, 'code_id' | 'created_at'>>;
      };
      holidays: {
        Row: Holiday;
        Insert: Omit<Holiday, 'holiday_id' | 'created_at'>;
        Update: Partial<Omit<Holiday, 'holiday_id' | 'created_at'>>;
      };
      departments: {
        Row: Department;
        Insert: Omit<Department, 'department_id' | 'created_at' | 'updated_at' | 'depth' | 'path'>;
        Update: Partial<Omit<Department, 'department_id' | 'created_at' | 'code' | 'parent_department_id' | 'depth' | 'path'>>;
      };
    };
  };
}

// 기본 타입 정의
export interface Role {
  role_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  permission_id: number;
  key: string;
  name: string;
  created_at: string;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
  read_access: boolean;
  write_access: boolean;
  created_at: string;
}

export interface Member {
  member_id: number;
  auth_id: string;
  account_id: string;
  name: string;
  email: string;
  mobile?: string;
  role_id?: number;
  department_id?: number;
  is_active: boolean;
  requires_daily_report: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  task_id: number;
  member_id: number;
  task_date: string;
  task_type?: string;
  task_name: string;
  task_detail?: string;
  task_url?: string;
  work_time?: number;
  cost_group_id?: number;
  service_id?: number;
  project_id?: number;
  platform_id?: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CostGroup {
  cost_group_id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  service_id: number;
  name: string;
  cost_group_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  project_id: number;
  name: string;
  service_id?: number;
  platform_id?: number;
  version?: string;
  task_type?: string;
  memo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Code {
  code_id: number;
  code_group_id: number;
  name: string;
  key: string;
  value?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Holiday {
  holiday_id: number;
  holiday_date: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Department {
  department_id: number;
  name: string;
  description?: string;
  parent_department_id?: number;
  depth: number;
  path: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  member_count?: number;
}

// API 요청/응답 타입
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResponse {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface TaskQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  taskType?: string;
  costGroupId?: string;
  serviceId?: string;
  projectId?: string;
  platformId?: string;
  keyword?: string;
}

export interface DepartmentQuery extends PaginationQuery {
  isActive?: boolean;
  search?: string;
  parentId?: number;
  includeInactive?: boolean;
}

export interface MemberQuery extends PaginationQuery {
  page?: number;
  pageSize?: number;
  roleId?: number;
  isActive?: boolean;
  search?: string;
  departmentId?: number;
  includeSubDepartments?: boolean;
}
