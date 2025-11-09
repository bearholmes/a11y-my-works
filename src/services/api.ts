import { supabase } from '../lib/supabase';
import type {
  Database,
  TaskQuery,
  PaginationResponse,
  Member,
} from '../types/database';

// 업무 보고 API
export const taskAPI = {
  async getTasks(query: TaskQuery = {}) {
    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      keyword,
      memberId,
      taskType,
      costGroupId,
      serviceId,
      projectId,
      platformId,
    } = query;

    let queryBuilder = supabase
      .from('tasks')
      .select(`
        *,
        members!inner(name, account_id),
        cost_groups(name),
        services(name),
        projects(name),
        platform_codes:codes!tasks_platform_id_fkey(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // 필터 적용
    if (startDate) {
      queryBuilder = queryBuilder.gte('task_date', startDate);
    }
    if (endDate) {
      queryBuilder = queryBuilder.lte('task_date', endDate);
    }
    if (keyword) {
      queryBuilder = queryBuilder.or(`task_name.ilike.%${keyword}%,task_detail.ilike.%${keyword}%`);
    }
    if (memberId) {
      queryBuilder = queryBuilder.eq('member_id', memberId);
    }
    if (taskType) {
      queryBuilder = queryBuilder.eq('task_type', taskType);
    }
    if (costGroupId) {
      queryBuilder = queryBuilder.eq('cost_group_id', costGroupId);
    }
    if (serviceId) {
      queryBuilder = queryBuilder.eq('service_id', serviceId);
    }
    if (projectId) {
      queryBuilder = queryBuilder.eq('project_id', projectId);
    }
    if (platformId) {
      queryBuilder = queryBuilder.eq('platform_id', platformId);
    }

    // 페이지네이션
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    
    const { data, error, count } = await queryBuilder.range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } as PaginationResponse
    };
  },

  async createTask(task: Database['public']['Tables']['tasks']['Insert']) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: number, updates: Database['public']['Tables']['tasks']['Update']) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('task_id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId: number) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('task_id', taskId);

    if (error) throw error;
  }
};

// 사용자 API
export const memberAPI = {
  async getCurrentMember() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        roles(name, description)
      `)
      .eq('auth_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 회원 프로필을 생성합니다.
   * @param authId Supabase Auth ID
   * @param profile 회원 프로필 정보
   * @param autoApprove true면 즉시 활성화 (초대 가입), false면 승인 대기 (일반 가입)
   */
  async createMemberProfile(
    authId: string,
    profile: Partial<Member>,
    autoApprove: boolean = false
  ) {
    const { data, error } = await supabase
      .from('members')
      .insert({
        auth_id: authId,
        account_id: profile.account_id || '',
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile,
        role_id: autoApprove ? (profile.role_id || 3) : null, // 자동승인: 역할 부여, 일반가입: null
        is_active: autoApprove // 자동승인: true, 일반가입: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 현재 사용자의 권한 목록을 조회합니다.
   * @returns 사용자 권한 목록 (권한 키, 읽기/쓰기 권한 포함)
   */
  async getCurrentMemberPermissions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 사용자 정보와 역할 조회
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('role_id')
      .eq('auth_id', user.id)
      .single();

    if (memberError) throw memberError;
    if (!member) throw new Error('Member not found');

    // 역할에 할당된 권한 조회
    const { data: rolePermissions, error: permError } = await supabase
      .from('role_permissions')
      .select(`
        read_access,
        write_access,
        permissions!inner(key, name)
      `)
      .eq('role_id', member.role_id);

    if (permError) throw permError;

    // 권한 데이터 변환
    return (rolePermissions || []).map((rp: any) => ({
      key: rp.permissions.key,
      name: rp.permissions.name,
      canRead: rp.read_access,
      canWrite: rp.write_access
    }));
  },

  /**
   * 전체 사용자 목록을 조회합니다.
   */
  async getMembers(params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) {
    const { page = 1, pageSize = 20, search, isActive } = params || {};

    let query = supabase
      .from('members')
      .select(`
        *,
        roles(role_id, name, description)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,account_id.ilike.%${search}%`);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } as PaginationResponse
    };
  },

  /**
   * 특정 사용자 정보를 조회합니다.
   */
  async getMember(memberId: number) {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        roles(role_id, name, description)
      `)
      .eq('member_id', memberId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 사용자 정보를 수정합니다.
   */
  async updateMember(memberId: number, updates: Database['public']['Tables']['members']['Update']) {
    const { data, error } = await supabase
      .from('members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('member_id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 사용자를 비활성화합니다. (소프트 삭제)
   */
  async deactivateMember(memberId: number) {
    return this.updateMember(memberId, { is_active: false });
  },

  /**
   * 사용자를 활성화합니다.
   */
  async activateMember(memberId: number) {
    return this.updateMember(memberId, { is_active: true });
  },

  /**
   * 대기 중인 사용자를 승인하고 역할을 할당합니다.
   */
  async approveMember(memberId: number, roleId: number) {
    return this.updateMember(memberId, {
      role_id: roleId,
      is_active: true
    });
  }
};

// 역할 관리 API
export const roleAPI = {
  /**
   * 전체 역할 목록을 조회합니다.
   */
  async getRoles(params?: { page?: number; pageSize?: number; isActive?: boolean }) {
    const { page = 1, pageSize = 50, isActive } = params || {};

    let query = supabase
      .from('roles')
      .select('*', { count: 'exact' })
      .order('role_id');

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } as PaginationResponse
    };
  },

  /**
   * 특정 역할의 상세 정보와 권한을 조회합니다.
   */
  async getRole(roleId: number) {
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('role_id', roleId)
      .single();

    if (roleError) throw roleError;

    // 역할의 권한 조회
    const { data: rolePermissions, error: permError } = await supabase
      .from('role_permissions')
      .select(`
        read_access,
        write_access,
        permissions(permission_id, key, name)
      `)
      .eq('role_id', roleId);

    if (permError) throw permError;

    return {
      ...role,
      permissions: (rolePermissions || []).map((rp: any) => ({
        permissionId: rp.permissions.permission_id,
        key: rp.permissions.key,
        name: rp.permissions.name,
        readAccess: rp.read_access,
        writeAccess: rp.write_access
      }))
    };
  },

  /**
   * 새로운 역할을 생성합니다.
   */
  async createRole(role: Database['public']['Tables']['roles']['Insert'], permissions?: Array<{ permissionId: number; readAccess: boolean; writeAccess: boolean }>) {
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single();

    if (error) throw error;

    // 권한 할당
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map(p => ({
        role_id: data.role_id,
        permission_id: p.permissionId,
        read_access: p.readAccess,
        write_access: p.writeAccess
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (permError) throw permError;
    }

    return data;
  },

  /**
   * 역할 정보를 수정합니다.
   */
  async updateRole(
    roleId: number,
    updates: Database['public']['Tables']['roles']['Update'],
    permissions?: Array<{ permissionId: number; readAccess: boolean; writeAccess: boolean }>
  ) {
    const { data, error } = await supabase
      .from('roles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('role_id', roleId)
      .select()
      .single();

    if (error) throw error;

    // 권한 업데이트
    if (permissions) {
      // 기존 권한 삭제
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) throw deleteError;

      // 새 권한 추가
      if (permissions.length > 0) {
        const rolePermissions = permissions.map(p => ({
          role_id: roleId,
          permission_id: p.permissionId,
          read_access: p.readAccess,
          write_access: p.writeAccess
        }));

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (insertError) throw insertError;
      }
    }

    return data;
  },

  /**
   * 역할을 삭제합니다.
   */
  async deleteRole(roleId: number) {
    // 먼저 해당 역할을 사용하는 사용자가 있는지 확인
    const { data: members, error: checkError } = await supabase
      .from('members')
      .select('member_id')
      .eq('role_id', roleId)
      .limit(1);

    if (checkError) throw checkError;

    if (members && members.length > 0) {
      throw new Error('이 역할을 사용하는 사용자가 있어 삭제할 수 없습니다.');
    }

    // 역할 권한 삭제
    const { error: permError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (permError) throw permError;

    // 역할 삭제
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('role_id', roleId);

    if (error) throw error;
  }
};

// 권한 API
export const permissionAPI = {
  /**
   * 전체 권한 목록을 조회합니다.
   */
  async getPermissions() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('permission_id');

    if (error) throw error;
    return data || [];
  }
};

// 코드 관리 API
export const codeAPI = {
  async getCodes(groupName?: string) {
    let query = supabase
      .from('codes')
      .select(`
        *,
        code_groups!inner(name)
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (groupName) {
      query = query.eq('code_groups.name', groupName);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getPlatforms() {
    return this.getCodes('PLATFORM');
  },

  async getWorkTypes() {
    return this.getCodes('WORK_TYPE');
  },

  async getCategories() {
    return this.getCodes('CATEGORY');
  }
};

// 프로젝트 관리 API
export const projectAPI = {
  /**
   * 프로젝트 목록을 조회합니다.
   */
  async getProjects(params?: { page?: number; pageSize?: number; search?: string; platform?: string }) {
    const { page = 1, pageSize = 20, search, platform } = params || {};

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } as PaginationResponse
    };
  },

  /**
   * 특정 프로젝트 정보를 조회합니다.
   */
  async getProject(projectId: number) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 새로운 프로젝트를 생성합니다.
   */
  async createProject(project: Database['public']['Tables']['projects']['Insert']) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 프로젝트 정보를 수정합니다.
   */
  async updateProject(projectId: number, updates: Database['public']['Tables']['projects']['Update']) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 필터용 서비스 목록을 조회합니다.
   */
  async getServicesForFilter() {
    const { data, error } = await supabase
      .from('services')
      .select('service_id, name, cost_group_id')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * 프로젝트를 삭제합니다.
   */
  async deleteProject(projectId: number) {
    // 먼저 해당 프로젝트를 사용하는 업무가 있는지 확인
    const { data: tasks, error: checkError} = await supabase
      .from('tasks')
      .select('task_id')
      .eq('project_id', projectId)
      .limit(1);

    if (checkError) throw checkError;

    if (tasks && tasks.length > 0) {
      throw new Error('이 프로젝트를 사용하는 업무가 있어 삭제할 수 없습니다.');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', projectId);

    if (error) throw error;
  }
};

// 서비스 관리 API
export const serviceAPI = {
  /**
   * 서비스 목록을 조회합니다.
   */
  async getServices(params?: { page?: number; pageSize?: number; search?: string; costGroupId?: number }) {
    const { page = 1, pageSize = 20, search, costGroupId } = params || {};

    let query = supabase
      .from('services')
      .select(`
        *,
        cost_groups(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    if (costGroupId) {
      query = query.eq('cost_group_id', costGroupId);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } as PaginationResponse
    };
  },

  /**
   * 특정 서비스 정보를 조회합니다.
   */
  async getService(serviceId: number) {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        cost_groups(name)
      `)
      .eq('service_id', serviceId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 새로운 서비스를 생성합니다.
   */
  async createService(service: Database['public']['Tables']['services']['Insert']) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 서비스 정보를 수정합니다.
   */
  async updateService(serviceId: number, updates: Database['public']['Tables']['services']['Update']) {
    const { data, error } = await supabase
      .from('services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('service_id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 서비스를 삭제합니다.
   */
  async deleteService(serviceId: number) {
    // 먼저 해당 서비스를 사용하는 프로젝트가 있는지 확인
    const { data: projects, error: checkError } = await supabase
      .from('projects')
      .select('project_id')
      .eq('service_id', serviceId)
      .limit(1);

    if (checkError) throw checkError;

    if (projects && projects.length > 0) {
      throw new Error('이 서비스를 사용하는 프로젝트가 있어 삭제할 수 없습니다.');
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('service_id', serviceId);

    if (error) throw error;
  },

  /**
   * 청구 그룹 목록을 조회합니다. (필터용)
   */
  async getCostGroupsForFilter() {
    const { data, error } = await supabase
      .from('cost_groups')
      .select('cost_group_id, name')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }
};

// 청구 그룹 관리 API
export const costGroupAPI = {
  /**
   * 청구 그룹 목록을 조회합니다.
   */
  async getCostGroups(params?: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 20, search } = params || {};

    let query = supabase
      .from('cost_groups')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize)
      } as PaginationResponse
    };
  },

  /**
   * 특정 청구 그룹 정보를 조회합니다.
   */
  async getCostGroup(costGroupId: number) {
    const { data, error } = await supabase
      .from('cost_groups')
      .select('*')
      .eq('cost_group_id', costGroupId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 새로운 청구 그룹을 생성합니다.
   */
  async createCostGroup(costGroup: Database['public']['Tables']['cost_groups']['Insert']) {
    const { data, error } = await supabase
      .from('cost_groups')
      .insert(costGroup)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 청구 그룹 정보를 수정합니다.
   */
  async updateCostGroup(costGroupId: number, updates: Database['public']['Tables']['cost_groups']['Update']) {
    const { data, error } = await supabase
      .from('cost_groups')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('cost_group_id', costGroupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 청구 그룹을 삭제합니다.
   */
  async deleteCostGroup(costGroupId: number) {
    // 먼저 해당 청구 그룹을 사용하는 서비스가 있는지 확인
    const { data: services, error: checkError } = await supabase
      .from('services')
      .select('service_id')
      .eq('cost_group_id', costGroupId)
      .limit(1);

    if (checkError) throw checkError;

    if (services && services.length > 0) {
      throw new Error('이 청구 그룹을 사용하는 서비스가 있어 삭제할 수 없습니다.');
    }

    const { error } = await supabase
      .from('cost_groups')
      .delete()
      .eq('cost_group_id', costGroupId);

    if (error) throw error;
  }
};

// 비즈니스 데이터 API
export const businessAPI = {
  async getCostGroups() {
    const { data, error } = await supabase
      .from('cost_groups')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getServices(costGroupId?: number) {
    let query = supabase
      .from('services')
      .select(`
        *,
        cost_groups(name)
      `)
      .eq('is_active', true)
      .order('name');

    if (costGroupId) {
      query = query.eq('cost_group_id', costGroupId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getProjects(serviceId?: number) {
    let query = supabase
      .from('projects')
      .select(`
        *,
        services(name)
      `)
      .eq('is_active', true)
      .order('name');

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};

// 초대 관리 API (Supabase Auth 사용)
export const invitationAPI = {
  /**
   * Supabase Auth의 inviteUserByEmail을 사용하여 사용자를 초대합니다.
   * Supabase가 자동으로 초대 이메일을 발송합니다.
   */
  async inviteUser(params: {
    email: string;
    role_id: number;
    name?: string;
  }) {
    const { email, role_id, name } = params;

    // 이미 가입된 이메일인지 확인
    const { data: existingMember } = await supabase
      .from('members')
      .select('member_id')
      .eq('email', email)
      .maybeSingle();

    if (existingMember) {
      throw new Error('이미 가입된 이메일입니다.');
    }

    // Supabase Auth를 통해 사용자 초대
    // 주의: 이 API는 service_role 키가 필요합니다.
    // 프로덕션에서는 반드시 백엔드에서 호출해야 합니다.
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role_id,
        name: name || '',
        invited: true
      },
      redirectTo: `${window.location.origin}/auth/callback`
    });

    if (error) throw error;
    return data;
  }
};