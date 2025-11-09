/**
 * 보고서 통계 관련 API 스키마 정의
 */

// 공통 응답 스키마 정의
const reportStatsResponseSchema = {
  200: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: { type: 'object' },
    },
  },
  400: {
    type: 'object',
    properties: {
      success: { type: 'boolean', default: false },
      error: { type: 'string' },
    },
  },
};

// 보고서 통계 계산 스키마
export const reportStatsCalcSchema = {
  description: '보고서의 MD/MM 통계 계산 및 업데이트',
  tags: ['report', 'stats'],
  summary: '보고서 통계 계산',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number', description: '보고서 ID' },
    },
  },
  response: reportStatsResponseSchema,
};

// 보고서 통계 요약 조회 스키마
export const reportStatsSummarySchema = {
  description: '보고서의 MD/MM 통계 요약 조회',
  tags: ['report', 'stats'],
  summary: '보고서 통계 요약',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'number', description: '보고서 ID' },
    },
  },
  response: reportStatsResponseSchema,
};

// 통합 MM/MD 통계 조회 스키마
export const aggregatedStatsSchema = {
  description: '통합 MM/MD 통계 조회',
  tags: ['report', 'stats'],
  summary: '통합 통계 조회',
  querystring: {
    type: 'object',
    required: ['startDate', 'endDate'],
    properties: {
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
      projectId: { type: 'number', description: '프로젝트 ID (선택적)' },
      serviceId: { type: 'number', description: '서비스 ID (선택적)' },
      memberId: { type: 'number', description: '멤버 ID (선택적)' },
    },
  },
  response: reportStatsResponseSchema,
};

// 프로젝트별 MM/MD 통계 조회 스키마
export const projectStatsSchema = {
  description: '프로젝트별 MM/MD 통계 조회',
  tags: ['report', 'stats'],
  summary: '프로젝트별 통계 조회',
  params: {
    type: 'object',
    required: ['projectId'],
    properties: {
      projectId: { type: 'number', description: '프로젝트 ID' },
    },
  },
  querystring: {
    type: 'object',
    required: ['startDate', 'endDate'],
    properties: {
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
    },
  },
  response: reportStatsResponseSchema,
};

// 서비스별 MM/MD 통계 조회 스키마
export const serviceStatsSchema = {
  description: '서비스별 MM/MD 통계 조회',
  tags: ['report', 'stats'],
  summary: '서비스별 통계 조회',
  params: {
    type: 'object',
    required: ['serviceId'],
    properties: {
      serviceId: { type: 'number', description: '서비스 ID' },
    },
  },
  querystring: {
    type: 'object',
    required: ['startDate', 'endDate'],
    properties: {
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
    },
  },
  response: reportStatsResponseSchema,
};

// 멤버별 MM/MD 통계 조회 스키마
export const memberStatsSchema = {
  description: '멤버별 MM/MD 통계 조회',
  tags: ['report', 'stats'],
  summary: '멤버별 통계 조회',
  params: {
    type: 'object',
    required: ['memberId'],
    properties: {
      memberId: { type: 'number', description: '멤버 ID' },
    },
  },
  querystring: {
    type: 'object',
    required: ['startDate', 'endDate'],
    properties: {
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
    },
  },
  response: reportStatsResponseSchema,
};
