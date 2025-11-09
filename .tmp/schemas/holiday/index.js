// 공휴일 목록 조회 스키마
export const holidayListSchema = {
  tags: ['holiday'],
  summary: '공휴일 목록 조회',
  querystring: {
    type: 'object',
    properties: {
      year: {
        type: 'number',
        default: null,
        nullable: true,
        description: '연도',
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
            properties: {
              holidayId: { type: 'number', comment: '공휴일 ID' },
              name: { type: 'string', comment: '공휴일명' },
              date: { type: 'string', comment: '날짜 (YYYY-MM-DD)' },
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

// 공휴일 등록 스키마
export const holidayCreateSchema = {
  tags: ['holiday'],
  summary: '공휴일 등록',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 255,
        description: '공휴일명',
      },
      date: {
        type: 'string',
        format: 'date',
        description: '날짜',
      },
    },
    required: ['name', 'date'],
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

// 공휴일 수정 스키마
export const holidayUpdateSchema = {
  tags: ['holiday'],
  summary: '공휴일 수정',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      holidayId: {
        type: 'number',
        description: '공휴일 Id',
      },
    },
    required: ['holidayId'],
  },
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 255,
        description: '공휴일명',
      },
      date: {
        type: 'string',
        format: 'date',
        description: '날짜',
      },
    },
    required: ['name', 'date'],
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

// 공휴일 삭제 스키마
export const holidayDeleteSchema = {
  tags: ['holiday'],
  summary: '공휴일 삭제',
  params: {
    type: 'object',
    properties: {
      holidayId: {
        type: 'number',
        description: '공휴일 Id',
      },
    },
    required: ['holidayId'],
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
