import { DataTypes, Model } from 'sequelize';
export class Code extends Model {
  static associate(_models) {
    // define association here
  }

  static initialize(sequelize) {
    Model.init(
      {
        codeId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
          comment: '코드 KEY',
        },
        group: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '그룹 CODE',
        },
        label: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '코드 이름',
        },
        key: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '코드 value',
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
        modelName: 'Code',
        tableName: 'CODE_TBL',
      },
    );
  }
}
