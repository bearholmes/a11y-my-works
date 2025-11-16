import { supabase } from '../lib/supabase';
import type {
  Database,
  Department,
  DepartmentQuery,
  DepartmentTreeNode,
  Member,
  MemberQuery,
  PaginationResponse,
  TaskQuery,
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
      .select(
        `
        *,
        members!inner(name, account_id),
        cost_groups(name),
        services(name),
        projects(name),
        platform_codes:codes!tasks_platform_id_fkey(name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // 필터 적용
    if (startDate) {
      queryBuilder = queryBuilder.gte('task_date', startDate);
    }
    if (endDate) {
      queryBuilder = queryBuilder.lte('task_date', endDate);
    }
    if (keyword) {
      queryBuilder = queryBuilder.or(
        `task_name.ilike.%${keyword}%,task_detail.ilike.%${keyword}%`
      );
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
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

  async updateTask(
    taskId: number,
    updates: Database['public']['Tables']['tasks']['Update']
  ) {
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
  },
};

// 사용자 API
export const memberAPI = {
  async getCurrentMember() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        role_id: autoApprove ? profile.role_id || 3 : null, // 자동승인: 역할 부여, 일반가입: null
        is_active: autoApprove, // 자동승인: true, 일반가입: false
        requires_daily_report: profile.requires_daily_report ?? true, // 기본값: true (업무보고 작성 필수)
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      canWrite: rp.write_access,
    }));
  },

  /**
   * 전체 사용자 목록을 조회합니다.
   */
  async getMembers(params?: MemberQuery) {
    const {
      page = 1,
      pageSize = 20,
      search,
      isActive,
      departmentId,
      includeSubDepartments = false,
    } = params || {};

    let query = supabase
      .from('members')
      .select(
        `
        *,
        roles(role_id, name, description),
        departments(department_id, name, code, path)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,account_id.ilike.%${search}%`
      );
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    // 부서 필터링
    if (departmentId) {
      if (includeSubDepartments) {
        // 하위 부서 포함: path를 사용하여 검색
        const { data: dept, error: deptError } = await supabase
          .from('departments')
          .select('path')
          .eq('department_id', departmentId)
          .single();

        if (deptError) throw deptError;

        if (dept) {
          // 해당 부서 및 하위 부서의 사용자 조회
          const { data: deptIds, error: deptIdsError } = await supabase
            .from('departments')
            .select('department_id')
            .or(`department_id.eq.${departmentId},path.like.${dept.path}/%`);

          if (deptIdsError) throw deptIdsError;

          const ids = (deptIds || []).map((d) => d.department_id);
          if (ids.length > 0) {
            query = query.in('department_id', ids);
          }
        }
      } else {
        // 특정 부서만
        query = query.eq('department_id', departmentId);
      }
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
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
  async updateMember(
    memberId: number,
    updates: Database['public']['Tables']['members']['Update']
  ) {
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
      is_active: true,
    });
  },

  /**
   * 관리자가 사용자의 비밀번호 재설정 이메일을 발송합니다.
   * @param email 사용자 이메일
   */
  async resetUserPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  },
};

// 부서 관리 API
export const departmentAPI = {
  /**
   * 부서 목록을 조회합니다.
   */
  async getDepartments(params?: DepartmentQuery) {
    const {
      page = 1,
      pageSize = 50,
      search,
      isActive = true,
      parentId,
      includeInactive = false,
    } = params || {};

    let query = supabase
      .from('departments')
      .select(
        `
        *,
        parent:departments!parent_department_id(department_id, name)
      `,
        { count: 'exact' }
      )
      .order('sort_order')
      .order('name');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // includeInactive가 false이면 활성 부서만 조회
    if (!includeInactive) {
      query = query.eq('is_active', true);
    } else if (isActive !== undefined) {
      // includeInactive가 true이고 isActive가 지정된 경우
      query = query.eq('is_active', isActive);
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        // 최상위 부서만 (parent_department_id가 null)
        query = query.is('parent_department_id', null);
      } else {
        // 특정 부서의 직속 하위 부서만
        query = query.eq('parent_department_id', parentId);
      }
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    // 소속 사용자 수 조회
    const departmentIds = (data || []).map((d) => d.department_id);
    let memberCounts: Record<number, number> = {};

    if (departmentIds.length > 0) {
      const { data: memberData } = await supabase
        .from('members')
        .select('department_id')
        .in('department_id', departmentIds);

      memberCounts = (memberData || []).reduce(
        (acc, m) => {
          acc[m.department_id] = (acc[m.department_id] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );
    }

    // 결과 데이터 조합
    const result = (data || []).map((dept) => ({
      ...dept,
      parent_department_name: dept.parent?.name || null,
      member_count: memberCounts[dept.department_id] || 0,
    }));

    return {
      data: result,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
    };
  },

  /**
   * 특정 부서의 상세 정보를 조회합니다.
   */
  async getDepartment(departmentId: number) {
    const { data, error } = await supabase
      .from('departments')
      .select(
        `
        *,
        parent:departments!parent_department_id(department_id, name)
      `
      )
      .eq('department_id', departmentId)
      .single();

    if (error) throw error;

    // 하위 부서 조회
    const { data: children } = await supabase
      .from('departments')
      .select('department_id, name')
      .eq('parent_department_id', departmentId)
      .order('sort_order')
      .order('name');

    // 소속 사용자 조회
    const { data: members } = await supabase
      .from('members')
      .select(
        `
        member_id,
        name,
        account_id,
        is_active,
        roles(name)
      `
      )
      .eq('department_id', departmentId)
      .order('name');

    // 소속 사용자 수 카운트
    const { data: childrenWithCounts } = await Promise.all(
      (children || []).map(async (child) => {
        const { count } = await supabase
          .from('members')
          .select('member_id', { count: 'exact', head: true })
          .eq('department_id', child.department_id);

        return {
          ...child,
          member_count: count || 0,
        };
      })
    );

    return {
      ...data,
      parent_department_name: data.parent?.name || null,
      member_count: members?.length || 0,
      child_departments: childrenWithCounts || [],
      members: (members || []).map((m: any) => ({
        member_id: m.member_id,
        name: m.name,
        account_id: m.account_id,
        role_name: m.roles?.name || null,
        is_active: m.is_active,
      })),
    };
  },

  /**
   * 부서 계층 구조를 트리 형태로 조회합니다.
   */
  async getDepartmentTree(params?: { includeInactive?: boolean }) {
    const { includeInactive = false } = params || {};

    let query = supabase
      .from('departments')
      .select('*')
      .order('sort_order')
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 소속 사용자 수 조회
    const { data: memberData } = await supabase
      .from('members')
      .select('department_id');

    const memberCounts = (memberData || []).reduce(
      (acc, m) => {
        if (m.department_id) {
          acc[m.department_id] = (acc[m.department_id] || 0) + 1;
        }
        return acc;
      },
      {} as Record<number, number>
    );

    // 트리 구조 생성
    const departments = (data || []).map((dept) => ({
      ...dept,
      member_count: memberCounts[dept.department_id] || 0,
      children: [] as DepartmentTreeNode[],
    }));

    const deptMap = new Map<number, DepartmentTreeNode>();
    departments.forEach((dept) => {
      deptMap.set(dept.department_id, dept);
    });

    const tree: DepartmentTreeNode[] = [];

    departments.forEach((dept) => {
      if (dept.parent_department_id === null) {
        // 최상위 부서
        tree.push(dept);
      } else {
        // 하위 부서
        const parent = deptMap.get(dept.parent_department_id);
        if (parent) {
          parent.children.push(dept);
        }
      }
    });

    return tree;
  },

  /**
   * 새로운 부서를 생성합니다.
   */
  async createDepartment(
    department: Database['public']['Tables']['departments']['Insert']
  ) {
    // 상위 부서가 지정된 경우 존재 여부 확인
    if (department.parent_department_id) {
      const { data: parent, error: parentError } = await supabase
        .from('departments')
        .select('department_id, depth, path')
        .eq('department_id', department.parent_department_id)
        .single();

      if (parentError || !parent) {
        throw new Error('상위 부서를 찾을 수 없습니다.');
      }

      // depth와 path 계산
      department.depth = parent.depth + 1;
      // path는 insert 후에 부서 ID를 알아야 완성할 수 있으므로 임시값
      department.path = `${parent.path}/temp`;
    } else {
      department.depth = 0;
      department.path = '/temp';
    }

    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();

    if (error) throw error;

    // path 업데이트 (생성된 department_id를 사용)
    const correctPath = department.parent_department_id
      ? `${department.path.replace('/temp', '')}/${data.department_id}`
      : `/${data.department_id}`;

    const { error: updateError } = await supabase
      .from('departments')
      .update({ path: correctPath })
      .eq('department_id', data.department_id);

    if (updateError) throw updateError;

    return { ...data, path: correctPath };
  },

  /**
   * 부서 정보를 수정합니다.
   * 참고: parent_department_id는 생성 후 수정 불가 (데이터 무결성 유지)
   */
  async updateDepartment(
    departmentId: number,
    updates: Database['public']['Tables']['departments']['Update']
  ) {
    // parent_department_id, depth, path 변경 방지
    const safeUpdates = { ...updates };
    delete safeUpdates.parent_department_id;
    delete safeUpdates.depth;
    delete safeUpdates.path;

    const { data, error } = await supabase
      .from('departments')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('department_id', departmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 부서를 삭제합니다.
   * 하위 부서가 있거나 소속 사용자가 있는 경우 삭제할 수 없습니다.
   */
  async deleteDepartment(departmentId: number) {
    // 하위 부서 확인
    const { data: children, error: childError } = await supabase
      .from('departments')
      .select('department_id')
      .eq('parent_department_id', departmentId)
      .limit(1);

    if (childError) throw childError;

    if (children && children.length > 0) {
      const { count } = await supabase
        .from('departments')
        .select('department_id', { count: 'exact', head: true })
        .eq('parent_department_id', departmentId);

      throw new Error(
        `이 부서에는 ${count}개의 하위 부서가 있습니다. 먼저 하위 부서를 삭제하거나 다른 부서로 이동해주세요.`
      );
    }

    // 소속 사용자 확인
    const { data: members, error: memberError } = await supabase
      .from('members')
      .select('member_id')
      .eq('department_id', departmentId)
      .limit(1);

    if (memberError) throw memberError;

    if (members && members.length > 0) {
      const { count } = await supabase
        .from('members')
        .select('member_id', { count: 'exact', head: true })
        .eq('department_id', departmentId);

      throw new Error(
        `이 부서에는 ${count}명의 소속 사용자가 있습니다. 먼저 사용자를 다른 부서로 이동하거나 비활성화해주세요.`
      );
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('department_id', departmentId);

    if (error) throw error;
  },

  /**
   * 부서별 통계를 조회합니다.
   */
  async getDepartmentStats(params: {
    departmentId: number;
    startDate?: string;
    endDate?: string;
    includeSubDepartments?: boolean;
  }) {
    const {
      departmentId,
      startDate,
      endDate,
      includeSubDepartments = false,
    } = params;

    // 부서 정보 조회
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('department_id, name, path')
      .eq('department_id', departmentId)
      .single();

    if (deptError) throw deptError;

    // 대상 부서 ID 목록
    let targetDepartmentIds = [departmentId];

    if (includeSubDepartments) {
      const { data: subDepts } = await supabase
        .from('departments')
        .select('department_id')
        .like('path', `${department.path}/%`);

      if (subDepts) {
        targetDepartmentIds = [
          departmentId,
          ...subDepts.map((d) => d.department_id),
        ];
      }
    }

    // 소속 사용자 통계
    const { data: members } = await supabase
      .from('members')
      .select('member_id, is_active')
      .in('department_id', targetDepartmentIds);

    const memberCount = members?.length || 0;
    const activeMemberCount = members?.filter((m) => m.is_active).length || 0;

    // 업무 통계
    let taskQuery = supabase
      .from('tasks')
      .select('task_id, work_time, member_id')
      .in('member_id', members?.map((m) => m.member_id) || []);

    if (startDate) taskQuery = taskQuery.gte('task_date', startDate);
    if (endDate) taskQuery = taskQuery.lte('task_date', endDate);

    const { data: tasks } = await taskQuery;

    const totalTasks = tasks?.length || 0;
    const totalWorkHours =
      tasks?.reduce((sum, t) => sum + (t.work_time || 0) / 60, 0) || 0;
    const avgWorkHoursPerMember =
      activeMemberCount > 0
        ? Math.round((totalWorkHours / activeMemberCount) * 100) / 100
        : 0;

    // 하위 부서 통계 (includeSubDepartments일 때만)
    let subDepartments: any[] = [];
    if (includeSubDepartments) {
      const { data: children } = await supabase
        .from('departments')
        .select('department_id, name')
        .eq('parent_department_id', departmentId);

      if (children) {
        subDepartments = await Promise.all(
          children.map(async (child) => {
            const childStats = await this.getDepartmentStats({
              departmentId: child.department_id,
              startDate,
              endDate,
              includeSubDepartments: false,
            });

            return {
              department_id: child.department_id,
              department_name: child.name,
              member_count: childStats.member_count,
              total_tasks: childStats.task_stats.total_tasks,
              total_work_hours: childStats.task_stats.total_work_hours,
            };
          })
        );
      }
    }

    return {
      department_id: departmentId,
      department_name: department.name,
      member_count: memberCount,
      active_member_count: activeMemberCount,
      task_stats: {
        total_tasks: totalTasks,
        total_work_hours: Math.round(totalWorkHours * 10) / 10,
        avg_work_hours_per_member: avgWorkHoursPerMember,
      },
      sub_departments: subDepartments,
    };
  },
};

// 역할 관리 API
export const roleAPI = {
  /**
   * 전체 역할 목록을 조회합니다.
   */
  async getRoles(params?: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
  }) {
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
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
        writeAccess: rp.write_access,
      })),
    };
  },

  /**
   * 새로운 역할을 생성합니다.
   */
  async createRole(
    role: Database['public']['Tables']['roles']['Insert'],
    permissions?: Array<{
      permissionId: number;
      readAccess: boolean;
      writeAccess: boolean;
    }>
  ) {
    const { data, error } = await supabase
      .from('roles')
      .insert(role)
      .select()
      .single();

    if (error) throw error;

    // 권한 할당
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map((p) => ({
        role_id: data.role_id,
        permission_id: p.permissionId,
        read_access: p.readAccess,
        write_access: p.writeAccess,
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
    permissions?: Array<{
      permissionId: number;
      readAccess: boolean;
      writeAccess: boolean;
    }>
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
        const rolePermissions = permissions.map((p) => ({
          role_id: roleId,
          permission_id: p.permissionId,
          read_access: p.readAccess,
          write_access: p.writeAccess,
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
  },
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
  },
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
  },
};

// 프로젝트 관리 API
export const projectAPI = {
  /**
   * 프로젝트 목록을 조회합니다.
   */
  async getProjects(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    platform?: string;
  }) {
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
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
  async createProject(
    project: Database['public']['Tables']['projects']['Insert']
  ) {
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
  async updateProject(
    projectId: number,
    updates: Database['public']['Tables']['projects']['Update']
  ) {
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
    const { data: tasks, error: checkError } = await supabase
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
  },
};

// 서비스 관리 API
export const serviceAPI = {
  /**
   * 서비스 목록을 조회합니다.
   */
  async getServices(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    costGroupId?: number;
    isActive?: boolean;
  }) {
    const {
      page = 1,
      pageSize = 20,
      search,
      costGroupId,
      isActive,
    } = params || {};

    let query = supabase
      .from('services')
      .select(
        `
        *,
        cost_groups(name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (costGroupId) {
      query = query.eq('cost_group_id', costGroupId);
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
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
  async createService(
    service: Database['public']['Tables']['services']['Insert']
  ) {
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
  async updateService(
    serviceId: number,
    updates: Database['public']['Tables']['services']['Update']
  ) {
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
      throw new Error(
        '이 서비스를 사용하는 프로젝트가 있어 삭제할 수 없습니다.'
      );
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
  },
};

// 청구 그룹 관리 API
export const costGroupAPI = {
  /**
   * 청구 그룹 목록을 조회합니다.
   */
  async getCostGroups(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 20, search, isActive } = params || {};

    let query = supabase
      .from('cost_groups')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
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
  async createCostGroup(
    costGroup: Database['public']['Tables']['cost_groups']['Insert']
  ) {
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
  async updateCostGroup(
    costGroupId: number,
    updates: Database['public']['Tables']['cost_groups']['Update']
  ) {
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
      throw new Error(
        '이 청구 그룹을 사용하는 서비스가 있어 삭제할 수 없습니다.'
      );
    }

    const { error } = await supabase
      .from('cost_groups')
      .delete()
      .eq('cost_group_id', costGroupId);

    if (error) throw error;
  },
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
  },
};

// 공휴일 관리 API
export const holidayAPI = {
  /**
   * 공휴일 목록을 조회합니다.
   */
  async getHolidays(params?: {
    page?: number;
    pageSize?: number;
    year?: number;
  }) {
    const { page = 1, pageSize = 20, year } = params || {};

    let query = supabase
      .from('holidays')
      .select('*', { count: 'exact' })
      .order('holiday_date', { ascending: false });

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('holiday_date', startDate).lte('holiday_date', endDate);
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
        pageCount: Math.ceil((count || 0) / pageSize),
      } as PaginationResponse,
    };
  },

  /**
   * 특정 공휴일 정보를 조회합니다.
   */
  async getHoliday(holidayId: number) {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('holiday_id', holidayId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 새로운 공휴일을 생성합니다.
   */
  async createHoliday(
    holiday: Database['public']['Tables']['holidays']['Insert']
  ) {
    const { data, error } = await supabase
      .from('holidays')
      .insert(holiday)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 공휴일 정보를 수정합니다.
   */
  async updateHoliday(
    holidayId: number,
    updates: Database['public']['Tables']['holidays']['Update']
  ) {
    const { data, error } = await supabase
      .from('holidays')
      .update(updates)
      .eq('holiday_id', holidayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 공휴일을 삭제합니다.
   */
  async deleteHoliday(holidayId: number) {
    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('holiday_id', holidayId);

    if (error) throw error;
  },
};

// 초대 관리 API (Supabase Auth 사용)
export const invitationAPI = {
  /**
   * Supabase Auth의 inviteUserByEmail을 사용하여 사용자를 초대합니다.
   * Supabase가 자동으로 초대 이메일을 발송합니다.
   */
  async inviteUser(params: { email: string; role_id: number; name?: string }) {
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
        invited: true,
      },
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) throw error;
    return data;
  },
};

// 대시보드 통계 API
export const dashboardAPI = {
  /**
   * 대시보드 전체 통계를 조회합니다.
   */
  async getDashboardStats(params?: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params || {};

    // 1. 총 업무 수
    let taskCountQuery = supabase
      .from('tasks')
      .select('task_id', { count: 'exact', head: true });

    if (startDate) taskCountQuery = taskCountQuery.gte('task_date', startDate);
    if (endDate) taskCountQuery = taskCountQuery.lte('task_date', endDate);

    const { count: totalTasks } = await taskCountQuery;

    // 2. 총 작업 시간
    let taskTimeQuery = supabase.from('tasks').select('work_time');

    if (startDate) taskTimeQuery = taskTimeQuery.gte('task_date', startDate);
    if (endDate) taskTimeQuery = taskTimeQuery.lte('task_date', endDate);

    const { data: tasks } = await taskTimeQuery;

    const totalHours =
      tasks?.reduce(
        (sum, task) => sum + (task.work_time || 0) / 60, // 분을 시간으로 변환
        0
      ) || 0;

    // 3. 활성 사용자 수
    const { count: activeMembers } = await supabase
      .from('members')
      .select('member_id', { count: 'exact', head: true })
      .eq('is_active', true);

    // 4. 진행 중인 프로젝트 수
    const { count: activeProjects } = await supabase
      .from('projects')
      .select('project_id', { count: 'exact', head: true })
      .eq('is_active', true);

    return {
      totalTasks: totalTasks || 0,
      totalHours: Math.round(totalHours * 10) / 10,
      activeMembers: activeMembers || 0,
      activeProjects: activeProjects || 0,
    };
  },

  /**
   * 일별 업무 통계를 조회합니다.
   */
  async getDailyTaskStats(params?: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params || {};

    let query = supabase
      .from('tasks')
      .select('task_date, work_time')
      .order('task_date', { ascending: true });

    if (startDate) query = query.gte('task_date', startDate);
    if (endDate) query = query.lte('task_date', endDate);

    const { data, error } = await query;

    if (error) throw error;

    // 날짜별로 그룹화
    const dailyStats = (data || []).reduce((acc: any, task: any) => {
      const date = task.task_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalHours: 0,
          taskCount: 0,
        };
      }
      acc[date].totalHours += (task.work_time || 0) / 60; // 분을 시간으로 변환
      acc[date].taskCount += 1;
      return acc;
    }, {});

    return Object.values(dailyStats).map((stat: any) => ({
      date: stat.date,
      totalHours: Math.round(stat.totalHours * 10) / 10,
      taskCount: stat.taskCount,
    }));
  },

  /**
   * 프로젝트별 업무 통계를 조회합니다.
   */
  async getProjectStats(params?: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params || {};

    let query = supabase.from('tasks').select(
      `
        project_id,
        work_time,
        projects(name)
      `
    );

    if (startDate) query = query.gte('task_date', startDate);
    if (endDate) query = query.lte('task_date', endDate);

    const { data, error } = await query;

    if (error) throw error;

    // 프로젝트별로 그룹화
    const projectStats = (data || []).reduce((acc: any, task: any) => {
      const projectId = task.project_id || 0;
      const projectName = task.projects?.name || '미지정';

      if (!acc[projectId]) {
        acc[projectId] = {
          projectId,
          projectName,
          totalHours: 0,
          taskCount: 0,
        };
      }
      acc[projectId].totalHours += (task.work_time || 0) / 60; // 분을 시간으로 변환
      acc[projectId].taskCount += 1;
      return acc;
    }, {});

    return Object.values(projectStats)
      .map((stat: any) => ({
        projectId: stat.projectId,
        projectName: stat.projectName,
        totalHours: Math.round(stat.totalHours * 10) / 10,
        taskCount: stat.taskCount,
      }))
      .sort((a: any, b: any) => b.totalHours - a.totalHours);
  },

  /**
   * 사용자별 업무 통계를 조회합니다.
   */
  async getMemberStats(params?: { startDate?: string; endDate?: string }) {
    const { startDate, endDate } = params || {};

    let query = supabase.from('tasks').select(
      `
        member_id,
        work_time,
        members!inner(name, account_id)
      `
    );

    if (startDate) query = query.gte('task_date', startDate);
    if (endDate) query = query.lte('task_date', endDate);

    const { data, error } = await query;

    if (error) throw error;

    // 사용자별로 그룹화
    const memberStats = (data || []).reduce((acc: any, task: any) => {
      const memberId = task.member_id;
      const memberName = task.members?.name || '알 수 없음';

      if (!acc[memberId]) {
        acc[memberId] = {
          memberId,
          memberName,
          totalHours: 0,
          taskCount: 0,
        };
      }
      acc[memberId].totalHours += (task.work_time || 0) / 60; // 분을 시간으로 변환
      acc[memberId].taskCount += 1;
      return acc;
    }, {});

    return Object.values(memberStats)
      .map((stat: any) => ({
        memberId: stat.memberId,
        memberName: stat.memberName,
        totalHours: Math.round(stat.totalHours * 10) / 10,
        taskCount: stat.taskCount,
      }))
      .sort((a: any, b: any) => b.totalHours - a.totalHours);
  },

  /**
   * 최근 업무 목록을 조회합니다.
   */
  async getRecentTasks(limit = 10) {
    const { data, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        members!inner(name, account_id),
        projects(name),
        services(name)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * 월별 사용자별 업무 작성 현황을 조회합니다.
   * @param year - 조회할 연도
   * @param month - 조회할 월 (1-12)
   * @returns 사용자별 일별 업무 작성 현황 (480분 기준 완료 여부)
   */
  async getMonthlyMemberTaskCompletion(year: number, month: number) {
    // 해당 월의 시작일과 종료일 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 1. 활성화된 사용자 목록 조회 (업무보고 작성 대상자만)
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('member_id, name, account_id')
      .eq('is_active', true)
      .eq('requires_daily_report', true)
      .not('role_id', 'is', null)
      .order('name');

    if (membersError) throw membersError;

    // 2. 해당 월의 모든 업무 조회
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('member_id, task_date, work_time')
      .gte('task_date', startDate)
      .lte('task_date', endDate);

    if (tasksError) throw tasksError;

    // 3. 사용자별, 날짜별로 작업 시간 집계
    const memberDateStats: Record<
      number,
      Record<string, { totalMinutes: number; isComplete: boolean }>
    > = {};

    (tasks || []).forEach((task) => {
      const { member_id, task_date, work_time } = task;

      if (!memberDateStats[member_id]) {
        memberDateStats[member_id] = {};
      }

      if (!memberDateStats[member_id][task_date]) {
        memberDateStats[member_id][task_date] = {
          totalMinutes: 0,
          isComplete: false,
        };
      }

      memberDateStats[member_id][task_date].totalMinutes += work_time || 0;
      memberDateStats[member_id][task_date].isComplete =
        memberDateStats[member_id][task_date].totalMinutes >= 480; // 8시간 = 480분
    });

    // 4. 공휴일 조회
    const { data: holidays, error: holidaysError } = await supabase
      .from('holidays')
      .select('holiday_date')
      .gte('holiday_date', startDate)
      .lte('holiday_date', endDate);

    if (holidaysError) throw holidaysError;

    const holidayDates = new Set((holidays || []).map((h) => h.holiday_date));

    // 5. 결과 데이터 구성
    const result = (members || []).map((member) => {
      const dailyCompletion: Record<string, boolean | null> = {};
      const stats = {
        completedDays: 0,
        incompleteDays: 0,
        totalWorkingDays: 0,
      };

      // 해당 월의 모든 날짜에 대해 처리
      for (let day = 1; day <= lastDay; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 일요일(0) 또는 토요일(6)
        const isHoliday = holidayDates.has(date);

        // 주말이나 공휴일은 null로 표시
        if (isWeekend || isHoliday) {
          dailyCompletion[date] = null;
        } else {
          stats.totalWorkingDays++;
          const dayStats = memberDateStats[member.member_id]?.[date];
          const isComplete = dayStats?.isComplete || false;
          dailyCompletion[date] = isComplete;

          if (isComplete) {
            stats.completedDays++;
          } else {
            stats.incompleteDays++;
          }
        }
      }

      const completionRate =
        stats.totalWorkingDays > 0
          ? Math.round((stats.completedDays / stats.totalWorkingDays) * 100)
          : 0;

      return {
        memberId: member.member_id,
        memberName: member.name,
        accountId: member.account_id,
        dailyCompletion,
        stats: {
          ...stats,
          completionRate,
        },
      };
    });

    return result;
  },

  /**
   * 관리자 대시보드 통계를 조회합니다.
   */
  async getAdminDashboardStats(year: number, month: number) {
    // 1. 활성 사용자 수 (업무보고 작성 대상자만)
    const { count: totalActiveMembers } = await supabase
      .from('members')
      .select('member_id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('requires_daily_report', true)
      .not('role_id', 'is', null);

    // 2. 업무 작성 현황 조회
    const memberCompletion = await this.getMonthlyMemberTaskCompletion(
      year,
      month
    );

    // 3. 전체 완료율 계산
    const totalCompletedDays = memberCompletion.reduce(
      (sum, m) => sum + m.stats.completedDays,
      0
    );
    const totalWorkingDays = memberCompletion.reduce(
      (sum, m) => sum + m.stats.totalWorkingDays,
      0
    );
    const overallCompletionRate =
      totalWorkingDays > 0
        ? Math.round((totalCompletedDays / totalWorkingDays) * 100)
        : 0;

    // 4. 완전히 작성한 사용자 수 (100% 완료)
    const fullyCompletedMembers = memberCompletion.filter(
      (m) => m.stats.completionRate === 100
    ).length;

    return {
      totalActiveMembers: totalActiveMembers || 0,
      fullyCompletedMembers,
      totalCompletedDays,
      totalWorkingDays,
      overallCompletionRate,
      memberCompletion,
    };
  },
};
