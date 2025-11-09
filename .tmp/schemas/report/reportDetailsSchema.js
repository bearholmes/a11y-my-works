// 보고서 목록 스키마
export const reportListSchema = {
  tags: ['report'],
  summary: '보고서 목록 조회',
  query: {
    type: 'object',
    properties: {
      page: { type: 'integer', description: '페이지 번호', default: 1 },
      limit: { type: 'integer', description: '페이지당 항목 수', default: 10 },
      type: { type: 'string', description: '보고서 타입(DAILY, WEEKLY, MONTHLY, PROJECT)' },
      status: { type: 'string', description: '상태(DRAFT, SUBMITTED, APPROVED, REJECTED)' },
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
      serviceId: { type: 'integer', description: '서비스 ID' },
      projectId: { type: 'integer', description: '프로젝트 ID' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reportId: { type: 'integer', description: '보고서 ID' },
              title: { type: 'string', description: '보고서 제목' },
              type: { type: 'string', description: '보고서 타입' },
              status: { type: 'string', description: '상태' },
              startDate: { type: 'string', format: 'date-time', description: '시작일' },
              endDate: { type: 'string', format: 'date-time', description: '종료일' },
              memberName: { type: 'string', description: '작성자 이름' },
              serviceName: { type: 'string', description: '서비스 이름' },
              projectName: { type: 'string', description: '프로젝트 이름' },
              createdAt: { type: 'string', format: 'date-time', description: '생성일' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'integer', description: '전체 항목 수' },
            currentPage: { type: 'integer', description: '현재 페이지' },
            pageSize: { type: 'integer', description: '페이지 크기' },
            totalPages: { type: 'integer', description: '전체 페이지 수' },
          },
        },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 보고서 상세 조회 스키마
export const reportDetailSchema = {
  tags: ['report'],
  summary: '보고서 상세 조회',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '보고서 ID' },
    },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        reportId: { type: 'integer', description: '보고서 ID' },
        title: { type: 'string', description: '보고서 제목' },
        type: { type: 'string', description: '보고서 타입' },
        content: { type: 'string', description: '보고서 내용' },
        status: { type: 'string', description: '상태' },
        startDate: { type: 'string', format: 'date-time', description: '시작일' },
        endDate: { type: 'string', format: 'date-time', description: '종료일' },
        memberId: { type: 'integer', description: '작성자 ID' },
        memberName: { type: 'string', description: '작성자 이름' },
        serviceId: { type: 'integer', description: '서비스 ID' },
        serviceName: { type: 'string', description: '서비스 이름' },
        projectId: { type: 'integer', description: '프로젝트 ID' },
        projectName: { type: 'string', description: '프로젝트 이름' },
        createdAt: { type: 'string', format: 'date-time', description: '생성일' },
        updatedAt: { type: 'string', format: 'date-time', description: '수정일' },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 보고서 생성 스키마
export const reportCreateSchema = {
  tags: ['report'],
  summary: '보고서 생성',
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', maxLength: 255, description: '보고서 제목' },
      type: {
        type: 'string',
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'PROJECT'],
        description: '보고서 타입',
      },
      content: { type: 'string', description: '보고서 내용' },
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
      serviceId: { type: 'integer', description: '서비스 ID' },
      projectId: { type: 'integer', description: '프로젝트 ID' },
      status: { type: 'string', enum: ['DRAFT', 'SUBMITTED'], description: '상태' },
    },
    required: ['title', 'type', 'startDate', 'endDate'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: '성공 여부' },
        message: { type: 'string', description: '메시지' },
        reportId: { type: 'integer', description: '생성된 보고서 ID' },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 보고서 수정 스키마
export const reportUpdateSchema = {
  tags: ['report'],
  summary: '보고서 수정',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '보고서 ID' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', maxLength: 255, description: '보고서 제목' },
      content: { type: 'string', description: '보고서 내용' },
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
      serviceId: { type: 'integer', description: '서비스 ID' },
      projectId: { type: 'integer', description: '프로젝트 ID' },
      status: {
        type: 'string',
        enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
        description: '상태',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: '성공 여부' },
        message: { type: 'string', description: '메시지' },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 보고서 삭제 스키마
export const reportDeleteSchema = {
  tags: ['report'],
  summary: '보고서 삭제',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '보고서 ID' },
    },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: '성공 여부' },
        message: { type: 'string', description: '메시지' },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 보고서 상태 변경 스키마
export const reportStatusSchema = {
  tags: ['report'],
  summary: '보고서 상태 변경',
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer', description: '보고서 ID' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
        description: '변경할 상태',
      },
      comment: { type: 'string', description: '상태 변경 코멘트' },
    },
    required: ['status'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: '성공 여부' },
        message: { type: 'string', description: '메시지' },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 요약 통계 스키마
export const reportStatsSchema = {
  tags: ['report'],
  summary: '보고서 통계',
  query: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date', description: '시작일' },
      endDate: { type: 'string', format: 'date', description: '종료일' },
      type: { type: 'string', description: '보고서 타입' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        totalCount: { type: 'integer', description: '전체 보고서 수' },
        byStatus: {
          type: 'object',
          properties: {
            DRAFT: { type: 'integer', description: '초안 상태 수' },
            SUBMITTED: { type: 'integer', description: '제출 상태 수' },
            APPROVED: { type: 'integer', description: '승인 상태 수' },
            REJECTED: { type: 'integer', description: '거부 상태 수' },
          },
        },
        byType: {
          type: 'object',
          properties: {
            DAILY: { type: 'integer', description: '일일 보고서 수' },
            WEEKLY: { type: 'integer', description: '주간 보고서 수' },
            MONTHLY: { type: 'integer', description: '월간 보고서 수' },
            PROJECT: { type: 'integer', description: '프로젝트 보고서 수' },
          },
        },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};
