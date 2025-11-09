/**
 * 공통 스키마 정의
 *
 * 이 파일은 여러 API에서 재사용되는 공통 응답 스키마를 정의합니다.
 * 각 스키마는 fastify.addSchema()를 통해 등록되며,
 * 라우트 스키마에서 $ref를 통해 참조할 수 있습니다.
 */

// 공통 HTTP 응답 코드
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_INTERNAL_ERROR = 500;

/**
 * 공통 스키마 정의 등록 함수
 *
 * @param {Object} fastify - Fastify 인스턴스
 */
export default function registerCommonSchemas(fastify) {
  /**
   * 공통 오류 응답 스키마
   * 클라이언트 요청 오류에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonError',
    type: 'object',
    description: '일반적인 오류 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 400,
      },
      error: {
        type: 'string',
        description: '오류 유형',
        example: 'Bad Request',
      },
      message: {
        type: 'string',
        description: '오류 메시지',
        example: '요청을 처리할 수 없습니다.',
      },
    },
  });

  /**
   * 생성 성공 응답 스키마
   * 리소스 생성 성공에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonCreatedSuccess',
    type: 'object',
    description: '리소스 생성 성공 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 201,
      },
      message: {
        type: 'string',
        description: '성공 메시지',
        example: '정상적으로 등록되었습니다.',
      },
      data: {
        type: 'object',
        description: '생성된 리소스 데이터',
        nullable: true,
        additionalProperties: true,
        example: {
          id: '1001',
          createdAt: '2025-03-27T12:34:56Z',
        },
      },
    },
  });

  /**
   * 생성 실패 응답 스키마
   * 리소스 생성 실패에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonCreatedError',
    type: 'object',
    description: '리소스 생성 실패 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 400,
      },
      error: {
        type: 'string',
        description: '오류 유형',
        example: 'Bad Request',
      },
      message: {
        type: 'string',
        description: '오류 메시지',
        example: '등록에 실패했습니다.',
      },
      details: {
        type: 'array',
        description: '상세 오류 정보',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: '오류가 발생한 필드',
              example: 'name',
            },
            message: {
              type: 'string',
              description: '필드별 오류 메시지',
              example: '이름은 필수 입력 항목입니다.',
            },
          },
        },
      },
    },
  });

  /**
   * 수정 성공 응답 스키마
   * 리소스 수정 성공에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonUpdatedSuccess',
    type: 'object',
    description: '리소스 수정 성공 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 200,
      },
      message: {
        type: 'string',
        description: '성공 메시지',
        example: '정상적으로 수정되었습니다.',
      },
      data: {
        type: 'object',
        description: '수정된 리소스 데이터',
        nullable: true,
        additionalProperties: true,
        example: {
          id: '1001',
          updatedAt: '2025-03-27T12:34:56Z',
        },
      },
    },
  });

  /**
   * 수정 실패 응답 스키마
   * 리소스 수정 실패에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonUpdatedError',
    type: 'object',
    description: '리소스 수정 실패 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 400,
      },
      error: {
        type: 'string',
        description: '오류 유형',
        example: 'Bad Request',
      },
      message: {
        type: 'string',
        description: '오류 메시지',
        example: '수정에 실패했습니다.',
      },
      details: {
        type: 'array',
        description: '상세 오류 정보',
        nullable: true,
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: '오류가 발생한 필드',
              example: 'email',
            },
            message: {
              type: 'string',
              description: '필드별 오류 메시지',
              example: '유효하지 않은 이메일 형식입니다.',
            },
          },
        },
      },
    },
  });

  /**
   * 삭제 성공 응답 스키마
   * 리소스 삭제 성공에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonDeletedSuccess',
    type: 'object',
    description: '리소스 삭제 성공 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 200,
      },
      message: {
        type: 'string',
        description: '성공 메시지',
        example: '정상적으로 삭제되었습니다.',
      },
    },
  });

  /**
   * 삭제 실패 응답 스키마
   * 리소스 삭제 실패에 대한 응답 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonDeletedError',
    type: 'object',
    description: '리소스 삭제 실패 응답',
    properties: {
      statusCode: {
        type: 'integer',
        description: 'HTTP 상태 코드',
        example: 400,
      },
      error: {
        type: 'string',
        description: '오류 유형',
        example: 'Bad Request',
      },
      message: {
        type: 'string',
        description: '오류 메시지',
        example: '삭제에 실패했습니다.',
      },
    },
  });

  /**
   * 페이지네이션 쿼리 스키마
   * 목록 조회 API의 페이지네이션 관련 쿼리 파라미터를 정의합니다.
   */
  fastify.addSchema({
    $id: 'paginationQuery',
    type: 'object',
    description: '페이지네이션 쿼리 파라미터',
    properties: {
      page: {
        type: 'integer',
        description: '현재 페이지 번호 (1부터 시작)',
        minimum: 1,
        default: 1,
        example: 1,
      },
      pageSize: {
        type: 'integer',
        description: '페이지당 항목 수',
        minimum: 1,
        maximum: 100,
        default: 20,
        example: 20,
      },
      sort: {
        type: 'string',
        description: '정렬 기준 필드',
        example: 'createdAt',
      },
      order: {
        type: 'string',
        description: '정렬 방향 (asc, desc)',
        enum: ['asc', 'desc'],
        default: 'desc',
        example: 'desc',
      },
    },
  });

  /**
   * 페이지네이션 응답 스키마
   * 목록 조회 API의 페이지네이션 관련 응답 데이터를 정의합니다.
   */
  fastify.addSchema({
    $id: 'paginationResponse',
    type: 'object',
    description: '페이지네이션 응답 정보',
    properties: {
      total: {
        type: 'integer',
        description: '전체 항목 수',
        example: 150,
      },
      page: {
        type: 'integer',
        description: '현재 페이지 번호',
        example: 1,
      },
      pageSize: {
        type: 'integer',
        description: '페이지당 항목 수',
        example: 20,
      },
      pageCount: {
        type: 'integer',
        description: '전체 페이지 수',
        example: 8,
      },
    },
  });

  /**
   * 공통 항목 스키마
   * 드롭다운이나 선택 요소에서 사용되는 공통 항목 형식을 정의합니다.
   */
  fastify.addSchema({
    $id: 'commonItem',
    type: 'object',
    description: '공통 항목 정보',
    properties: {
      id: {
        type: 'string',
        description: '항목 ID',
        example: '1001',
      },
      name: {
        type: 'string',
        description: '항목 이름',
        example: '개발',
      },
      code: {
        type: 'string',
        description: '항목 코드',
        nullable: true,
        example: 'DEV',
      },
      description: {
        type: 'string',
        description: '항목 설명',
        nullable: true,
        example: '개발 관련 업무',
      },
      isActive: {
        type: 'boolean',
        description: '활성 상태',
        default: true,
        example: true,
      },
      createdId: {
        type: 'string',
        description: '생성자 ID',
        example: 'user123',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '생성 일시',
        example: '2025-03-27T12:34:56Z',
      },
      updatedId: {
        type: 'string',
        description: '수정자 ID',
        nullable: true,
        example: 'user456',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: '수정 일시',
        nullable: true,
        example: '2025-03-28T10:11:12Z',
      },
    },
  });

  /**
   * 공통 검색 쿼리 스키마
   * 검색 기능이 있는 API의 검색 관련 쿼리 파라미터를 정의합니다.
   */
  fastify.addSchema({
    $id: 'searchQuery',
    type: 'object',
    description: '검색 쿼리 파라미터',
    properties: {
      keyword: {
        type: 'string',
        description: '검색 키워드',
        example: '접근성',
      },
      startDate: {
        type: 'string',
        format: 'date',
        description: '검색 시작 날짜 (YYYY-MM-DD)',
        example: '2025-01-01',
      },
      endDate: {
        type: 'string',
        format: 'date',
        description: '검색 종료 날짜 (YYYY-MM-DD)',
        example: '2025-03-31',
      },
    },
  });

  /**
   * 타임스탬프 필드 스키마
   * 생성/수정 시간 정보를 포함하는 스키마입니다.
   */
  fastify.addSchema({
    $id: 'timestampFields',
    type: 'object',
    description: '생성/수정 시간 정보',
    properties: {
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '생성 일시',
        example: '2025-03-27T12:34:56Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: '수정 일시',
        example: '2025-03-27T15:45:30Z',
      },
    },
  });

  // 로그 수준 정의
  fastify.log.info('공통 스키마 등록 완료');
}
