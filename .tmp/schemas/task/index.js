/**
 * 업무일지 목록 조회 스키마
 * 날짜 범위, 사용자, 업무유형, 청구그룹, 서비스, 프로젝트, 플랫폼 등의 필터링 조건을 사용하여
 * 업무일지 목록을 조회합니다.
 */
export const taskListSchema = {
  tags: ['task'],
  summary: '업무일지 목록 조회',
  description: '필터링 조건을 사용하여 업무일지 목록을 조회합니다.',
  querystring: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        format: 'date',
        description: '시작 날짜(YYYY-MM-DD)',
        example: '2025-01-01',
      },
      endDate: {
        type: 'string',
        format: 'date',
        description: '종료 날짜(YYYY-MM-DD)',
        example: '2025-03-31',
      },
      memberId: {
        type: 'string',
        description: '사용자 ID',
        example: '1001',
      },
      taskType: {
        type: 'string',
        description: '업무 유형 코드',
        example: 'DEV',
      },
      costGroupId: {
        type: 'string',
        description: '청구그룹 ID',
        example: '101',
      },
      serviceId: {
        type: 'string',
        description: '서비스 ID',
        example: '301',
      },
      projectId: {
        type: 'string',
        description: '프로젝트 ID',
        example: '501',
      },
      platformId: {
        type: 'string',
        description: '플랫폼 ID',
        example: 'WEB',
      },
      keyword: {
        type: 'string',
        description: '검색 키워드',
        example: '접근성 개선',
      },
      page: {
        type: 'integer',
        minimum: 1,
        description: '페이지 번호',
        default: 1,
        example: 1,
      },
      pageSize: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        description: '페이지당 항목 수',
        default: 20,
        example: 20,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: '전체 항목 수',
              example: 150,
            },
            page: {
              type: 'integer',
              description: '현재 페이지',
              example: 1,
            },
          },
        },
        tasks: {
          type: 'array',
          description: '업무일지 목록',
          items: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: '업무일지 ID',
                example: '1001',
              },
              taskDate: {
                type: 'string',
                format: 'date',
                description: '업무 날짜',
                example: '2025-03-15',
              },
              taskType: {
                type: 'string',
                description: '업무 유형',
                example: '개발',
              },
              taskName: {
                type: 'string',
                description: '업무명',
                example: '로그인 페이지 접근성 개선',
              },
              taskDetail: {
                type: 'string',
                description: '업무 상세 내용',
                example: 'WAI-ARIA 적용 및 스크린리더 호환성 개선',
              },
              memberId: {
                type: 'string',
                description: '작성자 ID',
                example: '1001',
              },
              memberName: {
                type: 'string',
                description: '작성자 이름',
                example: '홍길동',
              },
              costGroupName: {
                type: 'string',
                description: '청구그룹명',
                example: 'A사 웹접근성',
              },
              serviceName: {
                type: 'string',
                description: '서비스명',
                example: 'A사 홈페이지',
              },
              projectName: {
                type: 'string',
                description: '프로젝트명',
                example: '회원가입 개선',
              },
              platformName: {
                type: 'string',
                description: '플랫폼명',
                example: 'Desktop Web',
              },
              workTime: {
                type: 'integer',
                description: '업무 시간(분)',
                example: 180,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: '등록 일시',
                example: '2025-03-15T14:30:00Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: '수정 일시',
                example: '2025-03-15T15:45:00Z',
              },
            },
          },
        },
        summary: {
          type: 'object',
          description: '업무 요약 통계',
          properties: {
            totalTasks: {
              type: 'integer',
              description: '전체 업무 개수',
              example: 150,
            },
            totalWorkTime: {
              type: 'integer',
              description: '전체 업무 시간(분)',
              example: 12000,
            },
            avgWorkTimePerDay: {
              type: 'number',
              description: '일평균 업무 시간(분)',
              example: 480,
            },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 400,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Bad Request',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '유효하지 않은 날짜 범위입니다.',
        },
      },
    },
  },
};

/**
 * 업무일지 등록 스키마
 * 새로운 업무일지를 시스템에 등록합니다.
 */
export const taskCreateSchema = {
  tags: ['task'],
  summary: '업무일지 등록',
  description: '새로운 업무일지를 등록합니다.',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    required: ['taskDate', 'taskType', 'taskName', 'workTime', 'costGroupId'],
    properties: {
      taskDate: {
        type: 'string',
        format: 'date',
        description: '업무 날짜(YYYY-MM-DD)',
        example: '2025-03-15',
      },
      taskType: {
        type: 'string',
        description: '업무 유형 코드',
        example: 'DEV',
      },
      taskName: {
        type: 'string',
        maxLength: 200,
        description: '업무명',
        example: '로그인 페이지 접근성 개선',
      },
      taskDetail: {
        type: 'string',
        description: '업무 상세 내용',
        example: 'WAI-ARIA 적용 및 스크린리더 호환성 개선',
      },
      taskUrl: {
        type: 'string',
        format: 'uri',
        description: '관련 URL',
        example: 'https://example.com/login',
      },
      workTime: {
        type: 'integer',
        minimum: 1,
        description: '업무 시간(분)',
        example: 180,
      },
      costGroupId: {
        type: 'string',
        description: '청구그룹 ID',
        example: '101',
      },
      serviceId: {
        type: 'string',
        description: '서비스 ID',
        example: '301',
      },
      projectId: {
        type: 'string',
        description: '프로젝트 ID',
        example: '501',
      },
      platformId: {
        type: 'string',
        description: '플랫폼 ID',
        example: 'WEB',
      },
      startTime: {
        type: 'string',
        format: 'time',
        description: '업무 시작 시간(HH:MM)',
        example: '09:00',
      },
      endTime: {
        type: 'string',
        format: 'time',
        description: '업무 종료 시간(HH:MM)',
        example: '12:00',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '상태 코드',
          example: 200,
        },
        message: {
          type: 'string',
          description: '성공 메시지',
          example: '업무일지가 성공적으로 등록되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: '생성된 업무일지 ID',
              example: '1001',
            },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 400,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Bad Request',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '업무일지 등록에 실패했습니다.',
        },
      },
    },
  },
};

/**
 * 업무일지 상세 조회 스키마
 * 특정 업무일지의 상세 정보를 조회합니다.
 */
export const taskDetailSchema = {
  tags: ['task'],
  summary: '업무일지 상세 조회',
  description: '업무일지 ID를 사용하여 특정 업무일지의 상세 정보를 조회합니다.',
  params: {
    type: 'object',
    properties: {
      taskId: {
        type: 'string',
        description: '업무일지 ID',
        example: '1001',
      },
    },
    required: ['taskId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        task: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: '업무일지 ID',
              example: '1001',
            },
            taskDate: {
              type: 'string',
              format: 'date',
              description: '업무 날짜',
              example: '2025-03-15',
            },
            taskType: {
              type: 'string',
              description: '업무 유형',
              example: '개발',
            },
            taskName: {
              type: 'string',
              description: '업무명',
              example: '로그인 페이지 접근성 개선',
            },
            taskDetail: {
              type: 'string',
              description: '업무 상세 내용',
              example: 'WAI-ARIA 적용 및 스크린리더 호환성 개선',
            },
            taskUrl: {
              type: 'string',
              format: 'uri',
              description: '관련 URL',
              example: 'https://example.com/login',
            },
            memberId: {
              type: 'string',
              description: '작성자 ID',
              example: '1001',
            },
            memberName: {
              type: 'string',
              description: '작성자 이름',
              example: '홍길동',
            },
            costGroupId: {
              type: 'string',
              description: '청구그룹 ID',
              example: '101',
            },
            costGroupName: {
              type: 'string',
              description: '청구그룹명',
              example: 'A사 웹접근성',
            },
            serviceId: {
              type: 'string',
              description: '서비스 ID',
              example: '301',
            },
            serviceName: {
              type: 'string',
              description: '서비스명',
              example: 'A사 홈페이지',
            },
            projectId: {
              type: 'string',
              description: '프로젝트 ID',
              example: '501',
            },
            projectName: {
              type: 'string',
              description: '프로젝트명',
              example: '회원가입 개선',
            },
            platformId: {
              type: 'string',
              description: '플랫폼 ID',
              example: 'WEB',
            },
            platformName: {
              type: 'string',
              description: '플랫폼명',
              example: 'Desktop Web',
            },
            workTime: {
              type: 'integer',
              description: '업무 시간(분)',
              example: 180,
            },
            startTime: {
              type: 'string',
              format: 'time',
              description: '업무 시작 시간',
              example: '09:00',
            },
            endTime: {
              type: 'string',
              format: 'time',
              description: '업무 종료 시간',
              example: '12:00',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '등록 일시',
              example: '2025-03-15T14:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '수정 일시',
              example: '2025-03-15T15:45:00Z',
            },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 400,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Bad Request',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '업무일지를 찾을 수 없습니다.',
        },
      },
    },
  },
};

/**
 * 업무일지 수정 스키마
 * 기존 업무일지의 정보를 업데이트합니다.
 * 업무일지 작성자 또는 관리자 권한이 있는 사용자만 수정할 수 있습니다.
 */
export const taskUpdateSchema = {
  tags: ['task'],
  summary: '업무일지 수정',
  description: '특정 업무일지의 정보를 업데이트합니다. 작성자 또는 관리자만 수정 가능합니다.',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  params: {
    type: 'object',
    properties: {
      taskId: {
        type: 'string',
        description: '업무일지 ID',
        example: '1001',
      },
    },
    required: ['taskId'],
  },
  body: {
    type: 'object',
    properties: {
      taskDate: {
        type: 'string',
        format: 'date',
        description: '업무 날짜(YYYY-MM-DD)',
        example: '2025-03-15',
      },
      taskType: {
        type: 'string',
        description: '업무 유형 코드',
        example: 'DEV',
      },
      taskName: {
        type: 'string',
        maxLength: 200,
        description: '업무명',
        example: '로그인 페이지 접근성 개선',
      },
      taskDetail: {
        type: 'string',
        description: '업무 상세 내용',
        example: 'WAI-ARIA 적용 및 스크린리더 호환성 개선',
      },
      taskUrl: {
        type: 'string',
        format: 'uri',
        description: '관련 URL',
        example: 'https://example.com/login',
      },
      workTime: {
        type: 'integer',
        minimum: 1,
        description: '업무 시간(분)',
        example: 180,
      },
      costGroupId: {
        type: 'string',
        description: '청구그룹 ID',
        example: '101',
      },
      serviceId: {
        type: 'string',
        description: '서비스 ID',
        example: '301',
      },
      projectId: {
        type: 'string',
        description: '프로젝트 ID',
        example: '501',
      },
      platformId: {
        type: 'string',
        description: '플랫폼 ID',
        example: 'WEB',
      },
      startTime: {
        type: 'string',
        format: 'time',
        description: '업무 시작 시간(HH:MM)',
        example: '09:00',
      },
      endTime: {
        type: 'string',
        format: 'time',
        description: '업무 종료 시간(HH:MM)',
        example: '12:00',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '상태 코드',
          example: 200,
        },
        message: {
          type: 'string',
          description: '성공 메시지',
          example: '업무일지가 성공적으로 수정되었습니다.',
        },
        data: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: '수정된 업무일지 ID',
              example: '1001',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '수정 일시',
              example: '2025-03-15T15:45:00Z',
            },
          },
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 400,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Bad Request',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '업무일지 수정에 실패했습니다.',
        },
      },
    },
    403: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 403,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Forbidden',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '이 업무일지를 수정할 권한이 없습니다.',
        },
      },
    },
  },
};

/**
 * 업무일지 삭제 스키마
 * 특정 업무일지를 삭제합니다.
 * 업무일지 작성자 또는 관리자 권한이 있는 사용자만 삭제할 수 있습니다.
 */
export const taskDeleteSchema = {
  tags: ['task'],
  summary: '업무일지 삭제',
  description: '특정 업무일지를 삭제합니다. 작성자 또는 관리자만 삭제 가능합니다.',
  params: {
    type: 'object',
    properties: {
      taskId: {
        type: 'string',
        description: '업무일지 ID',
        example: '1001',
      },
    },
    required: ['taskId'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '상태 코드',
          example: 200,
        },
        message: {
          type: 'string',
          description: '성공 메시지',
          example: '업무일지가 성공적으로 삭제되었습니다.',
        },
      },
    },
    400: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 400,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Bad Request',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '업무일지 삭제에 실패했습니다.',
        },
      },
    },
    403: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer',
          description: '에러 상태 코드',
          example: 403,
        },
        error: {
          type: 'string',
          description: '에러 유형',
          example: 'Forbidden',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
          example: '이 업무일지를 삭제할 권한이 없습니다.',
        },
      },
    },
  },
};
