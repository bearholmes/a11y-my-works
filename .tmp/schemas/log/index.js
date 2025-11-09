// 로그 조회 스키마
export const logListSchema = {
  tags: ['log'],
  summary: '로그 조회',
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
      fromDate: {
        type: 'string',
        default: null,
        nullable: true,
        description: '검색 시작일',
      },
      toDate: {
        type: 'string',
        default: null,
        nullable: true,
        description: '검색 종료일',
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
              logId: { type: 'number', comment: '로그 Id' },
              type: { type: 'string', comment: '로그타입' },
              comment: { type: 'string', comment: '설명' },
              status: { type: 'string', comment: '상태' },
              member: {
                type: 'object',
                nullable: true,
                properties: {
                  memberId: { type: 'number', comment: '맴버 Id' },
                  accountId: { type: 'string', comment: 'ID' },
                  name: { type: 'string', comment: '유저 이름' },
                  isActive: { type: 'boolean', comment: '활성유무' },
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
