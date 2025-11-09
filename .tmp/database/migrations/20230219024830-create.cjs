'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER DATABASE ${queryInterface.sequelize.config.database}
        CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`,
    );

    // 공휴일 테이블(청구제외관리))
    await queryInterface.createTable('HOLIDAY_TBL', {
      holidayId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '공휴일 KEY',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '공휴일명',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: '날짜',
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 리포트세팅 테이블
    await queryInterface.createTable('REPORT_SETTING_TBL', {
      reportSetId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '리포트세팅 KEY',
      },
      year: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '연도',
      },
      month: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        comment: '월',
      },
      workingDay: {
        type: Sequelize.SMALLINT,
        comment: '영업일',
      },
      to: {
        type: Sequelize.SMALLINT,
        comment: 'TO',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 코드
    await queryInterface.createTable('CODE_TBL', {
      codeId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '코드 KEY',
      },
      group: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '그룹 CODE',
      },
      label: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '코드 이름',
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '코드 value',
      },
      comment: {
        type: Sequelize.TEXT('tiny'),
        comment: '설명',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false,
        comment: '활성유무',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 역할
    await queryInterface.createTable('ROLE_TBL', {
      roleId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '역할 KEY',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '역할 이름',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 권한
    await queryInterface.createTable('PERMISSION_TBL', {
      permissionId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '권한 KEY',
      },
      roleId: {
        allowNull: false,
        type: Sequelize.BIGINT,
        comment: '역할 KEY',
        references: { model: 'ROLE_TBL', key: 'roleId' },
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '권한 이름',
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '권한 KEY',
      },
      write: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '쓰기',
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '읽기',
      },
      // 페이지별 코드는 하드코딩
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 유저
    await queryInterface.createTable('MEMBER_TBL', {
      memberId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '유저 KEY',
      },
      accountId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '유저 ID',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '유저 이름',
      },
      pwd: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: '비밀번호',
      },
      hash: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: '비밀번호 검증용 해시',
      },
      deptPath: {
        type: Sequelize.STRING(500),
        defaultValue: '링키지랩',
        comment: '부서 경로',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false,
        comment: '활성유무',
      },
      roleId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '역할 KEY',
        references: { model: 'ROLE_TBL', key: 'roleId' },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });
    // 로그
    await queryInterface.createTable('LOG_TBL', {
      logId: {
        allowNull: false,
        autoIncrement: true,
        comment: '로그 KEY',
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      memberId: {
        comment: '유저 KEY',
        references: { model: 'MEMBER_TBL', key: 'memberId' },
        type: Sequelize.BIGINT,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING(20),
        comment: '로그타입', // SYSTEM, AUTH, GET, POST
      },
      comment: {
        type: Sequelize.TEXT('tiny'),
        comment: '로그내용',
      },
      status: {
        type: Sequelize.STRING(10),
        comment: '상태',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
    });

    // 청구그룹
    await queryInterface.createTable('COST_GRP_TBL', {
      costGrpId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '청구그룹 KEY',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '청구그룹명',
      },
      comment: {
        type: Sequelize.TEXT('tiny'),
        comment: '설명',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 서비스
    await queryInterface.createTable('SERVICE_TBL', {
      serviceId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '서비스 KEY',
      },
      costGrpId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '청구그룹 KEY',
        references: { model: 'COST_GRP_TBL', key: 'costGrpId' },
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '서비스명',
      },
      comment: {
        type: Sequelize.TEXT('tiny'),
        comment: '설명',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 프로젝트
    await queryInterface.createTable('PROJECT_TBL', {
      projectId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        comment: '프로젝트 KEY',
      },
      serviceId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '서비스 KEY',
        references: { model: 'SERVICE_TBL', key: 'serviceId' },
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '프로젝트명',
      },
      platformName: {
        type: Sequelize.STRING(255),
        comment: '플랫폼',
      },
      version: {
        type: Sequelize.STRING(255),
        comment: '버전',
      },
      type: {
        type: Sequelize.STRING(100),
        comment: '업무타입',
      },
      comment: {
        type: Sequelize.TEXT('tiny'),
        comment: '설명',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false,
        comment: '활성유무',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });
    // 프로젝트 LINK 관리 테이블
    await queryInterface.createTable('PROJECT_LINK_TBL', {
      projectLinkId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        comment: '프로젝트 LINK 관리 KEY',
      },
      projectId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '프로젝트 KEY',
        references: { model: 'PROJECT_TBL', key: 'projectId' },
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '이름',
      },
      url: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true,
        comment: '주소',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '수정일시',
      },
    });

    // 업무
    await queryInterface.createTable('TASK_TBL', {
      workId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: '업무보고 KEY',
      },
      memberId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '유저 KEY',
        references: { model: 'MEMBER_TBL', key: 'memberId' },
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '업무보고일',
      },
      accountId: {
        allowNull: false,
        type: Sequelize.STRING(255),
        comment: '생성자 ID',
      },
      categoryName: {
        allowNull: false,
        type: Sequelize.STRING(255),
        comment: '업무유형(프로젝트, 데이터, 기타)',
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(255),
        comment: '업무 테스크명',
      },
      viewName: {
        allowNull: false,
        type: Sequelize.STRING(255),
        comment: '뷰 이름',
      },
      comment: {
        type: Sequelize.TEXT('tiny'),
        comment: '업무 세부내용',
      },
      url: {
        type: Sequelize.STRING(256),
        comment: '업무 링크',
      },
      workMinute: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        comment: '업무시간(분)',
      },
      costGrpName: {
        type: Sequelize.STRING(255),
        comment: '청구대상(공동체명)',
      },
      serviceName: {
        type: Sequelize.STRING(255),
        comment: '서비스명',
      },
      projectName: {
        type: Sequelize.STRING(255),
        comment: '프로젝트명',
      },
      platformName: {
        type: Sequelize.STRING(255),
        comment: '플랫폼',
      },
      version: {
        type: Sequelize.STRING(255),
        comment: '버전',
      },
      startTime: {
        type: Sequelize.DATE,
        comment: '업무시작시간',
      },
      endTime: {
        type: Sequelize.DATE,
        comment: '업무종료시간',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        comment: '생성일시',
      },
      updatedAt: {
        type: Sequelize.DATE,
        comment: '최종 수정일시',
      },
    });

    const tbl = [
      'TASK_TBL',
      'PROJECT_TBL',
      'PROJECT_LINK_TBL',
      'SERVICE_TBL',
      'COST_GRP_TBL',
      'LOG_TBL',
      'MEMBER_TBL',
      'PERMISSION_TBL',
      'ROLE_TBL',
      'CODE_TBL',
      'REPORT_SETTING_TBL',
      'HOLIDAY_TBL',
    ];

    // JOIN 을 걸어보려고 했으나, 모순에 빠짐. 기록용으로 ldap 아이디만 남기고, 조회할때 id로 조회하는게 맞을 듯함.
    for (const item of tbl) {
      await queryInterface.addColumn(item, 'createdId', {
        type: Sequelize.BIGINT,
        // references: { model: 'MEMBER_TBL', key: 'memberId' },
        comment: '생성자',
      });
      if (item !== 'LOG_TBL')
        await queryInterface.addColumn(item, 'updatedId', {
          type: Sequelize.BIGINT,
          // references: { model: 'MEMBER_TBL', key: 'memberId' },
          comment: '최종 수정자',
        });
    }
  },

  async down(queryInterface, _Sequelize) {
    /**
     * Add reverting commands here.
     */

    // 생성의 역순
    await queryInterface.dropTable('TASK_TBL');
    await queryInterface.dropTable('PROJECT_LINK_TBL');
    await queryInterface.dropTable('PROJECT_TBL');
    await queryInterface.dropTable('SERVICE_TBL');
    await queryInterface.dropTable('COST_GRP_TBL');
    await queryInterface.dropTable('LOG_TBL');
    await queryInterface.dropTable('MEMBER_TBL');
    await queryInterface.dropTable('PERMISSION_TBL');
    await queryInterface.dropTable('ROLE_TBL');
    await queryInterface.dropTable('CODE_TBL');
    await queryInterface.dropTable('REPORT_SETTING_TBL');
    await queryInterface.dropTable('HOLIDAY_TBL');
  },
};
