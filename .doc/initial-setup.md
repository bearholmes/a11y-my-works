# 초기 설정 가이드

## 개요

이 문서는 시스템을 처음 배포할 때 필요한 초기 설정 절차를 설명합니다.

## 1. 첫 관리자 계정 설정

### 1.1 회원가입
1. 애플리케이션에서 회원가입 진행
2. 이메일 인증 완료 (Supabase Auth 이메일 확인)

### 1.2 Supabase 콘솔에서 수동 승인

#### 방법 1: Table Editor 사용
1. Supabase Dashboard 접속 (https://supabase.com)
2. 프로젝트 선택
3. **Table Editor** 메뉴 클릭
4. **roles** 테이블에서 관리자 역할 ID 확인
   - 없다면 새로 생성: `name='관리자', description='시스템 관리자', is_active=true`
5. **members** 테이블에서 가입한 사용자 찾기
6. 다음 필드 수정:
   - `is_active`: `false` → `true`
   - `role_id`: 관리자 역할의 ID 입력

#### 방법 2: SQL Editor 사용 (권장)
Supabase **SQL Editor**에서 다음 쿼리 실행:

```sql
-- 1단계: 관리자 역할 생성 (이미 있다면 스킵됨)
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자 - 전체 권한', true)
ON CONFLICT (name) DO NOTHING;

-- 2단계: 관리자 역할 ID 확인
SELECT role_id, name FROM roles WHERE name = '관리자';

-- 3단계: 첫 사용자를 관리자로 승인
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-email@example.com'; -- 실제 이메일로 변경

-- 4단계: 결과 확인
SELECT
  member_id,
  email,
  name,
  is_active,
  role_id
FROM members
WHERE email = 'your-email@example.com';
```

### 1.3 로그인 및 확인
1. 애플리케이션에 로그인
2. 모든 메뉴가 표시되는지 확인
3. 관리자 기능(사용자 관리, 역할 관리 등) 접근 가능 확인

## 2. 기본 역할 및 권한 설정

### 2.1 기본 역할 생성
```sql
-- 관리자 역할 (이미 생성됨)
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자 - 전체 권한', true)
ON CONFLICT (name) DO NOTHING;

-- 매니저 역할
INSERT INTO roles (name, description, is_active)
VALUES ('매니저', '팀 관리자 - 팀원 업무 조회 및 통계', true)
ON CONFLICT (name) DO NOTHING;

-- 일반 사용자 역할
INSERT INTO roles (name, description, is_active)
VALUES ('사용자', '일반 사용자 - 본인 업무만 관리', true)
ON CONFLICT (name) DO NOTHING;
```

### 2.2 기본 권한 생성
```sql
-- 권한 생성 (이미 있다면 스킵됨)
INSERT INTO permissions (key, name) VALUES
  ('task.read', '업무 조회'),
  ('task.write', '업무 작성/수정'),
  ('project.read', '프로젝트 조회'),
  ('project.write', '프로젝트 관리'),
  ('member.read', '사용자 조회'),
  ('member.write', '사용자 관리')
ON CONFLICT (key) DO NOTHING;
```

### 2.3 역할-권한 매핑
```sql
-- 관리자: 모든 권한 (읽기/쓰기)
INSERT INTO role_permissions (role_id, permission_id, read_access, write_access)
SELECT
  (SELECT role_id FROM roles WHERE name = '관리자'),
  permission_id,
  true,
  true
FROM permissions
ON CONFLICT (role_id, permission_id) DO UPDATE SET
  read_access = true,
  write_access = true;

-- 매니저: 조회 권한 + 업무 쓰기
INSERT INTO role_permissions (role_id, permission_id, read_access, write_access)
SELECT
  (SELECT role_id FROM roles WHERE name = '매니저'),
  permission_id,
  true,
  CASE
    WHEN key IN ('task.write') THEN true
    ELSE false
  END
FROM permissions
ON CONFLICT (role_id, permission_id) DO UPDATE SET
  read_access = true,
  write_access = EXCLUDED.write_access;

-- 일반 사용자: 본인 업무만
INSERT INTO role_permissions (role_id, permission_id, read_access, write_access)
SELECT
  (SELECT role_id FROM roles WHERE name = '사용자'),
  permission_id,
  CASE WHEN key IN ('task.read', 'task.write') THEN true ELSE false END,
  CASE WHEN key = 'task.write' THEN true ELSE false END
FROM permissions
WHERE key IN ('task.read', 'task.write')
ON CONFLICT (role_id, permission_id) DO UPDATE SET
  read_access = EXCLUDED.read_access,
  write_access = EXCLUDED.write_access;
```

## 3. 기본 데이터 설정

### 3.1 청구 그룹 생성
```sql
INSERT INTO cost_groups (name, is_active) VALUES
  ('프로젝트 A', true),
  ('프로젝트 B', true),
  ('내부 업무', true)
ON CONFLICT DO NOTHING;
```

### 3.2 서비스 생성
```sql
INSERT INTO services (name, cost_group_id, is_active)
SELECT
  '웹 개발',
  cost_group_id,
  true
FROM cost_groups WHERE name = '프로젝트 A'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO services (name, cost_group_id, is_active)
SELECT
  '앱 개발',
  cost_group_id,
  true
FROM cost_groups WHERE name = '프로젝트 A'
LIMIT 1
ON CONFLICT DO NOTHING;
```

### 3.3 공통 코드 설정
```sql
-- 플랫폼 코드
INSERT INTO codes (code_type, code_value, code_name, is_active) VALUES
  ('PLATFORM', 'WEB', '웹', true),
  ('PLATFORM', 'MOBILE', '모바일', true),
  ('PLATFORM', 'API', 'API', true)
ON CONFLICT DO NOTHING;

-- 업무 유형
INSERT INTO codes (code_type, code_value, code_name, is_active) VALUES
  ('TASK_TYPE', 'DEV', '개발', true),
  ('TASK_TYPE', 'DESIGN', '디자인', true),
  ('TASK_TYPE', 'MEETING', '회의', true),
  ('TASK_TYPE', 'PLANNING', '기획', true)
ON CONFLICT DO NOTHING;
```

## 4. 확인 사항

### 4.1 관리자 계정 확인
```sql
SELECT
  m.member_id,
  m.email,
  m.name,
  m.is_active,
  r.name as role_name
FROM members m
LEFT JOIN roles r ON m.role_id = r.role_id
WHERE m.email = 'your-email@example.com';
```

### 4.2 권한 확인
```sql
SELECT
  r.name as role_name,
  p.key,
  p.name,
  rp.read_access,
  rp.write_access
FROM roles r
JOIN role_permissions rp ON r.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.name = '관리자'
ORDER BY p.key;
```

## 5. 이후 사용자 추가

첫 관리자 설정 후에는 애플리케이션의 **사용자 관리** 메뉴에서:

1. 신규 가입 사용자 목록 확인
2. 적절한 역할 할당
3. 승인 처리

수동 SQL 작업 없이 UI에서 모든 관리 가능합니다.

## 6. 문제 해결

### 로그인 후 "승인 대기 중" 화면이 계속 표시되는 경우
```sql
-- 사용자 상태 확인
SELECT member_id, email, is_active, role_id
FROM members
WHERE email = 'your-email@example.com';

-- is_active가 false이거나 role_id가 NULL인 경우 수정
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1)
WHERE email = 'your-email@example.com';
```

### 권한이 없다고 표시되는 경우
```sql
-- 역할에 권한이 제대로 할당되었는지 확인
SELECT COUNT(*)
FROM role_permissions
WHERE role_id = (SELECT role_id FROM roles WHERE name = '관리자');

-- 권한이 없다면 위의 "2.3 역할-권한 매핑" SQL 재실행
```

## 7. 보안 권장사항

1. **첫 관리자 설정 후 즉시 비밀번호 변경**
2. **Supabase RLS 정책 활성화 확인**
3. **프로덕션 환경에서는 Supabase API 키 보호**
4. **정기적인 권한 감사**

---

**작성일**: 2025-11-11
**최종 수정**: 2025-11-11
