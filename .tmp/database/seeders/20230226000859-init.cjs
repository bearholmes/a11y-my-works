'use strict';

const permission = require('../../constants/permission.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    /**
     * Add seed commands here.
     */

    // 기본 권한 값
    const adminRoleId = await queryInterface.bulkInsert(
      'ROLE_TBL',
      [
        {
          name: '관리자',
        },
      ],
      {},
    );

    // 공통 코드 입력
    const platform = ['PC-Web', 'M-Web', 'iOS-App', 'AOS-App', 'Win-App'];
    const platformRecords = platform.map((item) => ({
      group: 'PLATFORM',
      label: item,
      key: item,
      isActive: true,
      createdId: 1,
    }));

    const workType = ['QA', '모니터링', '컨설팅', '교육'];
    const workTypeRecords = workType.map((item) => ({
      group: 'WORK_TYPE',
      label: item,
      key: item,
      isActive: true,
      createdId: 1,
    }));
    // 카테고리 프로젝트, 데이터, 일반, 기타, 매니징,
    const category = [
      {
        key: '프로젝트',
        isAdmin: false,
      },
      {
        key: '데이터 버퍼',
        isAdmin: false,
      },
      {
        key: '일반 버퍼',
        isAdmin: false,
      },
      {
        key: '기타 버퍼',
        isAdmin: false,
      },
      {
        key: '매니징 버퍼',
        isAdmin: true,
      },
      {
        key: '휴가',
        isAdmin: false,
      },
      // {
      //   key: '공휴일',
      //   isAdmin: true,
      //   isHidden: true,
      // },
    ];
    const categoryRecords = category.map((item) => ({
      group: 'CATEGORY',
      label: item.key,
      key: item.key,
      isActive: true,
      createdId: 1,
    }));
    await queryInterface.bulkInsert(
      'CODE_TBL',
      [...platformRecords, ...workTypeRecords, ...categoryRecords],
      {},
    );

    const holiday = [
      { label: '신정', date: '2023-01-01' },
      { label: '설날', date: '2023-01-21' },
      { label: '설날', date: '2023-01-22' },
      { label: '설날', date: '2023-01-23' },
      { label: '설날(대체공휴)', date: '2023-01-24' },
      { label: '삼일절', date: '2023-03-01' },
      { label: '근로자의 날', date: '2023-05-01' },
      { label: '어린이날', date: '2023-05-05' },
      { label: '부처님 오신날', date: '2023-05-27' },
      { label: '현충일', date: '2023-06-06' },
      { label: '광복절', date: '2023-08-15' },
      { label: '추석', date: '2023-09-28' },
      { label: '추석', date: '2023-09-29' },
      { label: '추석', date: '2023-09-30' },
      { label: '개천절', date: '2023-10-03' },
      { label: '한글날', date: '2023-10-09' },
      { label: '크리스마스', date: '2023-12-25' },
      { label: '신정', date: '2024-01-01' },
      { label: '설날', date: '2024-02-09' },
      { label: '설날', date: '2024-02-10' },
      { label: '설날', date: '2024-02-11' },
      { label: '설날(대체휴무)', date: '2024-02-12' },
      { label: '삼일절', date: '2024-03-01' },
      { label: '제22대 국회의원 선거', date: '2024-04-10' },
      { label: '근로자의 날', date: '2024-05-01' },
      { label: '어린이날', date: '2024-05-05' },
      { label: '어린이날(대체휴무)', date: '2024-05-06' },
      { label: '부처님 오신날', date: '2024-05-15' },
      { label: '현충일', date: '2024-06-06' },
      { label: '광복절', date: '2024-08-15' },
      { label: '추석', date: '2024-09-16' },
      { label: '추석', date: '2024-09-17' },
      { label: '추석', date: '2024-09-18' },
      { label: '개천절', date: '2024-10-03' },
      { label: '한글날', date: '2024-10-09' },
      { label: '크리스마스', date: '2024-12-25' },
    ];

    const holidayRecords = holiday.map((item) => ({
      name: item.label,
      date: item.date,
      createdId: 1,
    }));
    await queryInterface.bulkInsert('HOLIDAY_TBL', [...holidayRecords], {});

    const permissionRecords = permission.PERMISSION_LIST.map((item) => ({
      roleId: adminRoleId,
      name: item.name,
      key: item.key,
      write: true,
      read: true,
      createdId: 1,
    }));
    await queryInterface.bulkInsert('PERMISSION_TBL', [...permissionRecords], {});

    await queryInterface.bulkInsert(
      'MEMBER_TBL',
      [
        {
          accountId: 'super.admin',
          name: '관리자',
          deptPath: '링키지랩',
          pwd: '+XTJ+5niQedAvNJDWApcUVvUfzzREIEY6ISPGaj+nS4LtD8H2lWeCJXKATa8ue5lLjA1L17FMxMd1+Zc5MkVTw==',
          hash: 'Ht2QJN8u7WwQxF0onLPYsK9/s+YJpHaT9gZ5/8iPqgMTjYIzDCu1Ywp/elHiDiBR7Yp6iLxfXk9SjzuzcA+oRw==',
          isActive: true,
          roleId: adminRoleId,
        },
      ],
      {},
    );
  },

  async down(queryInterface, _Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('MEMBER_TBL', null, {});
    await queryInterface.bulkDelete('PERMISSION_TBL', null, {});
    await queryInterface.bulkDelete('HOLIDAY_TBL', null, {});
    await queryInterface.bulkDelete('ROLE_TBL', null, {});
    await queryInterface.bulkDelete('CODE_TBL', null, {});
  },
};
