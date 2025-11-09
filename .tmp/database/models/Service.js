import { DataTypes, Model } from 'sequelize';
export class Service extends Model {
  static associate(_models) {
    // define association here
    // TODO join
  }

  static initialize(sequelize) {
    Model.init(
      {
        serviceId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          comment: '서비스 KEY',
        },
        costGrpId: {
          type: DataTypes.BIGINT,
          allowNull: false,
          comment: '청구그룹 KEY',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '서비스명',
        },
        comment: {
          type: DataTypes.TEXT('tiny'),
          comment: '설명',
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
        modelName: 'Service',
        tableName: 'SERVICE_TBL',
      },
    );
  }
}
