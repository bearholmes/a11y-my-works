/**
 * 업무일지(Task) 모델
 *
 * 이 모듈은 사용자의 업무 보고 정보를 저장하는 Task 테이블의 Sequelize 모델입니다.
 * 일일 업무 내용, 프로젝트 정보, 시간 기록 등 업무 데이터 관리에 사용됩니다.
 *
 * @module models/Task
 * @requires sequelize
 */
import { DataTypes, Model } from 'sequelize';
import { Member } from './Member.js';
import { Project } from './Project.js';
import { Service } from './Service.js';

/**
 * 업무일지 모델 클래스
 * @class Task
 * @extends Model
 */
export class Task extends Model {
  /**
   * 모델 간 관계 설정
   * 다른 모델과의 관계를 정의합니다.
   *
   * @static
   * @param {Object} models - 시퀄라이즈 모델 객체 컬렉션
   */
  static associate(_models) {
    /**
     * 회원과의 관계 설정 (N:1)
     * 한 회원은 여러 업무일지를 작성할 수 있습니다.
     */
    Task.belongsTo(Member, {
      as: 'member',
      foreignKey: 'memberId',
    });

    /**
     * 서비스와의 관계 설정 (N:1)
     * 하나의 서비스에 여러 업무일지가 연결될 수 있습니다.
     */
    Task.belongsTo(Service, {
      as: 'relatedService', // 'service'에서 'relatedService'로 변경
      foreignKey: 'serviceId',
    });

    /**
     * 프로젝트와의 관계 설정 (N:1)
     * 하나의 프로젝트에 여러 업무일지가 연결될 수 있습니다.
     */
    Task.belongsTo(Project, {
      as: 'project',
      foreignKey: 'projectId',
    });
  }

  /**
   * 시퀄라이즈 모델 초기화
   * 데이터베이스 테이블 구조를 정의합니다.
   *
   * @static
   * @param {Sequelize} sequelize - 시퀄라이즈 인스턴스
   * @returns {Class<Task>} 초기화된 Task 모델 클래스
   */
  static initialize(sequelize) {
    Model.init(
      {
        /**
         * 업무일지 ID (Primary Key)
         * 각 업무일지의 고유 식별자입니다.
         * @type {number}
         */
        taskId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
          comment: '업무일지 ID',
        },

        /**
         * 회원 ID (Foreign Key)
         * 업무일지를 작성한 회원의 ID입니다.
         * @type {number}
         */
        memberId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          comment: '회원 ID',
        },

        /**
         * 회원 이름
         * 업무일지 작성자의 이름입니다.
         * @type {string}
         */
        memberName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '회원 이름',
        },

        /**
         * 업무 날짜
         * 업무가 수행된 날짜입니다.
         * @type {date}
         */
        taskDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          comment: '업무 날짜',
        },

        /**
         * 업무 유형
         * 개발, 회의, 문서작업 등 업무의 유형을 나타냅니다.
         * @type {string}
         */
        taskType: {
          allowNull: false,
          type: DataTypes.STRING(50),
          comment: '업무 유형',
        },

        /**
         * 업무 제목
         * 수행한 업무의 간략한 제목입니다.
         * @type {string}
         */
        taskName: {
          allowNull: false,
          type: DataTypes.STRING(255),
          comment: '업무 제목',
        },

        /**
         * 업무 상세 내용
         * 수행한 업무의 상세 설명입니다.
         * @type {string}
         */
        taskDetail: {
          type: DataTypes.TEXT('medium'),
          comment: '업무 상세 내용',
        },

        /**
         * 관련 URL
         * 업무와 관련된 외부 URL 링크입니다.
         * @type {string}
         */
        taskUrl: {
          type: DataTypes.STRING(512),
          comment: '관련 URL',
        },

        /**
         * 업무 시간(시간)
         * 업무 수행에 소요된 시간입니다 (시간 단위).
         * @type {number}
         */
        workTime: {
          allowNull: false,
          type: DataTypes.FLOAT(5, 2),
          comment: '업무 시간(시간)',
          defaultValue: 0,
        },

        /**
         * 비용 그룹 ID (Foreign Key)
         * 비용 청구를 위한 그룹 ID입니다.
         * @type {number}
         */
        costGroupId: {
          type: DataTypes.INTEGER,
          comment: '비용 그룹 ID',
        },

        /**
         * 서비스 ID (Foreign Key)
         * 업무와 관련된 서비스의 ID입니다.
         * @type {number}
         */
        serviceId: {
          type: DataTypes.INTEGER,
          comment: '서비스 ID',
        },

        /**
         * 프로젝트 ID (Foreign Key)
         * 업무와 관련된 프로젝트의 ID입니다.
         * @type {number}
         */
        projectId: {
          type: DataTypes.INTEGER,
          comment: '프로젝트 ID',
        },

        /**
         * 플랫폼 ID
         * 업무가 수행된 플랫폼의 ID입니다.
         * @type {number}
         */
        platformId: {
          type: DataTypes.INTEGER,
          comment: '플랫폼 ID',
        },

        /**
         * 업무 시작 시간
         * 업무를 시작한 정확한 시간입니다.
         * @type {date}
         */
        startTime: {
          type: DataTypes.DATE,
          comment: '업무 시작 시간',
        },

        /**
         * 업무 종료 시간
         * 업무를 종료한 정확한 시간입니다.
         * @type {date}
         */
        endTime: {
          type: DataTypes.DATE,
          comment: '업무 종료 시간',
        },

        /**
         * 생성자 ID
         * 이 레코드를 생성한 사용자의 ID입니다.
         * @type {number}
         */
        createdId: {
          type: DataTypes.BIGINT,
          comment: '생성자 ID',
        },

        /**
         * 최종 수정자 ID
         * 이 레코드를 마지막으로 수정한 사용자의 ID입니다.
         * @type {number}
         */
        updatedId: {
          type: DataTypes.BIGINT,
          comment: '최종 수정자 ID',
        },
      },
      {
        sequelize,
        modelName: 'Task',
        tableName: 'TASK_TBL',
        indexes: [
          // 성능 최적화를 위한 인덱스 추가
          { name: 'idx_task_member_id', fields: ['memberId'] },
          { name: 'idx_task_task_date', fields: ['taskDate'] },
          { name: 'idx_task_service_id', fields: ['serviceId'] },
          { name: 'idx_task_project_id', fields: ['projectId'] },
          { name: 'idx_task_task_type', fields: ['taskType'] },
          // 복합 인덱스 추가 - 자주 사용되는 조회 패턴 최적화
          { name: 'idx_task_member_date', fields: ['memberId', 'taskDate'] },
          { name: 'idx_task_project_date', fields: ['projectId', 'taskDate'] },
          { name: 'idx_task_service_date', fields: ['serviceId', 'taskDate'] },
        ],
      },
    );

    return Task;
  }
}
