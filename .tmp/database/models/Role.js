import { DataTypes, Model } from 'sequelize';
export class Role extends Model {
  static associate(models) {
    // define association here
    // references: { model: 'PERMISSION_TBL', key: 'roleId' },

    this.hasMany(models.Permission, {
      as: 'permissions',
      foreignKey: 'roleId',
    });
  }

  static initialize(sequelize) {
    Model.init(
      {
        roleId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
          comment: '역할 KEY',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: { args: true, msg: '이미 등록된 이름입니다.' },
          comment: '역할 이름',
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
        modelName: 'Role',
        tableName: 'ROLE_TBL',
      },
    );
  }
}
