import { DataTypes, Model } from 'sequelize';
export class CostGrp extends Model {
  static associate(_models) {
    // define association here
  }

  static initialize(sequelize) {
    Model.init(
      {
        costGrpId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
          comment: '청구그룹 KEY',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '청구그룹명',
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
        modelName: 'CostGrp',
        tableName: 'COST_GRP_TBL',
      },
    );
  }
}
