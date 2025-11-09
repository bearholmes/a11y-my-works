'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Reports 테이블 생성
    await queryInterface.createTable('Reports', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '보고서 제목',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '보고서 타입 (DAILY, WEEKLY, MONTHLY, PROJECT)',
      },
      content: {
        type: Sequelize.TEXT,
        comment: '보고서 내용',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '보고 시작 기간',
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '보고 종료 기간',
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'DRAFT',
        comment: '상태 (DRAFT, SUBMITTED, APPROVED, REJECTED)',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      createdId: {
        type: Sequelize.BIGINT,
        comment: '생성자',
      },
      updatedId: {
        type: Sequelize.BIGINT,
        comment: '최종 수정자',
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Reports');
  },
};
