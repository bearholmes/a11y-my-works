-- Migration: Add requires_daily_report column to members table
-- Description: 일일 업무보고 작성 의무 여부를 구분하는 플래그 추가
-- Date: 2025-01-12

-- 1. members 테이블에 requires_daily_report 컬럼 추가
ALTER TABLE members
ADD COLUMN requires_daily_report BOOLEAN DEFAULT TRUE;

-- 2. 컬럼 설명 추가
COMMENT ON COLUMN members.requires_daily_report IS '일일 업무보고 작성 의무 여부. TRUE=작성 필수(기본값), FALSE=작성 불필요';

-- 3. 기존 데이터 업데이트 (선택 사항)
-- 예시: Pending User 역할은 업무보고 작성 대상에서 제외
UPDATE members
SET requires_daily_report = FALSE
WHERE role_id = (SELECT role_id FROM roles WHERE name = 'Pending User');

-- 4. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_members_requires_daily_report
ON members(requires_daily_report)
WHERE is_active = TRUE;

-- 5. 확인 쿼리
-- 업무보고 작성 대상 사용자 수 확인
SELECT
    COUNT(*) as total_report_required_members
FROM members
WHERE is_active = TRUE
  AND requires_daily_report = TRUE
  AND role_id IS NOT NULL;

-- 역할별 업무보고 작성 대상 분포 확인
SELECT
    r.name as role_name,
    COUNT(CASE WHEN m.requires_daily_report = TRUE THEN 1 END) as report_required,
    COUNT(CASE WHEN m.requires_daily_report = FALSE THEN 1 END) as report_not_required,
    COUNT(*) as total
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
WHERE m.is_active = TRUE
GROUP BY r.name
ORDER BY r.name;
