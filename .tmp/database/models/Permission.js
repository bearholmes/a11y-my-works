import { DataTypes, Model } from 'sequelize';
export class Permission extends Model {
  static associate(models) {
    // define association here
    // references: { model: 'ROLE_TBL', key: 'roleId' },
    this.belongsTo(models.Role, {
      as: 'roles',
      foreignKey: 'roleId',
    });
  }

  static initialize(sequelize) {
    Model.init(
      {
        permissionId: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.BIGINT,
          comment: '권한 KEY',
        },
        roleId: {
          allowNull: false,
          type: DataTypes.BIGINT,
          comment: '역할 KEY',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '권한 이름',
        },
        key: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '권한 Key',
        },
        write: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '쓰기',
        },
        read: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '읽기',
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
        modelName: 'Permission',
        tableName: 'PERMISSION_TBL',
      },
    );
  }
}
