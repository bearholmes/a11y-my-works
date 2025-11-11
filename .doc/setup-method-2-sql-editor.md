# 방법 2: Supabase SQL Editor를 통한 첫 관리자 설정 (권장)

## 개요
Supabase SQL Editor를 사용하여 SQL 쿼리로 첫 관리자를 설정하는 방법입니다.
한 번에 모든 작업을 처리할 수 있어 가장 효율적이고 실수가 적습니다.

## 사전 준비
1. 애플리케이션에서 회원가입 완료
2. 이메일 인증 완료
3. Supabase Dashboard 접속 권한
4. 본인의 가입 이메일 주소 확인

## 단계별 절차

### 1단계: Supabase SQL Editor 접속
1. https://supabase.com 접속
2. 로그인
3. 해당 프로젝트 선택
4. 좌측 메뉴에서 **SQL Editor** 클릭

### 2단계: 관리자 역할 생성 (선택사항)
```sql
-- 관리자 역할이 이미 있다면 이 단계는 스킵됨
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자 - 전체 권한', true)
ON CONFLICT (name) DO NOTHING;
```

**Run** 버튼 클릭하여 실행

### 3단계: 관리자 역할 ID 확인
```sql
-- 관리자 역할의 role_id 확인
SELECT role_id, name, description
FROM roles
WHERE name = '관리자';
```

**Run** 버튼 클릭하여 실행
결과에서 `role_id` 값 확인 (예: 1)

### 4단계: 첫 사용자를 관리자로 승인
```sql
-- 본인의 이메일 주소로 변경하세요
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-email@example.com'; -- ⚠️ 실제 이메일로 변경 필수!
```

**⚠️ 중요**: `your-email@example.com`을 실제 가입한 이메일로 변경한 후 **Run** 클릭

### 5단계: 결과 확인
```sql
-- 설정이 제대로 되었는지 확인
SELECT
  member_id,
  email,
  name,
  is_active,
  role_id,
  created_at,
  updated_at
FROM members
WHERE email = 'your-email@example.com'; -- 본인 이메일로 변경
```

**Run** 버튼 클릭하여 실행
결과 확인:
- `is_active`: true
- `role_id`: 관리자 역할 ID (예: 1)

### 6단계: 애플리케이션에서 확인
1. 애플리케이션에 로그인
2. 모든 메뉴가 표시되는지 확인
3. 사용자 관리, 역할 관리 등 접근 가능 확인

## 전체 스크립트 (한 번에 실행)

```sql
-- ============================================
-- 첫 관리자 설정 전체 스크립트
-- ============================================

-- 1. 관리자 역할 생성 (이미 있으면 스킵)
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자 - 전체 권한', true)
ON CONFLICT (name) DO NOTHING;

-- 2. 관리자 역할 ID 확인
SELECT role_id, name FROM roles WHERE name = '관리자';

-- 3. 첫 사용자를 관리자로 승인
-- ⚠️ your-email@example.com을 실제 이메일로 변경!
UPDATE members
SET
  is_active = true,
  role_id = (SELECT role_id FROM roles WHERE name = '관리자' LIMIT 1),
  updated_at = NOW()
WHERE email = 'your-email@example.com';

-- 4. 결과 확인
SELECT
  member_id,
  email,
  name,
  is_active,
  role_id
FROM members
WHERE email = 'your-email@example.com';
```

## 장점
- 한 번에 모든 작업 완료 가능
- 재현 가능 (스크립트로 저장)
- 실수 가능성 낮음
- 빠른 처리
- 트랜잭션으로 안전하게 처리 가능

## 단점
- SQL 기본 지식 필요
- 이메일 주소를 직접 수정해야 함

## 추가 설정 (선택사항)

### 기본 권한 할당
```sql
-- 관리자에게 모든 권한 부여
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
```

### 다른 역할도 함께 생성
```sql
-- 매니저 역할
INSERT INTO roles (name, description, is_active)
VALUES ('매니저', '팀 관리자', true)
ON CONFLICT (name) DO NOTHING;

-- 일반 사용자 역할
INSERT INTO roles (name, description, is_active)
VALUES ('사용자', '일반 사용자', true)
ON CONFLICT (name) DO NOTHING;
```

## 문제 해결

### "UPDATE된 행이 0개입니다"
**원인**: 입력한 이메일로 가입된 사용자가 없음
**해결**:
```sql
-- members 테이블에 사용자가 있는지 확인
SELECT * FROM members;

-- 이메일 주소가 정확한지 확인 (대소문자 구분 안함)
SELECT * FROM members WHERE LOWER(email) = LOWER('your-email@example.com');
```

### "role_id가 NULL로 설정됩니다"
**원인**: 관리자 역할이 없음
**해결**:
```sql
-- 역할 테이블 확인
SELECT * FROM roles;

-- 역할이 없다면 생성
INSERT INTO roles (name, description, is_active)
VALUES ('관리자', '시스템 관리자', true);
```

### "권한이 없다고 표시됩니다"
**원인**: 역할에 권한이 할당되지 않음
**해결**:
```sql
-- 역할에 할당된 권한 확인
SELECT
  r.name as role_name,
  p.key,
  rp.read_access,
  rp.write_access
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.role_id
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE r.name = '관리자';

-- 권한이 없다면 위의 "기본 권한 할당" SQL 실행
```

## 보안 권장사항
1. SQL 스크립트 실행 후 **이력 삭제** (SQL Editor 하단의 History 탭에서)
2. 첫 관리자 설정 후 **즉시 비밀번호 변경**
3. 프로덕션 환경에서는 **SQL 접근 권한 제한**

---

**권장 대상**: 개발자, SQL에 익숙한 사용자, 프로덕션 배포
**작성일**: 2025-11-11
