// 로그인 유저 정보 조회 스키마
export const loginMemberInfoSchema = {
  tags: ['common'],
  summary: '로그인 유저 정보 조회',
  response: {
    200: {
      type: 'object',
      properties: {
        accountId: { type: 'string', comment: '유저 ID' },
        name: { type: 'string', comment: '유저 이름' },
        deptName: { type: 'string', comment: '부서명' },
        roles: {
          type: 'object',
          nullable: true,
          properties: {
            roleId: { type: 'number', comment: '역할 KEY' },
            roleName: { type: 'string', comment: '역할 이름' },
          },
        },
        permissions: {
          type: 'array',
          nullable: true,
          items: {
            type: 'object',
            properties: {
              permissionId: { type: 'number', comment: '권한 KEY' },
              permissionName: { type: 'string', comment: '권한 이름' },
              write: { type: 'boolean', comment: '쓰기' },
              read: { type: 'boolean', comment: '읽기' },
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

// 사용자 유저 정보 조회 스키마
export const memberInfoSchema = {
  tags: ['common'],
  summary: '사용자 유저 정보 조회',
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
      type: 'object',
      properties: {
        accountId: { type: 'string', comment: '유저 ID' },
        name: { type: 'string', comment: '유저 이름' },
        deptName: { type: 'string', comment: '부서명' },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};
