// 역할 목록 조회 스키마
export const roleListSchema = {
  tags: ['roles'],
  summary: '역할 목록 조회',
  querystring: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        default: null,
        nullable: true,
        maxLength: 100,
        description: '역할이름',
      },
      page: {
        $ref: 'paginationQuery#/properties/page',
      },
      pageSize: {
        $ref: 'paginationQuery#/properties/pageSize',
      },
    },
  },
  response: {
    200: {
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
              roleId: { type: 'number', comment: '역할 ID' },
              name: { type: 'string', comment: '역할 이름' },
              createdId: { $ref: 'commonItem#/properties/createdId' },
              createdAt: { $ref: 'commonItem#/properties/createdAt' },
              updatedId: { $ref: 'commonItem#/properties/updatedId' },
              updatedAt: { $ref: 'commonItem#/properties/updatedAt' },
            },
          },
        },
      },
    },
    400: {
      $ref: 'commonError#',
    },
    403: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', comment: '상태코드' },
        error: { type: 'string', comment: '에러 타입' },
        message: { type: 'string', comment: '메시지' },
      },
    },
  },
};

// 역할 등록 스키마
export const roleCreateSchema = {
  tags: ['roles'],
  summary: '역할 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
        description: '역할이름',
      },
    },
    required: ['name'],
  },
  response: {
    200: {
      $ref: 'commonCreatedSuccess#',
    },
    400: {
      $ref: 'commonCreatedError#',
    },
    403: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', comment: '상태코드' },
        error: { type: 'string', comment: '에러 타입' },
        message: { type: 'string', comment: '메시지' },
      },
    },
  },
};

// 역할 수정 스키마
export const roleUpdateSchema = {
  tags: ['roles'],
  summary: '역할 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      roleId: {
        type: 'number',
        description: '역할 Id',
      },
    },
    required: ['roleId'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
        description: '역할이름',
      },
    },
    required: ['name'],
  },
  response: {
    200: {
      $ref: 'commonUpdatedSuccess#',
    },
    400: {
      $ref: 'commonUpdatedError#',
    },
    403: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', comment: '상태코드' },
        error: { type: 'string', comment: '에러 타입' },
        message: { type: 'string', comment: '메시지' },
      },
    },
  },
};

// 역할 삭제 스키마
export const roleDeleteSchema = {
  tags: ['roles'],
  summary: '역할 삭제',
  params: {
    type: 'object',
    properties: {
      roleId: {
        type: 'number',
        description: '역할 Id',
      },
    },
    required: ['roleId'],
  },
  response: {
    200: {
      $ref: 'commonDeletedSuccess#',
    },
    400: {
      $ref: 'commonDeletedError#',
    },
    403: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', comment: '상태코드' },
        error: { type: 'string', comment: '에러 타입' },
        message: { type: 'string', comment: '메시지' },
      },
    },
  },
};
