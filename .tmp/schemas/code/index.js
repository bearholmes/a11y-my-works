// 코드 목록 조회 스키마
export const codeListSchema = {
  tags: ['code'],
  summary: '공통코드 목록 조회',
  querystring: {
    type: 'object',
    properties: {
      group: {
        type: 'string',
        default: null,
        nullable: true,
        description: '그룹 CODE',
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
              codeId: { type: 'number', comment: '코드 ID' },
              group: { type: 'string', comment: '그룹 CODE' },
              label: { type: 'string', comment: '코드 label' },
              key: { type: 'string', comment: '코드 ' },
              comment: { type: 'string', comment: '설명' },
              isActive: { type: 'boolean', comment: '활성유무' },
              createdId: { type: 'string', comment: '생성자 ID' },
              createdAt: { type: 'string', format: 'date-time', comment: '생성일시' },
              updatedId: { type: 'string', nullable: true, comment: '수정자 ID' },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                comment: '수정일시',
              },
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

// 코드 생성 스키마
export const codeCreateSchema = {
  tags: ['code'],
  summary: '공통코드 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      group: {
        type: 'string',
        maxLength: 100,
        description: '그룹 CODE',
      },
      label: {
        type: 'string',
        maxLength: 100,
        description: '코드 label',
      },
      key: {
        type: 'string',
        maxLength: 100,
        description: '코드 value',
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
    required: ['group', 'label', 'key', 'isActive'],
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

// 코드 수정 스키마
export const codeUpdateSchema = {
  tags: ['code'],
  summary: '공통코드 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      codeId: {
        type: 'number',
        description: '코드 Id',
      },
    },
    required: ['codeId'],
  },
  body: {
    type: 'object',
    properties: {
      group: {
        type: 'string',
        maxLength: 100,
        description: '그룹 CODE',
      },
      label: {
        type: 'string',
        maxLength: 100,
        description: '코드 label',
      },
      key: {
        type: 'string',
        maxLength: 100,
        description: '코드 value',
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
    required: ['group', 'label', 'key', 'isActive'],
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

// 코드 삭제 스키마
export const codeDeleteSchema = {
  tags: ['code'],
  summary: '공통코드 삭제',
  params: {
    type: 'object',
    properties: {
      codeId: {
        type: 'number',
        description: '코드 Id',
      },
    },
    required: ['codeId'],
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
