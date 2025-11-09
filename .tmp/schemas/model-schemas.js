/**
 * 모델 스키마 정의
 *
 * 이 파일은 데이터베이스 모델의 OpenAPI 스키마를 정의합니다.
 * 각 스키마는 fastify.addSchema()를 통해 등록되며,
 * 라우트 스키마에서 $ref를 통해 참조할 수 있습니다.
 */

/**
 * 모델 스키마 등록 함수
 *
 * @param {Object} fastify - Fastify 인스턴스
 */
export default function registerModelSchemas(fastify) {
  /**
   * 회원 모델 스키마 (Member)
   * 사용자 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'MemberModel',
    type: 'object',
    description: '회원 정보',
    properties: {
      memberId: {
        type: 'integer',
        description: '회원 고유 식별자',
        example: 1,
      },
      accountId: {
        type: 'string',
        description: '사용자 계정 ID',
        example: 'user123',
      },
      name: {
        type: 'string',
        description: '사용자 이름',
        example: '홍길동',
      },
      deptPath: {
        type: 'string',
        description: '부서 경로',
        example: '링키지랩/개발팀/프론트엔드',
      },
      isActive: {
        type: 'boolean',
        description: '계정 활성화 상태',
        example: true,
      },
      roleId: {
        type: 'integer',
        description: '역할 ID',
        example: 2,
      },
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

  /**
   * 업무일지 모델 스키마 (Task)
   * 사용자의 업무 기록을 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'TaskModel',
    type: 'object',
    description: '업무일지 정보',
    properties: {
      workId: {
        type: 'integer',
        description: '업무일지 고유 식별자',
        example: 1001,
      },
      memberId: {
        type: 'integer',
        description: '작성자 ID',
        example: 1,
      },
      date: {
        type: 'string',
        format: 'date',
        description: '업무 날짜',
        example: '2025-03-27',
      },
      accountId: {
        type: 'string',
        description: '작성자 계정 ID',
        example: 'user123',
      },
      categoryName: {
        type: 'string',
        description: '업무유형(프로젝트, 데이터, 기타)',
        example: '프로젝트',
      },
      name: {
        type: 'string',
        description: '업무 테스크명',
        example: '로그인 페이지 접근성 개선',
      },
      viewName: {
        type: 'string',
        description: '뷰 이름',
        example: '로그인',
      },
      comment: {
        type: 'string',
        description: '업무 세부내용',
        example: 'WAI-ARIA 적용 및 스크린리더 호환성 개선',
      },
      url: {
        type: 'string',
        description: '업무 링크',
        example: 'https://example.com/login',
      },
      workMinute: {
        type: 'integer',
        description: '업무시간(분)',
        example: 180,
      },
      costGrpName: {
        type: 'string',
        description: '청구대상(공동체명)',
        example: 'A사 접근성',
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
        description: '플랫폼',
        example: 'Desktop Web',
      },
      version: {
        type: 'string',
        description: '버전',
        example: '1.0.0',
      },
      startTime: {
        type: 'string',
        format: 'date-time',
        description: '업무시작시간',
        example: '2025-03-27T09:00:00Z',
      },
      endTime: {
        type: 'string',
        format: 'date-time',
        description: '업무종료시간',
        example: '2025-03-27T12:00:00Z',
      },
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

  /**
   * 역할 모델 스키마 (Role)
   * 사용자 역할 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'RoleModel',
    type: 'object',
    description: '역할 정보',
    properties: {
      roleId: {
        type: 'integer',
        description: '역할 고유 식별자',
        example: 1,
      },
      roleName: {
        type: 'string',
        description: '역할 이름',
        example: '관리자',
      },
      description: {
        type: 'string',
        description: '역할 설명',
        example: '시스템 전체 관리 권한',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 권한 모델 스키마 (Permission)
   * 역할별 권한 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'PermissionModel',
    type: 'object',
    description: '권한 정보',
    properties: {
      permissionId: {
        type: 'integer',
        description: '권한 고유 식별자',
        example: 1,
      },
      roleId: {
        type: 'integer',
        description: '역할 ID',
        example: 1,
      },
      permissionName: {
        type: 'string',
        description: '권한 이름',
        example: 'PERM_01',
      },
      permissionDescription: {
        type: 'string',
        description: '권한 설명',
        example: '대시보드 조회',
      },
      read: {
        type: 'boolean',
        description: '읽기 권한 여부',
        example: true,
      },
      write: {
        type: 'boolean',
        description: '쓰기 권한 여부',
        example: true,
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 청구그룹 모델 스키마 (CostGrp)
   * 청구 대상 그룹 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'CostGrpModel',
    type: 'object',
    description: '청구그룹 정보',
    properties: {
      costGrpId: {
        type: 'integer',
        description: '청구그룹 고유 식별자',
        example: 1,
      },
      name: {
        type: 'string',
        description: '청구그룹명',
        example: 'A사 접근성',
      },
      comment: {
        type: 'string',
        description: '청구그룹 설명',
        example: 'A사 접근성 개선 프로젝트 그룹',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 서비스 모델 스키마 (Service)
   * 서비스 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'ServiceModel',
    type: 'object',
    description: '서비스 정보',
    properties: {
      serviceId: {
        type: 'integer',
        description: '서비스 고유 식별자',
        example: 1,
      },
      costGrpId: {
        type: 'integer',
        description: '청구그룹 ID',
        example: 1,
      },
      name: {
        type: 'string',
        description: '서비스명',
        example: 'A사 홈페이지',
      },
      comment: {
        type: 'string',
        description: '서비스 설명',
        example: 'A사 대표 홈페이지',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 프로젝트 모델 스키마 (Project)
   * 프로젝트 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'ProjectModel',
    type: 'object',
    description: '프로젝트 정보',
    properties: {
      projectId: {
        type: 'integer',
        description: '프로젝트 고유 식별자',
        example: 1,
      },
      serviceId: {
        type: 'integer',
        description: '서비스 ID',
        example: 1,
      },
      name: {
        type: 'string',
        description: '프로젝트명',
        example: '회원가입 개선',
      },
      platformName: {
        type: 'string',
        description: '플랫폼',
        example: 'Desktop Web',
      },
      version: {
        type: 'string',
        description: '버전',
        example: '1.0.0',
      },
      type: {
        type: 'string',
        description: '업무타입',
        example: '개발',
      },
      comment: {
        type: 'string',
        description: '프로젝트 설명',
        example: '회원가입 프로세스 개선 및 접근성 적용',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 프로젝트 링크 모델 스키마 (ProjectLink)
   * 프로젝트 관련 URL 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'ProjectLinkModel',
    type: 'object',
    description: '프로젝트 링크 정보',
    properties: {
      linkId: {
        type: 'integer',
        description: '링크 고유 식별자',
        example: 1,
      },
      projectId: {
        type: 'integer',
        description: '프로젝트 ID',
        example: 1,
      },
      name: {
        type: 'string',
        description: '링크 이름',
        example: '개발 서버',
      },
      url: {
        type: 'string',
        description: 'URL',
        example: 'https://dev.example.com',
      },
      description: {
        type: 'string',
        description: '링크 설명',
        example: '개발 환경 테스트 서버',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 공통코드 모델 스키마 (Code)
   * 시스템에서 사용하는 공통 코드 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'CodeModel',
    type: 'object',
    description: '공통코드 정보',
    properties: {
      codeId: {
        type: 'integer',
        description: '코드 고유 식별자',
        example: 1,
      },
      groupCode: {
        type: 'string',
        description: '그룹 코드',
        example: 'PLATFORM',
      },
      code: {
        type: 'string',
        description: '코드',
        example: 'WEB',
      },
      codeName: {
        type: 'string',
        description: '코드명',
        example: 'Desktop Web',
      },
      sortOrder: {
        type: 'integer',
        description: '정렬 순서',
        example: 1,
      },
      description: {
        type: 'string',
        description: '코드 설명',
        example: '데스크탑 웹 플랫폼',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 공휴일 모델 스키마 (Holiday)
   * 공휴일 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'HolidayModel',
    type: 'object',
    description: '공휴일 정보',
    properties: {
      holidayId: {
        type: 'integer',
        description: '공휴일 고유 식별자',
        example: 1,
      },
      date: {
        type: 'string',
        format: 'date',
        description: '공휴일 날짜',
        example: '2025-01-01',
      },
      name: {
        type: 'string',
        description: '공휴일명',
        example: '신정',
      },
      description: {
        type: 'string',
        description: '공휴일 설명',
        example: '1월 1일 신정',
      },
      isActive: {
        type: 'boolean',
        description: '활성화 상태',
        example: true,
      },
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

  /**
   * 로그 모델 스키마 (Log)
   * 시스템 로그 정보를 저장하는 모델입니다.
   */
  fastify.addSchema({
    $id: 'LogModel',
    type: 'object',
    description: '시스템 로그 정보',
    properties: {
      logId: {
        type: 'integer',
        description: '로그 고유 식별자',
        example: 1,
      },
      logType: {
        type: 'string',
        description: '로그 유형',
        example: 'LOGIN',
      },
      logLevel: {
        type: 'string',
        description: '로그 레벨',
        example: 'INFO',
      },
      memberId: {
        type: 'integer',
        description: '관련 사용자 ID',
        example: 1,
      },
      accountId: {
        type: 'string',
        description: '관련 사용자 계정 ID',
        example: 'user123',
      },
      message: {
        type: 'string',
        description: '로그 메시지',
        example: '로그인 성공',
      },
      details: {
        type: 'string',
        description: '상세 정보',
        example: '{"ip":"192.168.1.1","userAgent":"Mozilla/5.0..."}',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '생성 일시',
        example: '2025-03-27T12:34:56Z',
      },
    },
  });

  fastify.log.info('모델 스키마 등록 완료');
}
