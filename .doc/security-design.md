# 보안 설계 문서

## 개요

이 문서는 업무 보고 시스템의 보안 아키텍처와 보안 정책을 정의합니다. OWASP Top 10 취약점에 대한 방어 전략을 포함합니다.

## 보안 원칙

### 핵심 원칙
1. **심층 방어 (Defense in Depth)**: 다층적 보안 메커니즘
2. **최소 권한 원칙 (Least Privilege)**: 필요한 최소한의 권한만 부여
3. **기본 거부 (Fail Secure)**: 오류 발생 시 안전한 상태로 전환
4. **보안 기본값 (Secure by Default)**: 보안이 기본으로 활성화
5. **투명성과 감사 (Audit & Transparency)**: 모든 보안 이벤트 로깅

---

## 1. 인증 (Authentication) 아키텍처

### 1.1 Supabase Auth 기반 인증

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /auth/v1/token
       │    { email, password }
       ▼
┌─────────────────────┐
│  Supabase Auth API  │
├─────────────────────┤
│ - Password Hashing  │
│ - JWT Generation    │
│ - Session Mgmt      │
└──────┬──────────────┘
       │ 2. Return JWT + Refresh Token
       ▼
┌─────────────┐
│   Browser   │
├─────────────┤
│ LocalStorage│
│ - Session   │
│ - User Info │
└─────────────┘
```

### 1.2 인증 플로우

```typescript
// src/lib/supabase.ts - 보안 강화 설정

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 세션 지속성
    persistSession: true,

    // 자동 토큰 갱신 (기본 60분)
    autoRefreshToken: true,

    // 세션 감지
    detectSessionInUrl: true,

    // 스토리지 키 (커스터마이징 가능)
    storageKey: 'a11y-my-wooks-auth',

    // PKCE 플로우 활성화 (보안 강화)
    flowType: 'pkce',
  },
  global: {
    headers: {
      // 사용자 에이전트 정보
      'X-Client-Info': 'a11y-my-wooks@1.0.0',
    },
  },
});
```

### 1.3 비밀번호 정책

```typescript
// src/utils/passwordPolicy.ts

/**
 * 비밀번호 강도 검증
 */
export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // 선택적
};

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`비밀번호는 최소 ${policy.minLength}자 이상이어야 합니다`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('대문자를 최소 1개 이상 포함해야 합니다');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('소문자를 최소 1개 이상 포함해야 합니다');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('숫자를 최소 1개 이상 포함해야 합니다');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 최소 1개 이상 포함해야 합니다');
  }

  // 일반적인 비밀번호 블랙리스트
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('너무 흔한 비밀번호입니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 1.4 계정 보안 기능

```typescript
// 계정 잠금 정책 (Supabase에서 제공)
// - 5회 연속 로그인 실패 시 계정 일시 잠금
// - 15분 후 자동 해제
// - 관리자가 수동으로 해제 가능

// 이메일 인증 필수
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password',
  options: {
    emailRedirectTo: 'https://yourdomain.com/auth/callback',
  },
});

// 이메일 미인증 사용자 접근 제한
if (user && !user.email_confirmed_at) {
  throw new AuthError(
    'AUTH_ERR_005',
    '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
    'Email not verified'
  );
}
```

---

## 2. 인가 (Authorization) 아키텍처

### 2.1 역할 기반 접근 제어 (RBAC)

```typescript
// src/types/permissions.ts

export enum Role {
  ADMIN = 'ADMIN',      // 관리자
  MANAGER = 'MANAGER',  // 팀장
  EMPLOYEE = 'EMPLOYEE' // 직원
}

export enum Permission {
  PERM_01 = 'DASHBOARD',        // 대시보드 조회
  PERM_02 = 'TASK_REPORT',      // 업무 보고
  PERM_03 = 'PROJECT_MANAGE',   // 프로젝트 관리
  PERM_04 = 'SERVICE_MANAGE',   // 서비스 관리
  PERM_05 = 'COST_GRP_MANAGE',  // 청구그룹 관리
  PERM_06 = 'MEMBER_MANAGE',    // 사용자 관리
  PERM_07 = 'CODE_MANAGE',      // 공통코드 관리
  PERM_08 = 'PERMISSION_MANAGE',// 권한 관리
  PERM_09 = 'HOLIDAY_MANAGE',   // 공휴일 관리
  PERM_10 = 'LOG_VIEW',         // 로그 조회
}

// 역할별 기본 권한 매핑
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission), // 모든 권한
  [Role.MANAGER]: [
    Permission.PERM_01,
    Permission.PERM_02,
    Permission.PERM_10,
  ],
  [Role.EMPLOYEE]: [
    Permission.PERM_01,
    Permission.PERM_02,
  ],
};
```

### 2.2 권한 검증 훅

```typescript
// src/hooks/usePermission.ts

import { useQuery } from '@tanstack/react-query';
import { memberAPI } from '../services/api';
import { Permission, ROLE_PERMISSIONS, Role } from '../types/permissions';

/**
 * 권한 검증 훅
 */
export function usePermission() {
  const { data: member } = useQuery({
    queryKey: ['currentMember'],
    queryFn: memberAPI.getCurrentMember,
  });

  /**
   * 특정 권한 보유 여부 확인
   */
  const hasPermission = (permission: Permission, accessType: 'read' | 'write' = 'read'): boolean => {
    if (!member || !member.roles) return false;

    const roleName = member.roles.name as Role;
    const permissions = ROLE_PERMISSIONS[roleName] || [];

    return permissions.includes(permission);
  };

  /**
   * 여러 권한 중 하나라도 보유 (OR 조건)
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  /**
   * 모든 권한 보유 (AND 조건)
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  /**
   * 관리자 여부
   */
  const isAdmin = (): boolean => {
    return member?.roles?.name === Role.ADMIN;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    currentRole: member?.roles?.name,
  };
}
```

### 2.3 권한 기반 라우트 보호

```typescript
// src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requireWrite?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requireWrite = false,
}: ProtectedRouteProps) {
  const { hasPermission } = usePermission();

  if (requiredPermission && !hasPermission(requiredPermission, requireWrite ? 'write' : 'read')) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

// 사용 예시
<Route
  path="/admin/members"
  element={
    <ProtectedRoute requiredPermission={Permission.PERM_06} requireWrite>
      <MemberManagementPage />
    </ProtectedRoute>
  }
/>
```

---

## 3. Row Level Security (RLS)

### 3.1 RLS 정책 개요

Supabase의 PostgreSQL RLS를 활용하여 데이터베이스 레벨에서 접근 제어를 수행합니다.

### 3.2 주요 테이블 RLS 정책

```sql
-- supabase_schema.sql

-- ============================================
-- RLS for tasks table
-- ============================================

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 1. SELECT 정책: 본인 업무 또는 팀장/관리자는 전체 조회
CREATE POLICY "Users can view their own tasks or managers can view all"
ON tasks FOR SELECT
USING (
  auth.uid() = (SELECT auth_id FROM members WHERE member_id = tasks.member_id)
  OR
  (SELECT role_id FROM members WHERE auth_id = auth.uid()) IN (1, 2) -- 관리자, 팀장
);

-- 2. INSERT 정책: 본인 업무만 생성 가능
CREATE POLICY "Users can create their own tasks"
ON tasks FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT auth_id FROM members WHERE member_id = tasks.member_id)
);

-- 3. UPDATE 정책: 본인 업무 또는 관리자만 수정 가능
CREATE POLICY "Users can update their own tasks or admins can update all"
ON tasks FOR UPDATE
USING (
  auth.uid() = (SELECT auth_id FROM members WHERE member_id = tasks.member_id)
  OR
  (SELECT role_id FROM members WHERE auth_id = auth.uid()) = 1 -- 관리자
);

-- 4. DELETE 정책: 본인 업무 또는 관리자만 삭제 가능
CREATE POLICY "Users can delete their own tasks or admins can delete all"
ON tasks FOR DELETE
USING (
  auth.uid() = (SELECT auth_id FROM members WHERE member_id = tasks.member_id)
  OR
  (SELECT role_id FROM members WHERE auth_id = auth.uid()) = 1 -- 관리자
);


-- ============================================
-- RLS for members table
-- ============================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- SELECT: 본인 정보 조회 또는 관리자는 전체 조회
CREATE POLICY "Users can view own profile or admins can view all"
ON members FOR SELECT
USING (
  auth.uid() = auth_id
  OR
  (SELECT role_id FROM members WHERE auth_id = auth.uid()) = 1
);

-- UPDATE: 본인 정보 수정 또는 관리자만 가능
CREATE POLICY "Users can update own profile or admins can update all"
ON members FOR UPDATE
USING (
  auth.uid() = auth_id
  OR
  (SELECT role_id FROM members WHERE auth_id = auth.uid()) = 1
);

-- INSERT: 회원가입 시 자동 생성 (인증된 사용자만)
CREATE POLICY "Authenticated users can create member profile"
ON members FOR INSERT
WITH CHECK (
  auth.uid() = auth_id
);


-- ============================================
-- RLS for projects, services, cost_groups
-- ============================================

-- 조회: 모든 인증된 사용자
-- 수정: 관리자만
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view projects"
ON projects FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage projects"
ON projects FOR ALL
USING ((SELECT role_id FROM members WHERE auth_id = auth.uid()) = 1);

-- services, cost_groups도 동일한 패턴 적용
```

### 3.3 RLS 테스트

```sql
-- RLS 정책 테스트 쿼리

-- 1. 일반 사용자로 본인 업무만 조회되는지 확인
SET request.jwt.claims = '{"sub":"user1-uuid","role":"authenticated"}';
SELECT * FROM tasks; -- user1의 업무만 반환되어야 함

-- 2. 관리자로 전체 업무 조회되는지 확인
SET request.jwt.claims = '{"sub":"admin-uuid","role":"authenticated"}';
SELECT * FROM tasks; -- 모든 업무 반환되어야 함

-- 3. 다른 사용자 업무 수정 시도 (실패해야 함)
SET request.jwt.claims = '{"sub":"user1-uuid","role":"authenticated"}';
UPDATE tasks SET task_name = 'hacked' WHERE member_id = 2; -- 0 rows affected
```

---

## 4. 세션 관리

### 4.1 세션 수명 주기

```typescript
// Supabase Auth 세션 설정

// 액세스 토큰 만료 시간: 60분 (기본값)
// 리프레시 토큰 만료 시간: 30일 (기본값)

// 자동 토큰 갱신
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically');
  }

  if (event === 'SIGNED_OUT') {
    // 세션 종료 시 정리
    queryClient.clear();
    localStorage.removeItem('cached-data');
  }
});
```

### 4.2 세션 보안 강화

```typescript
// src/utils/sessionSecurity.ts

/**
 * 세션 보안 검증
 */
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
  private static readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5분

  /**
   * 마지막 활동 시간 추적
   */
  static trackActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  /**
   * 세션 타임아웃 확인
   */
  static isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return false;

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed > this.SESSION_TIMEOUT;
  }

  /**
   * 자동 로그아웃 초기화
   */
  static initAutoLogout() {
    // 사용자 활동 추적
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, () => {
        this.trackActivity();
      });
    });

    // 주기적으로 세션 확인
    setInterval(async () => {
      if (this.isSessionExpired()) {
        const { error } = await supabase.auth.signOut();
        if (!error) {
          window.location.href = '/login?reason=timeout';
        }
      }
    }, 60 * 1000); // 1분마다 확인
  }
}
```

---

## 5. XSS (Cross-Site Scripting) 방어

### 5.1 React 기본 보호

React는 기본적으로 XSS를 방어합니다:

```typescript
// 안전 - React가 자동으로 이스케이프
const userInput = '<script>alert("XSS")</script>';
<div>{userInput}</div> // 실제로 <script> 태그가 실행되지 않음

// 위험 - dangerouslySetInnerHTML 사용 금지
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌ 사용 금지
```

### 5.2 입력 검증 및 새니타이제이션

```typescript
// src/utils/sanitization.ts

import DOMPurify from 'dompurify';

/**
 * HTML 새니타이제이션
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * URL 검증
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);

    // 허용된 프로토콜만
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * SQL 인젝션 방지 (Supabase는 자동으로 파라미터화)
 */
// ❌ 나쁜 예 (사용하지 말 것)
const query = `SELECT * FROM tasks WHERE task_name = '${userInput}'`;

// ✅ 좋은 예
const { data } = await supabase
  .from('tasks')
  .select()
  .eq('task_name', userInput); // 자동 파라미터화
```

### 5.3 Content Security Policy (CSP)

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
/>
```

---

## 6. CSRF (Cross-Site Request Forgery) 방어

### 6.1 SameSite 쿠키

Supabase는 기본적으로 SameSite 쿠키를 사용합니다:

```typescript
// Supabase Auth 쿠키 설정
// SameSite=Lax (기본값)
// Secure=true (HTTPS 환경)
// HttpOnly=true (JavaScript 접근 불가)
```

### 6.2 추가 CSRF 방어 (필요 시)

```typescript
// src/utils/csrfProtection.ts

/**
 * CSRF 토큰 생성 및 검증
 */
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf-token';

  /**
   * CSRF 토큰 생성
   */
  static generateToken(): string {
    const token = crypto.randomUUID();
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  /**
   * CSRF 토큰 검증
   */
  static validateToken(token: string): boolean {
    const stored = sessionStorage.getItem(this.TOKEN_KEY);
    return stored === token;
  }

  /**
   * API 요청에 CSRF 토큰 추가
   */
  static addTokenToRequest(headers: Headers): void {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    if (token) {
      headers.set('X-CSRF-Token', token);
    }
  }
}
```

---

## 7. 민감 데이터 처리

### 7.1 환경 변수 보안

```bash
# .env (로컬 개발)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ 절대 커밋하지 말 것:
# - Service Role Key (서버에서만 사용)
# - Database 비밀번호
# - API Secret Key
```

```.gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 7.2 클라이언트 로깅 금지

```typescript
// ❌ 나쁜 예 - 민감 정보 로깅
console.log('User token:', user.access_token);
console.log('Password:', password);

// ✅ 좋은 예 - 안전한 로깅
console.log('User logged in:', user.email);
console.log('Login attempt for user');
```

### 7.3 비밀번호 처리

```typescript
// ❌ 절대 금지
// - 비밀번호를 평문으로 저장
// - 비밀번호를 로그에 기록
// - 비밀번호를 URL 파라미터로 전송

// ✅ Supabase Auth가 자동 처리
// - bcrypt 해싱
// - HTTPS 통신
// - 안전한 저장
```

---

## 8. API 보안

### 8.1 Rate Limiting

```typescript
// Supabase는 기본 Rate Limiting 제공
// - 익명 요청: 분당 60회
// - 인증 요청: 분당 300회

// 클라이언트 측 Rate Limiting (추가)
// src/utils/rateLimiter.ts

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // 윈도우 밖의 요청 제거
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// 사용 예시
if (!rateLimiter.isAllowed('createTask', 10, 60000)) {
  throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
}
```

### 8.2 HTTPS 강제

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    https: process.env.NODE_ENV === 'production',
  },
});

// HTTP -> HTTPS 리다이렉트 (프로덕션)
if (window.location.protocol === 'http:' && process.env.NODE_ENV === 'production') {
  window.location.href = window.location.href.replace('http:', 'https:');
}
```

---

## 9. 보안 헤더

### 9.1 추천 보안 헤더

```typescript
// Vercel/Netlify에서 자동 설정되지만 명시적으로 정의

// vercel.json 또는 netlify.toml
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

---

## 10. 보안 체크리스트

### 개발 단계
- [ ] 환경 변수 .env 파일 사용
- [ ] 민감 정보 로깅 금지
- [ ] 입력 검증 및 새니타이제이션
- [ ] React의 기본 XSS 보호 활용
- [ ] Supabase RLS 정책 테스트

### 배포 전
- [ ] HTTPS 강제 활성화
- [ ] CSP 헤더 설정
- [ ] 보안 헤더 확인
- [ ] Rate Limiting 테스트
- [ ] 세션 타임아웃 동작 확인

### 운영 단계
- [ ] 정기적인 의존성 업데이트
- [ ] 보안 패치 즉시 적용
- [ ] 접근 로그 모니터링
- [ ] 비정상 활동 감지
- [ ] 정기적인 보안 감사

---

## 11. 보안 테스트

### 11.1 자동화된 보안 스캔

```bash
# npm audit로 취약점 스캔
pnpm audit

# 심각한 취약점만 확인
pnpm audit --audit-level=high

# 자동 수정 (주의: 호환성 확인 필요)
pnpm audit fix
```

### 11.2 OWASP ZAP 스캔 (권장)

```bash
# Docker로 OWASP ZAP 실행
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5173
```

---

## 12. 보안 사고 대응

### 12.1 보안 사고 발생 시 절차

1. **즉시 조치**
   - 영향받은 서비스 격리
   - 침해된 계정 비활성화
   - 의심스러운 활동 로그 수집

2. **조사 및 분석**
   - 침해 범위 파악
   - 원인 분석
   - 영향받은 데이터 확인

3. **복구**
   - 취약점 패치
   - 데이터 복구 (백업)
   - 보안 정책 강화

4. **사후 관리**
   - 사고 보고서 작성
   - 재발 방지 대책 수립
   - 관련자 교육

---

**문서 버전**: 1.0
**작성일**: 2025-11-09
**최종 수정**: 2025-11-09
**작성자**: 개발팀
**다음 검토 예정**: 2026-02-09 (3개월 후)
