import { DataTypes, Model } from 'sequelize';

export class Report extends Model {
  static associate(models) {
    // 여러 테이블과의 관계 정의
    Report.belongsTo(models.Member, {
      as: 'member',
      foreignKey: 'memberId',
    });

    Report.belongsTo(models.Project, {
      as: 'project',
      foreignKey: 'projectId',
    });

    Report.belongsTo(models.Service, {
      as: 'service',
      foreignKey: 'serviceId',
    });
  }

  static initialize(sequelize) {
    Model.init(
      {
        reportId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          comment: '보고서 KEY',
        },
        memberId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          comment: '생성 멤버 KEY',
        },
        serviceId: {
          type: DataTypes.BIGINT,
          comment: '서비스 KEY',
        },
        projectId: {
          type: DataTypes.BIGINT,
          comment: '프로젝트 KEY',
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '보고서 제목',
        },
        type: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '보고서 타입 (DAILY, WEEKLY, MONTHLY, PROJECT)',
        },
        content: {
          type: DataTypes.TEXT,
          comment: '보고서 내용',
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: '보고 시작 기간',
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: '보고 종료 기간',
        },
        status: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'DRAFT',
          comment: '상태 (DRAFT, SUBMITTED, APPROVED, REJECTED)',
        },
        commentHistory: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '상태 변경 및 코멘트 히스토리',
        },
        relatedTaskIds: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '관련 태스크 ID 목록',
        },
        statusUpdatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: '상태 마지막 변경 시간',
        },
        totalManDays: {
          type: DataTypes.FLOAT,
          allowNull: true,
          comment: '총 투입 인일(MD)',
        },
        totalManMonths: {
          type: DataTypes.FLOAT,
          allowNull: true,
          comment: '총 투입 인월(MM)',
        },
        workingSummary: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '프로젝트/서비스별 투입공수 요약',
        },
        membersSummary: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: '멤버별 투입공수 요약',
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
        modelName: 'Report',
        tableName: 'Reports',
        timestamps: true,
        indexes: [
          {
            name: 'idx_report_type',
            fields: ['type'],
          },
          {
            name: 'idx_report_status',
            fields: ['status'],
          },
          {
            name: 'idx_report_date_range',
            fields: ['startDate', 'endDate'],
          },
          {
            name: 'idx_report_member',
            fields: ['memberId'],
          },
        ],
      },
    );
  }
}
