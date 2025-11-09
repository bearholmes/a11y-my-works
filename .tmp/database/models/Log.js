import { DataTypes, Model } from 'sequelize';
import { Member } from './Member.js';

export class Log extends Model {
  static associate(_models) {
    // 모델을 직접 import하여 사용
    Log.belongsTo(Member, {
      as: 'logger', // 'member'에서 'logger'로 별칭 변경
      foreignKey: 'memberId',
    });
  }

  static initialize(sequelize) {
    Model.init(
      {
        logId: {
          allowNull: false,
          autoIncrement: true,
          comment: '로그 KEY',
          primaryKey: true,
          type: DataTypes.BIGINT,
        },
        memberId: {
          comment: '유저 KEY',
          type: DataTypes.BIGINT,
        },
        type: {
          allowNull: false,
          type: DataTypes.STRING(20),
          comment: '로그타입', // SYSTEM, AUTH, GET, POST
        },
        comment: {
          type: DataTypes.TEXT('tiny'),
          comment: '로그내용',
        },
        status: {
          type: DataTypes.STRING(10),
          comment: '상태',
        },
        createdId: {
          type: DataTypes.BIGINT,
          comment: '생성자',
        },
      },
      {
        sequelize,
        modelName: 'Log',
        tableName: 'LOG_TBL',
        updatedAt: false,
      },
    );
  }
}
