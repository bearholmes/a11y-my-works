// 유저 목록 조회 스키마
export const memberListSchema = {
  tags: ['member'],
  summary: '유저 목록 조회 (관리)',
  querystring: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        default: null,
        nullable: true,
        maxLength: 100,
        description: '키워드',
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
              memberId: { type: 'number', comment: '유저 KEY' },
              accountId: { type: 'string', comment: '유저 ID' },
              name: { type: 'string', comment: '유저 이름' },
              isActive: { type: 'boolean', comment: '활성유무' },
              deptPath: { type: 'string', comment: '부서 경로' },
              roles: {
                type: 'object',
                nullable: true,
                properties: {
                  roleId: { type: 'number', comment: '역할 KEY' },
                  roleName: { type: 'string', comment: '역할 이름' },
                },
              },
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
  },
};

// 유저 등록 스키마
export const memberCreateSchema = {
  tags: ['member'],
  summary: '유저 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        maxLength: 100,
        description: '유저 ID',
      },
      name: {
        type: 'string',
        maxLength: 100,
        description: '유저 이름',
      },
      deptPath: {
        type: 'string',
        description: '부서 경로',
      },
      isActive: {
        type: 'boolean',
        default: false,
        description: '활성유무',
      },
      roleId: {
        type: 'number',
        description: '역할 KEY',
      },
    },
    required: ['accountId', 'name', 'isActive', 'roleId'],
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

// 유저 수정 스키마
export const memberUpdateSchema = {
  tags: ['member'],
  summary: '유저 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      memberId: {
        type: 'number',
        description: '유저 Id',
      },
    },
    required: ['memberId'],
  },
  body: {
    type: 'object',
    properties: {
      deptPath: {
        type: 'string',
        description: '부서 경로',
      },
      isActive: {
        type: 'boolean',
        description: '활성유무',
      },
      roleId: {
        type: 'number',
        description: '역할 KEY',
      },
    },
    required: ['roleId', 'isActive'],
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

// 유저 삭제 스키마
export const memberDeleteSchema = {
  tags: ['member'],
  summary: '유저 삭제',
  params: {
    type: 'object',
    properties: {
      memberId: {
        type: 'number',
        description: '유저 Id',
      },
    },
    required: ['memberId'],
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

// 유저 비밀번호 변경(관리자) 스키마
export const memberPasswordAdminSchema = {
  tags: ['member'],
  summary: '비밀번호 변경(관리)',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      memberId: {
        type: 'number',
        description: '유저 Id',
      },
    },
    required: ['memberId'],
  },
  body: {
    type: 'object',
    properties: {
      newPassword: {
        type: 'string',
        maxLength: 128,
        description: '새로운 비밀번호',
      },
    },
    required: ['newPassword'],
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

// 유저 비밀번호 변경(본인) 스키마
export const memberPasswordSelfSchema = {
  tags: ['member'],
  summary: '비밀번호 변경 (본인)',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      oldPassword: {
        type: 'string',
        maxLength: 128,
        description: '기존 비밀번호',
      },
      newPassword: {
        type: 'string',
        maxLength: 128,
        description: '새로운 비밀번호',
      },
    },
    required: ['newPassword'],
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
