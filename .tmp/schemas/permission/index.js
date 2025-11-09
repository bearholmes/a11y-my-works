const HTTP_FORBIDDEN = 403;

// 권한 목록 조회 스키마
export const permissionListSchema = {
  tags: ['permission'],
  summary: '권한 목록 조회',
  querystring: {
    type: 'object',
    properties: {
      roleId: {
        type: 'number',
        default: null,
        nullable: true,
        description: '역할 KEY',
      },
      write: {
        type: 'boolean',
        default: null,
        nullable: true,
        description: '쓰기',
      },
      read: {
        type: 'boolean',
        default: null,
        nullable: true,
        description: '읽기',
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
              roleId: { type: 'number', comment: '역할 KEY' },
              permissionId: { type: 'number', comment: '권한 ID' },
              name: { type: 'string', comment: '권한 이름' },
              write: { type: 'boolean', comment: '쓰기' },
              read: { type: 'boolean', comment: '읽기' },
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
    [HTTP_FORBIDDEN]: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', comment: '상태코드' },
        error: { type: 'string', comment: '에러 타입' },
        message: { type: 'string', comment: '메시지' },
      },
    },
  },
};

// 권한 수정 스키마
export const permissionUpdateSchema = {
  tags: ['permission'],
  summary: '권한 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      permissionId: {
        type: 'number',
        description: '권한 Id',
      },
    },
    required: ['permissionId'],
  },
  body: {
    type: 'object',
    properties: {
      write: {
        type: 'boolean',
        description: '쓰기',
      },
      read: {
        type: 'boolean',
        description: '읽기',
      },
    },
    required: ['write', 'read'],
  },
  response: {
    200: {
      $ref: 'commonUpdatedSuccess#',
    },
    400: {
      $ref: 'commonUpdatedError#',
    },
    [HTTP_FORBIDDEN]: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', comment: '상태코드' },
        error: { type: 'string', comment: '에러 타입' },
        message: { type: 'string', comment: '메시지' },
      },
    },
  },
};
