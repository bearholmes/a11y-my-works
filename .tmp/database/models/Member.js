/**
 * 회원(Member) 모델
 *
 * 이 모듈은 시스템의 사용자 계정 정보를 저장하는 Member 테이블의 Sequelize 모델입니다.
 * 사용자 인증, 권한 관리 및 개인 정보 저장을 위해 사용됩니다.
 *
 * @module models/Member
 * @requires sequelize
 */

import { DataTypes, Model } from 'sequelize';
import { Role } from './Role.js';

/**
 * 회원 모델 클래스
 * @class Member
 * @extends Model
 */
export class Member extends Model {
  /**
   * 시퀄라이즈 모델 초기화
   * 데이터베이스 테이블 구조를 정의하고 관계를 설정합니다.
   *
   * @static
   * @param {Sequelize} sequelize - 시퀄라이즈 인스턴스
   * @returns {Class<Member>} 초기화된 Member 모델 클래스
   */
  static initialize(sequelize) {
    Member.init(
      {
        /**
         * 회원 일련번호 (Primary Key)
         * @type {number}
         */
        memberId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '회원 일련번호',
        },

        /**
         * 회원 계정 ID
         * 로그인에 사용되는 고유 식별자입니다.
         * @type {string}
         */
        accountId: {
          type: DataTypes.STRING(15),
          allowNull: false,
          comment: '회원 계정 ID',
        },

        /**
         * 회원 이름
         * 사용자의 실명 또는 표시 이름입니다.
         * @type {string}
         */
        name: {
          type: DataTypes.STRING(20),
          allowNull: false,
          comment: '회원 이름',
        },

        /**
         * 부서 경로
         * 사용자가 속한 부서의 계층 구조를 표현합니다.
         * @type {string}
         */
        deptPath: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: '부서 경로',
        },

        /**
         * 비밀번호
         * 해시된 비밀번호 값을 저장합니다.
         * @type {string}
         */
        pwd: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '비밀번호',
        },

        /**
         * 솔트 값
         * 비밀번호 해싱에 사용되는 솔트 값입니다.
         * @type {string}
         */
        hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: '솔트',
        },

        /**
         * 역할 ID (Foreign Key)
         * 사용자의 시스템 역할을 정의합니다.
         * @type {number}
         */
        roleId: {
          type: DataTypes.INTEGER,
          references: {
            model: Role,
            key: 'roleId',
          },
        },

        /**
         * 활성화 여부
         * 사용자 계정의 활성 상태를 나타냅니다.
         * @type {boolean}
         */
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: '활성화 여부',
        },

        /**
         * 생성자 ID
         * 이 레코드를 생성한 사용자의 ID입니다.
         * @type {number}
         */
        createdId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '생성자 ID',
        },

        /**
         * 수정자 ID
         * 이 레코드를 마지막으로 수정한 사용자의 ID입니다.
         * @type {number}
         */
        updatedId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '수정자 ID',
        },
      },
      {
        sequelize,
        modelName: 'Member',
        tableName: 'members',
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true,
        indexes: [
          // 성능 최적화를 위한 인덱스 추가
          { name: 'idx_member_account_id', fields: ['accountId'] },
          { name: 'idx_member_name', fields: ['name'] },
          { name: 'idx_member_role_id', fields: ['roleId'] },
          { name: 'idx_member_is_active', fields: ['isActive'] },
          // 복합 인덱스 추가
          { name: 'idx_member_role_active', fields: ['roleId', 'isActive'] },
        ],
      },
    );

    return Member;
  }

  /**
   * 모델 간 관계 설정
   * 다른 모델과의 관계를 정의합니다.
   *
   * @static
   * @param {Object} models - 시퀄라이즈 모델 객체 컬렉션
   */
  static associate(_models) {
    // Role 모델을 직접 참조하여 관계 설정
    Member.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  }
}
