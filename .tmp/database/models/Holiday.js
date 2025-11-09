import { DataTypes, Model } from 'sequelize';
export class Holiday extends Model {
  static associate(_models) {
    // define association here
  }
  static initialize(sequelize) {
    Model.init(
      {
        holidayId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
          comment: '공휴일 KEY',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '공휴일명',
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          unique: { args: true, msg: '이미 등록된 날짜입니다.' },
          comment: '날짜',
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
        modelName: 'Holiday',
        tableName: 'HOLIDAY_TBL',
      },
    );
  }
}
