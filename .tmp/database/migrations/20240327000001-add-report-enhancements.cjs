'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 첨부파일 필드 추가
    await queryInterface.addColumn('Reports', 'attachments', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '첨부 파일 정보 (JSON 배열)',
    });

    // 코멘트 히스토리 필드 추가
    await queryInterface.addColumn('Reports', 'commentHistory', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '상태 변경 및 코멘트 히스토리',
    });

    // 관련 태스크 ID 목록 필드 추가
    await queryInterface.addColumn('Reports', 'relatedTaskIds', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '관련 태스크 ID 목록',
    });

    // 마지막 상태 변경 시간 추가
    await queryInterface.addColumn('Reports', 'statusUpdatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '상태 마지막 변경 시간',
    });

    // 알림 설정 필드 추가
    await queryInterface.addColumn('Reports', 'notificationSettings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '알림 설정',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Reports', 'attachments');
    await queryInterface.removeColumn('Reports', 'commentHistory');
    await queryInterface.removeColumn('Reports', 'relatedTaskIds');
    await queryInterface.removeColumn('Reports', 'statusUpdatedAt');
    await queryInterface.removeColumn('Reports', 'notificationSettings');
  },
};
