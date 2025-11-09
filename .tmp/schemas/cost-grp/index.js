// 청구그룹 목록 조회 스키마
export const costGrpListSchema = {
  tags: ['costGroup'],
  summary: '청구그룹 목록 조회',
  querystring: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        default: null,
        nullable: true,
        maxLength: 100,
        description: '청구그룹명',
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
              costGrpId: { type: 'number', comment: '청구그룹 Id' },
              name: { type: 'string', comment: '청구그룹명' },
              comment: { type: 'string', comment: '설명' },
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

// 청구그룹 등록 스키마
export const costGrpCreateSchema = {
  tags: ['costGroup'],
  summary: '청구그룹 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 255,
        description: '청구그룹명',
      },
      comment: {
        type: 'string',
        description: '설명',
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
  },
};

// 청구그룹 수정 스키마
export const costGrpUpdateSchema = {
  tags: ['costGroup'],
  summary: '청구그룹 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      costGrpId: {
        type: 'number',
        description: '청구그룹 Id',
      },
    },
    required: ['costGrpId'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 255,
        description: '청구그룹명',
      },
      comment: {
        type: 'string',
        description: '설명',
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
  },
};

// 청구그룹 삭제 스키마
export const costGrpDeleteSchema = {
  tags: ['costGroup'],
  summary: '청구그룹 삭제',
  params: {
    type: 'object',
    properties: {
      costGrpId: {
        type: 'number',
        description: '청구그룹 Id',
      },
    },
    required: ['costGrpId'],
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
