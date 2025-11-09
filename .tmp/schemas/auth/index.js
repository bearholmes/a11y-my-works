/**
 * 로그인 API 스키마
 * 사용자 인증을 통해 액세스 토큰을 발급합니다.
 */
export const loginSchema = {
  tags: ['auth'],
  summary: '로그인',
  description: '계정 ID와 비밀번호를 통해 사용자 인증을 수행하고 JWT 토큰을 발급합니다.',
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        maxLength: 255,
        description: '사용자 계정 ID',
      },
      password: {
        type: 'string',
        maxLength: 255,
        description: '비밀번호',
      },
    },
    required: ['accountId', 'password'],
  },
  response: {
    200: {
      type: 'object',
      description: '로그인 성공 응답',
      properties: {
        message: {
          type: 'string',
          description: '성공 메시지',
        },
        type: {
          type: 'string',
          description: '토큰 타입',
        },
        token: {
          type: 'string',
          description: 'JWT 액세스 토큰',
        },
        logged: {
          type: 'boolean',
          description: '로그인 상태',
        },
      },
    },
    400: {
      type: 'object',
      description: '로그인 실패 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        error: {
          type: 'string',
          description: '에러 유형',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
        },
        logged: {
          type: 'boolean',
          description: '로그인 상태',
        },
      },
    },
  },
};

/**
 * 토큰 갱신 API 스키마
 * 리프레시 토큰을 통해 새로운 액세스 토큰을 발급합니다.
 */
export const reissuanceSchema = {
  tags: ['auth'],
  summary: '토큰 갱신',
  description:
    '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다. 쿠키에 저장된 리프레시 토큰을 사용합니다.',
  response: {
    200: {
      type: 'object',
      description: '토큰 갱신 성공 응답',
      properties: {
        message: {
          type: 'string',
          description: '성공 메시지',
        },
        type: {
          type: 'string',
          description: '토큰 타입',
        },
        token: {
          type: 'string',
          description: '새로 발급된 JWT 액세스 토큰',
        },
        logged: {
          type: 'boolean',
          description: '로그인 상태',
        },
      },
    },
    400: {
      type: 'object',
      description: '토큰 갱신 실패 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        error: {
          type: 'string',
          description: '에러 유형',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
        },
      },
    },
  },
};

/**
 * 로그아웃 API 스키마
 * 리프레시 토큰을 무효화하고 로그아웃 처리합니다.
 */
export const logoutSchema = {
  tags: ['auth'],
  summary: '로그아웃',
  description: '사용자의 세션을 종료하고 리프레시 토큰을 무효화합니다.',
  response: {
    200: {
      type: 'object',
      description: '로그아웃 성공 응답',
      properties: {
        message: {
          type: 'string',
          description: '성공 메시지',
        },
        logged: {
          type: 'boolean',
          description: '로그인 상태',
        },
      },
    },
    400: {
      $ref: 'commonError#',
    },
  },
};

/**
 * 로그인 여부 확인 API 스키마
 * 현재 사용자의 인증 상태를 확인합니다.
 */
export const verifySchema = {
  tags: ['auth'],
  summary: '로그인 여부 확인',
  description: '현재 액세스 토큰의 유효성을 검증하고 인증 상태를 확인합니다.',
  security: [{ Authorization: [] }],
  response: {
    200: {
      type: 'object',
      description: '로그인 상태 확인 성공 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        message: {
          type: 'string',
          description: '상태 메시지',
        },
      },
    },
    401: {
      type: 'object',
      description: '인증 실패 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        code: {
          type: 'string',
          description: '에러 코드',
        },
        error: {
          type: 'string',
          description: '에러 유형',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
        },
      },
    },
  },
};

/**
 * 우회 로그인 API 스키마
 * 관리자가 다른 사용자의 계정으로 로그인할 수 있는 기능입니다.
 * 사용자 관리 또는 권한 관리 권한이 있는 사용자만 사용할 수 있습니다.
 */
export const bypassSchema = {
  tags: ['auth'],
  summary: '우회 로그인',
  description:
    '관리자가 다른 사용자 계정으로 로그인합니다. PERM_06(사용자 관리) 또는 PERM_08(권한 관리) 권한이 필요합니다.',
  security: [{ Authorization: [] }],
  consumes: ['application/x-www-form-urlencoded', 'application/json'],
  body: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        maxLength: 255,
        description: '대상 사용자 계정 ID',
      },
    },
    required: ['accountId'],
  },
  response: {
    200: {
      type: 'object',
      description: '우회 로그인 성공 응답',
      properties: {
        message: {
          type: 'string',
          description: '성공 메시지',
        },
        type: {
          type: 'string',
          description: '토큰 타입',
        },
        token: {
          type: 'string',
          description: '우회 로그인 JWT 토큰',
        },
        logged: {
          type: 'boolean',
          description: '로그인 상태',
        },
        bypassInfo: {
          type: 'object',
          description: '우회 로그인 정보',
          properties: {
            originalUser: {
              type: 'string',
              description: '원래 사용자 계정',
            },
            expiresIn: {
              type: 'number',
              description: '토큰 만료 시간(초)',
            },
            issuedAt: {
              type: 'string',
              description: '발급 시간',
            },
          },
        },
      },
    },
    400: {
      type: 'object',
      description: '우회 로그인 실패 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        error: {
          type: 'string',
          description: '에러 유형',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
        },
        logged: {
          type: 'boolean',
          description: '로그인 상태',
        },
      },
    },
    403: {
      type: 'object',
      description: '권한 없음 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        error: {
          type: 'string',
          description: '에러 유형',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
        },
      },
    },
  },
};

/**
 * 우회 로그인 상태 확인 API 스키마
 * 현재 세션이 우회 로그인 상태인지 확인합니다.
 */
export const bypassVerifySchema = {
  tags: ['auth'],
  summary: '우회 로그인 상태 확인',
  description: '현재 세션이 우회 로그인 상태인지 확인하고 관련 정보를 반환합니다.',
  security: [{ Authorization: [] }],
  response: {
    200: {
      type: 'object',
      description: '우회 로그인 상태 확인 응답',
      properties: {
        isBypass: {
          type: 'boolean',
          description: '우회 로그인 여부',
        },
        originalUser: {
          type: 'object',
          nullable: true,
          description: '원래 사용자 정보 (우회 로그인인 경우에만 반환)',
          properties: {
            memberId: {
              type: 'string',
              description: '원래 사용자 ID',
            },
            accountId: {
              type: 'string',
              description: '원래 사용자 계정',
            },
            timestamp: {
              type: 'string',
              description: '우회 로그인 시간',
            },
          },
        },
        currentUser: {
          type: 'object',
          nullable: true,
          description: '현재 로그인된 사용자 정보 (우회 로그인인 경우에만 반환)',
          properties: {
            memberId: {
              type: 'string',
              description: '현재 로그인된 사용자 ID',
            },
          },
        },
      },
    },
    401: {
      type: 'object',
      description: '인증 실패 응답',
      properties: {
        statusCode: {
          type: 'number',
          description: 'HTTP 상태 코드',
        },
        error: {
          type: 'string',
          description: '에러 유형',
        },
        message: {
          type: 'string',
          description: '에러 메시지',
        },
      },
    },
  },
};
