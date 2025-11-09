import { DataTypes, Model } from 'sequelize';
export class ProjectLink extends Model {
  // static associate(_models) {
  //   // define association here
  // }

  static initialize(sequelize) {
    Model.init(
      {
        projectLinkId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
          comment: '프로젝트 LINK 관리 KEY',
        },
        projectId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          comment: '프로젝트 KEY',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          comment: '이름',
        },
        url: {
          type: DataTypes.STRING(256),
          allowNull: false,
          unique: true,
          comment: '주소',
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
        modelName: 'ProjectLink',
        tableName: 'PROJECT_LINK_TBL',
      },
    );
  }
}
