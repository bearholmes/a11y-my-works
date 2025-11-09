'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // MM/MD 통계 처리를 위한 필드 추가
    await queryInterface.addColumn('Reports', 'totalManDays', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: '총 투입 인일(MD)',
    });

    await queryInterface.addColumn('Reports', 'totalManMonths', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: '총 투입 인월(MM)',
    });

    await queryInterface.addColumn('Reports', 'workingSummary', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '프로젝트/서비스별 투입공수 요약',
    });

    await queryInterface.addColumn('Reports', 'membersSummary', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '멤버별 투입공수 요약',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Reports', 'totalManDays');
    await queryInterface.removeColumn('Reports', 'totalManMonths');
    await queryInterface.removeColumn('Reports', 'workingSummary');
    await queryInterface.removeColumn('Reports', 'membersSummary');
  },
};
