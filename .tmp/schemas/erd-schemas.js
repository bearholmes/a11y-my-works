/**
 * ERD 정보 추가 스키마
 *
 * 이 파일은 데이터베이스 ERD(Entity-Relationship Diagram) 정보를
 * Swagger 문서에 추가하기 위한 스키마를 정의합니다.
 */

/**
 * 모델 관계 정보를 등록하는 함수
 *
 * @param {Object} fastify - Fastify 인스턴스
 */
export default function registerERDSchemas(fastify) {
  /**
   * ERD 관계 정보 스키마
   * 데이터베이스 테이블 간의 관계를 보여주는 스키마입니다.
   */
  fastify.addSchema({
    $id: 'dbRelationships',
    type: 'object',
    description: '데이터베이스 테이블 관계 정보',
    properties: {
      entities: {
        type: 'array',
        description: '엔티티(테이블) 목록',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '테이블 이름',
              example: 'MEMBER_TBL',
            },
            model: {
              type: 'string',
              description: '모델 이름',
              example: 'Member',
            },
            description: {
              type: 'string',
              description: '테이블 설명',
              example: '사용자 정보 관리',
            },
          },
        },
      },
      relationships: {
        type: 'array',
        description: '관계 목록',
        items: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              description: '소스 테이블',
              example: 'SERVICE_TBL',
            },
            target: {
              type: 'string',
              description: '타겟 테이블',
              example: 'COST_GRP_TBL',
            },
            type: {
              type: 'string',
              description: '관계 유형',
              enum: ['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many'],
              example: 'many-to-one',
            },
            sourceKey: {
              type: 'string',
              description: '소스 키',
              example: 'serviceId',
            },
            targetKey: {
              type: 'string',
              description: '타겟 키',
              example: 'costGrpId',
            },
            foreignKey: {
              type: 'string',
              description: '외래 키',
              example: 'costGrpId',
            },
          },
        },
      },
    },
  });

  /**
   * 실제 ERD 데이터 스키마
   * 시스템의 현재 ERD 정보를 담고 있습니다.
   */
  fastify.addSchema({
    $id: 'erdData',
    type: 'object',
    description: '시스템 ERD 데이터',
    properties: {
      entities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            model: { type: 'string' },
            description: { type: 'string' },
          },
        },
        example: [
          {
            name: 'MEMBER_TBL',
            model: 'Member',
            description: '사용자 정보 관리',
          },
          {
            name: 'TASK_TBL',
            model: 'Task',
            description: '업무보고 정보 관리',
          },
          {
            name: 'PROJECT_TBL',
            model: 'Project',
            description: '프로젝트 정보 관리',
          },
          {
            name: 'SERVICE_TBL',
            model: 'Service',
            description: '서비스 정보 관리',
          },
          {
            name: 'COST_GRP_TBL',
            model: 'CostGrp',
            description: '청구그룹 정보 관리',
          },
          {
            name: 'CODE_TBL',
            model: 'Code',
            description: '공통코드 관리',
          },
          {
            name: 'LOG_TBL',
            model: 'Log',
            description: '시스템 로그 관리',
          },
          {
            name: 'ROLE_TBL',
            model: 'Role',
            description: '역할 정보 관리',
          },
          {
            name: 'PERMISSION_TBL',
            model: 'Permission',
            description: '권한 정보 관리',
          },
          {
            name: 'HOLIDAY_TBL',
            model: 'Holiday',
            description: '공휴일 정보 관리',
          },
          {
            name: 'PROJECT_LINK_TBL',
            model: 'ProjectLink',
            description: '프로젝트 URL 관리',
          },
        ],
      },
      relationships: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            target: { type: 'string' },
            type: { type: 'string' },
            sourceKey: { type: 'string' },
            targetKey: { type: 'string' },
            foreignKey: { type: 'string' },
          },
        },
        example: [
          {
            source: 'MEMBER_TBL',
            target: 'ROLE_TBL',
            type: 'many-to-one',
            sourceKey: 'memberId',
            targetKey: 'roleId',
            foreignKey: 'roleId',
          },
          {
            source: 'TASK_TBL',
            target: 'MEMBER_TBL',
            type: 'many-to-one',
            sourceKey: 'workId',
            targetKey: 'memberId',
            foreignKey: 'memberId',
          },
          {
            source: 'PERMISSION_TBL',
            target: 'ROLE_TBL',
            type: 'many-to-one',
            sourceKey: 'permissionId',
            targetKey: 'roleId',
            foreignKey: 'roleId',
          },
          {
            source: 'SERVICE_TBL',
            target: 'COST_GRP_TBL',
            type: 'many-to-one',
            sourceKey: 'serviceId',
            targetKey: 'costGrpId',
            foreignKey: 'costGrpId',
          },
          {
            source: 'PROJECT_TBL',
            target: 'SERVICE_TBL',
            type: 'many-to-one',
            sourceKey: 'projectId',
            targetKey: 'serviceId',
            foreignKey: 'serviceId',
          },
          {
            source: 'PROJECT_LINK_TBL',
            target: 'PROJECT_TBL',
            type: 'many-to-one',
            sourceKey: 'linkId',
            targetKey: 'projectId',
            foreignKey: 'projectId',
          },
        ],
      },
    },
  });

  fastify.log.info('ERD 스키마 등록 완료');

  // ERD 정보를 조회하는 라우트 추가
  fastify.get(
    '/api/v3/docs/erd',
    {
      schema: {
        tags: ['etc'],
        summary: 'ERD 정보 조회',
        description: '시스템의 ERD(Entity-Relationship Diagram) 정보를 조회합니다.',
        response: {
          200: {
            $ref: 'erdData#',
          },
        },
      },
    },
    async () => {
      // 실제 ERD 데이터 반환
      return {
        entities: [
          {
            name: 'MEMBER_TBL',
            model: 'Member',
            description: '사용자 정보 관리',
          },
          {
            name: 'TASK_TBL',
            model: 'Task',
            description: '업무보고 정보 관리',
          },
          {
            name: 'PROJECT_TBL',
            model: 'Project',
            description: '프로젝트 정보 관리',
          },
          {
            name: 'SERVICE_TBL',
            model: 'Service',
            description: '서비스 정보 관리',
          },
          {
            name: 'COST_GRP_TBL',
            model: 'CostGrp',
            description: '청구그룹 정보 관리',
          },
          {
            name: 'CODE_TBL',
            model: 'Code',
            description: '공통코드 관리',
          },
          {
            name: 'LOG_TBL',
            model: 'Log',
            description: '시스템 로그 관리',
          },
          {
            name: 'ROLE_TBL',
            model: 'Role',
            description: '역할 정보 관리',
          },
          {
            name: 'PERMISSION_TBL',
            model: 'Permission',
            description: '권한 정보 관리',
          },
          {
            name: 'HOLIDAY_TBL',
            model: 'Holiday',
            description: '공휴일 정보 관리',
          },
          {
            name: 'PROJECT_LINK_TBL',
            model: 'ProjectLink',
            description: '프로젝트 URL 관리',
          },
        ],
        relationships: [
          {
            source: 'MEMBER_TBL',
            target: 'ROLE_TBL',
            type: 'many-to-one',
            sourceKey: 'memberId',
            targetKey: 'roleId',
            foreignKey: 'roleId',
          },
          {
            source: 'TASK_TBL',
            target: 'MEMBER_TBL',
            type: 'many-to-one',
            sourceKey: 'workId',
            targetKey: 'memberId',
            foreignKey: 'memberId',
          },
          {
            source: 'PERMISSION_TBL',
            target: 'ROLE_TBL',
            type: 'many-to-one',
            sourceKey: 'permissionId',
            targetKey: 'roleId',
            foreignKey: 'roleId',
          },
          {
            source: 'SERVICE_TBL',
            target: 'COST_GRP_TBL',
            type: 'many-to-one',
            sourceKey: 'serviceId',
            targetKey: 'costGrpId',
            foreignKey: 'costGrpId',
          },
          {
            source: 'PROJECT_TBL',
            target: 'SERVICE_TBL',
            type: 'many-to-one',
            sourceKey: 'projectId',
            targetKey: 'serviceId',
            foreignKey: 'serviceId',
          },
          {
            source: 'PROJECT_LINK_TBL',
            target: 'PROJECT_TBL',
            type: 'many-to-one',
            sourceKey: 'linkId',
            targetKey: 'projectId',
            foreignKey: 'projectId',
          },
        ],
      };
    },
  );
}
