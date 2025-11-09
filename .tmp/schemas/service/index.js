// 서비스 쿼리 스키마 정의
export const serviceListQuerySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      default: null,
      nullable: true,
      maxLength: 100,
      description: '서비스명',
    },
    costGrpId: {
      type: 'number',
      default: null,
      nullable: true,
      description: '청구그룹 Id',
    },
    page: {
      $ref: 'paginationQuery#/properties/page',
    },
    pageSize: {
      $ref: 'paginationQuery#/properties/pageSize',
    },
  },
};

// 서비스 응답 스키마 정의
export const serviceListResponseSchema = {
  type: 'object',
  properties: {
    total: { $ref: 'paginationResponse#/properties/total' },
    page: { $ref: 'paginationResponse#/properties/page' },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        nullable: true,
        properties: {
          serviceId: { type: 'number', description: '서비스 ID' },
          costGrpId: { type: 'number', description: '청구그룹 ID' },
          costGrpName: { type: 'string', description: '청구그룹명' },
          name: { type: 'string', description: '서비스명' },
          comment: { type: 'string', description: '설명' },
          isActive: { type: 'boolean', description: '활성유무' },
          createdId: { type: 'string', description: '생성자 ID' },
          createdAt: { type: 'string', format: 'date-time', description: '생성일시' },
          updatedId: { type: 'string', nullable: true, description: '수정자 ID' },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: '수정일시',
          },
        },
      },
    },
  },
};

// 서비스 상세 응답 스키마 정의
export const serviceDetailResponseSchema = {
  type: 'object',
  properties: {
    serviceId: { type: 'number', description: '서비스 ID' },
    costGrpId: { type: 'number', description: '청구그룹 ID' },
    costGrpName: { type: 'string', description: '청구그룹명' },
    name: { type: 'string', description: '서비스명' },
    comment: { type: 'string', description: '설명' },
    isActive: { type: 'boolean', description: '활성유무' },
    createdId: { type: 'string', description: '생성자 ID' },
    createdAt: { type: 'string', format: 'date-time', description: '생성일시' },
    updatedId: { type: 'string', nullable: true, description: '수정자 ID' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true, description: '수정일시' },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          projectId: { type: 'number', description: '프로젝트 ID' },
          name: { type: 'string', description: '프로젝트명' },
        },
      },
    },
  },
};

// 서비스 생성 요청 스키마 정의
export const serviceCreateRequestSchema = {
  type: 'object',
  properties: {
    costGrpId: {
      type: 'number',
      description: '청구그룹 Id',
    },
    name: {
      type: 'string',
      maxLength: 255,
      description: '서비스명',
    },
    comment: {
      type: 'string',
      description: '설명',
    },
    isActive: {
      type: 'boolean',
      description: '활성유무',
    },
  },
  required: ['costGrpId', 'name', 'isActive'],
};

// 서비스 수정 요청 스키마 정의
export const serviceUpdateRequestSchema = {
  type: 'object',
  properties: {
    costGrpId: {
      type: 'number',
      description: '청구그룹 Id',
    },
    name: {
      type: 'string',
      maxLength: 255,
      description: '서비스명',
    },
    comment: {
      type: 'string',
      description: '설명',
    },
    isActive: {
      type: 'boolean',
      description: '활성유무',
    },
  },
  required: ['costGrpId', 'name', 'isActive'],
};

// 스키마 등록 함수
export function registerServiceSchemas(fastify) {
  // 서비스 목록 쿼리 스키마 등록
  fastify.addSchema({
    $id: 'serviceListQuery',
    ...serviceListQuerySchema,
  });

  // 서비스 목록 응답 스키마 등록
  fastify.addSchema({
    $id: 'serviceListResponse',
    ...serviceListResponseSchema,
  });

  // 서비스 상세 응답 스키마 등록
  fastify.addSchema({
    $id: 'serviceDetailResponse',
    ...serviceDetailResponseSchema,
  });

  // 서비스 생성 요청 스키마 등록
  fastify.addSchema({
    $id: 'serviceCreateRequest',
    ...serviceCreateRequestSchema,
  });

  // 서비스 수정 요청 스키마 등록
  fastify.addSchema({
    $id: 'serviceUpdateRequest',
    ...serviceUpdateRequestSchema,
  });

  fastify.log.info('서비스 스키마 등록 완료');
}

// 서비스 목록 조회 스키마
export const serviceListSchema = {
  tags: ['service'],
  summary: '서비스 목록 조회',
  querystring: {
    $ref: 'serviceListQuery#',
  },
  response: {
    200: {
      $ref: 'serviceListResponse#',
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 서비스 등록 스키마
export const serviceCreateSchema = {
  tags: ['service'],
  summary: '서비스 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    $ref: 'serviceCreateRequest#',
  },
  response: {
    200: {
      $ref: 'commonCreatedSuccess#',
    },
    400: {
      $ref: 'commonCreatedError#',
    },
  },
};

// 서비스 상세 조회 스키마
export const serviceDetailSchema = {
  tags: ['service'],
  summary: '서비스 상세 조회',
  params: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'number',
        description: '서비스 ID',
      },
    },
    required: ['serviceId'],
  },
  response: {
    200: {
      $ref: 'serviceDetailResponse#',
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 서비스 수정 스키마
export const serviceUpdateSchema = {
  tags: ['service'],
  summary: '서비스 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'number',
        description: '서비스 Id',
      },
    },
    required: ['serviceId'],
  },
  body: {
    $ref: 'serviceUpdateRequest#',
  },
  response: {
    200: {
      $ref: 'commonUpdatedSuccess#',
    },
    400: {
      $ref: 'commonUpdatedError#',
    },
  },
};

// 서비스 삭제 스키마
export const serviceDeleteSchema = {
  tags: ['service'],
  summary: '서비스 삭제',
  params: {
    type: 'object',
    properties: {
      serviceId: {
        type: 'number',
        description: '서비스 Id',
      },
    },
    required: ['serviceId'],
  },
  response: {
    200: {
      $ref: 'commonDeletedSuccess#',
    },
    400: {
      $ref: 'commonDeletedError#',
    },
  },
};
