import { DataTypes, Model } from 'sequelize';
import { ProjectLink } from './ProjectLink.js';
import { Service } from './Service.js';

/**
 * 프로젝트 모델 클래스
 */
export class Project extends Model {
  /**
   * 모델 간 관계 설정
   * @param {object} models - 시퀄라이즈 모델 객체들
   */
  static associate(_models) {
    // 관계 설정을 직접 Service 클래스로 설정

    Project.belongsTo(Service, {
      as: 'parentService', // 'service'에서 'parentService'로 변경
      foreignKey: 'serviceId',
    });

    Project.hasMany(ProjectLink, {
      as: 'urls',
      foreignKey: 'projectId',
    });
  }

  /**
   * 시퀄라이즈 모델 초기화
   * @param {Sequelize} sequelize - 시퀄라이즈 인스턴스
   */
  static initialize(sequelize) {
    Model.init(
      {
        projectId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          comment: '프로젝트 KEY',
        },
        serviceId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          comment: '서비스 KEY',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '프로젝트명',
        },
        platformName: {
          type: DataTypes.STRING(255),
          comment: '플랫폼',
        },
        version: {
          type: DataTypes.STRING(255),
          comment: '버전',
        },
        type: {
          type: DataTypes.STRING(100),
          comment: '업무타입',
        },
        comment: {
          type: DataTypes.TEXT('tiny'),
          comment: '설명',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          default: false,
          comment: '활성유무',
        },
        createdId: {
          type: DataTypes.BIGINT,
          comment: '생성자',
        },
        updatedId: {
          type: DataTypes.BIGINT,
          comment: '최종 수정자',
        },
      },
      {
        sequelize,
        modelName: 'Project',
        tableName: 'PROJECT_TBL',
        indexes: [
          // 성능 최적화를 위한 인덱스 추가
          { name: 'idx_project_service_id', fields: ['serviceId'] },
          { name: 'idx_project_name', fields: ['name'] },
          { name: 'idx_project_platform', fields: ['platformName'] },
          { name: 'idx_project_is_active', fields: ['isActive'] },
          // 복합 인덱스 추가
          { name: 'idx_project_service_active', fields: ['serviceId', 'isActive'] },
        ],
      },
    );
  }
}
