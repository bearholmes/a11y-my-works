// 프로젝트 쿼리 스키마 정의
export const projectListQuerySchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      default: null,
      nullable: true,
      maxLength: 100,
      description: '프로젝트명',
    },
    serviceId: {
      type: 'number',
      default: null,
      nullable: true,
      description: '서비스 Id',
    },
    page: {
      $ref: 'paginationQuery#/properties/page',
    },
    pageSize: {
      $ref: 'paginationQuery#/properties/pageSize',
    },
  },
};

// 프로젝트 응답 스키마 정의
export const projectListResponseSchema = {
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
          projectId: { type: 'number', description: '프로젝트 ID' },
          serviceId: { type: 'number', description: '서비스 ID' },
          serviceName: { type: 'string', description: '서비스명' },
          costGrpName: { type: 'string', description: '청구그룹명' },
          name: { type: 'string', description: '프로젝트명' },
          platformName: { type: 'string', description: '플랫폼' },
          version: { type: 'string', description: '버전' },
          type: { type: 'string', description: '업무타입' },
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

// 프로젝트 상세 응답 스키마 정의
export const projectDetailResponseSchema = {
  type: 'object',
  properties: {
    projectId: { type: 'number', description: '프로젝트 ID' },
    serviceId: { type: 'number', description: '서비스 ID' },
    serviceName: { type: 'string', description: '서비스명' },
    costGrpName: { type: 'string', description: '청구그룹명' },
    name: { type: 'string', description: '프로젝트명' },
    platformName: { type: 'string', description: '플랫폼' },
    version: { type: 'string', description: '버전' },
    type: { type: 'string', description: '업무타입' },
    comment: { type: 'string', description: '설명' },
    isActive: { type: 'boolean', description: '활성유무' },
    createdId: { type: 'string', description: '생성자 ID' },
    createdAt: { type: 'string', format: 'date-time', description: '생성일시' },
    updatedId: { type: 'string', nullable: true, description: '수정자 ID' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true, description: '수정일시' },
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          linkId: { type: 'number', description: '링크 ID' },
          name: { type: 'string', description: '링크명' },
          url: { type: 'string', description: 'URL' },
        },
      },
    },
  },
};

// 프로젝트 생성 요청 스키마 정의
export const projectCreateRequestSchema = {
  type: 'object',
  properties: {
    serviceId: {
      type: 'number',
      description: '서비스 Id',
    },
    name: {
      type: 'string',
      maxLength: 255,
      description: '프로젝트명',
    },
    platformName: {
      type: 'string',
      maxLength: 100,
      description: '플랫폼',
    },
    version: {
      type: 'string',
      maxLength: 50,
      description: '버전',
    },
    type: {
      type: 'string',
      maxLength: 50,
      description: '업무타입',
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
  required: ['serviceId', 'name', 'platformName', 'isActive'],
};

// 프로젝트 수정 요청 스키마 정의
export const projectUpdateRequestSchema = {
  type: 'object',
  properties: {
    serviceId: {
      type: 'number',
      description: '서비스 Id',
    },
    name: {
      type: 'string',
      maxLength: 255,
      description: '프로젝트명',
    },
    platformName: {
      type: 'string',
      maxLength: 100,
      description: '플랫폼',
    },
    version: {
      type: 'string',
      maxLength: 50,
      description: '버전',
    },
    type: {
      type: 'string',
      maxLength: 50,
      description: '업무타입',
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
  required: ['serviceId', 'name', 'platformName', 'isActive'],
};

// 스키마 등록 함수
export function registerProjectSchemas(fastify) {
  // 프로젝트 목록 쿼리 스키마 등록
  fastify.addSchema({
    $id: 'projectListQuery',
    ...projectListQuerySchema,
  });

  // 프로젝트 목록 응답 스키마 등록
  fastify.addSchema({
    $id: 'projectListResponse',
    ...projectListResponseSchema,
  });

  // 프로젝트 상세 응답 스키마 등록
  fastify.addSchema({
    $id: 'projectDetailResponse',
    ...projectDetailResponseSchema,
  });

  // 프로젝트 생성 요청 스키마 등록
  fastify.addSchema({
    $id: 'projectCreateRequest',
    ...projectCreateRequestSchema,
  });

  // 프로젝트 수정 요청 스키마 등록
  fastify.addSchema({
    $id: 'projectUpdateRequest',
    ...projectUpdateRequestSchema,
  });

  fastify.log.info('프로젝트 스키마 등록 완료');
}

// 프로젝트 목록 조회 스키마
export const projectListSchema = {
  tags: ['project'],
  summary: '프로젝트 목록 조회',
  querystring: {
    $ref: 'projectListQuery#',
  },
  response: {
    200: {
      $ref: 'projectListResponse#',
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 프로젝트 등록 스키마
export const projectCreateSchema = {
  tags: ['project'],
  summary: '프로젝트 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    $ref: 'projectCreateRequest#',
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

// 프로젝트 상세 조회 스키마
export const projectDetailSchema = {
  tags: ['project'],
  summary: '프로젝트 상세 조회',
  params: {
    type: 'object',
    properties: {
      projectId: {
        type: 'number',
        description: '프로젝트 Id',
      },
    },
    required: ['projectId'],
  },
  response: {
    200: {
      $ref: 'projectDetailResponse#',
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

// 프로젝트 수정 스키마
export const projectUpdateSchema = {
  tags: ['project'],
  summary: '프로젝트 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      projectId: {
        type: 'number',
        description: '프로젝트 Id',
      },
    },
    required: ['projectId'],
  },
  body: {
    $ref: 'projectUpdateRequest#',
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

// 프로젝트 삭제 스키마
export const projectDeleteSchema = {
  tags: ['project'],
  summary: '프로젝트 삭제',
  params: {
    type: 'object',
    properties: {
      projectId: {
        type: 'number',
        description: '프로젝트 Id',
      },
    },
    required: ['projectId'],
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

// 프로젝트 링크 등록 스키마
export const projectLinkCreateSchema = {
  tags: ['project'],
  summary: '프로젝트 링크 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      projectId: {
        type: 'number',
        description: '프로젝트 Id',
      },
      name: {
        type: 'string',
        maxLength: 100,
        description: '이름',
      },
      url: {
        type: 'string',
        description: 'URL 주소',
        format: 'uri',
      },
    },
    required: ['projectId', 'name', 'url'],
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

// 프로젝트 링크 수정 스키마
export const projectLinkUpdateSchema = {
  tags: ['project'],
  summary: '프로젝트 링크 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      projectLinkId: {
        type: 'number',
        description: '프로젝트 링크 Id',
      },
    },
    required: ['projectLinkId'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
        description: '이름',
      },
      url: {
        type: 'string',
        description: 'URL 주소',
        format: 'uri',
      },
    },
    required: ['name', 'url'],
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

// 프로젝트 링크 삭제 스키마
export const projectLinkDeleteSchema = {
  tags: ['project'],
  summary: '프로젝트 링크 삭제',
  params: {
    type: 'object',
    properties: {
      projectLinkId: {
        type: 'number',
        description: '프로젝트 링크 Id',
      },
    },
    required: ['projectLinkId'],
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
