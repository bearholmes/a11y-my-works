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

  async createMemberProfile(authId: string, profile: Partial<Member>) {
    const { data, error } = await supabase
      .from('members')
      .insert({
        auth_id: authId,
        account_id: profile.account_id || '',
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile,
        role_id: profile.role_id || 3, // 기본값: 직원
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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