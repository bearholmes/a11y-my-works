# 디자인 시스템 분석 및 개편 계획

> 작성일: 2025-11-14
> 대상: 업무 보고 시스템 (a11y-my-works)

## 📋 목차

1. [개요](#개요)
2. [현재 구조 분석](#현재-구조-분석)
3. [컴포넌트 인벤토리](#컴포넌트-인벤토리)
4. [디자인 시스템 특징](#디자인-시스템-특징)
5. [Demo 애플리케이션 분석](#demo-애플리케이션-분석)
6. [개편 방향 및 계획](#개편-방향-및-계획)
7. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 개요

현재 프로젝트는 React 19 기반의 업무 보고 시스템으로, Headless UI와 Tailwind CSS v4를 활용한 접근성 우선 디자인 시스템을 구축하고 있습니다. `demo/` 디렉토리에는 완성된 데모 애플리케이션이 있으며, 이를 참고하여 메인 프로젝트에 디자인 시스템을 적용하는 것이 목표입니다.

### 주요 목표

- ✅ Demo의 레이아웃 패턴을 메인 프로젝트에 적용
- ✅ 일관된 UI/UX 제공
- ✅ 접근성(a11y) 표준 준수
- ✅ 반응형 디자인 구현
- ✅ 다크모드 지원

---

## 현재 구조 분석

### 디렉토리 구조

```
a11y-my-works/
├── src/
│   └── components/
│       └── ui/                    # 메인 UI 컴포넌트 라이브러리 (27개)
│           ├── alert.tsx
│           ├── auth-layout.tsx
│           ├── avatar.tsx
│           ├── badge.tsx
│           ├── button.tsx
│           ├── checkbox.tsx
│           ├── combobox.tsx
│           ├── description-list.tsx
│           ├── dialog.tsx
│           ├── divider.tsx
│           ├── dropdown.tsx
│           ├── fieldset.tsx
│           ├── heading.tsx
│           ├── input.tsx
│           ├── link.tsx
│           ├── listbox.tsx
│           ├── navbar.tsx
│           ├── pagination.tsx
│           ├── radio.tsx
│           ├── select.tsx
│           ├── sidebar-layout.tsx
│           ├── sidebar.tsx
│           ├── stacked-layout.tsx
│           ├── switch.tsx
│           ├── table.tsx
│           ├── text.tsx
│           └── textarea.tsx
│
└── demo/
    └── src/
        ├── app/                   # Next.js App Router 구조
        │   ├── (app)/             # 인증된 영역
        │   │   ├── page.tsx       # Dashboard
        │   │   ├── events/        # 이벤트 관리
        │   │   ├── orders/        # 주문 관리
        │   │   └── settings/      # 설정
        │   ├── (auth)/            # 인증 페이지
        │   │   ├── login/
        │   │   ├── register/
        │   │   └── forgot-password/
        │   ├── layout.tsx
        │   ├── logo.tsx
        │   └── stat.tsx
        ├── components/            # Demo용 컴포넌트 (ui와 동일)
        ├── styles/
        │   └── tailwind.css       # Tailwind v4 설정
        └── data.ts                # Mock 데이터
```

### 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **프레임워크** | React | 19 | UI 라이브러리 |
| **UI 라이브러리** | Headless UI | latest | 접근성 우선 컴포넌트 |
| **스타일링** | Tailwind CSS | v4 | 유틸리티 우선 CSS |
| **빌드 도구** | Vite | 7 | 개발 서버 & 빌드 |
| **타입 시스템** | TypeScript | latest | 정적 타입 검사 |
| **애니메이션** | motion/react | latest | 애니메이션 라이브러리 |
| **유틸리티** | clsx | latest | 클래스명 조합 |

---

## 컴포넌트 인벤토리

### 레이아웃 컴포넌트 (4개)

| 컴포넌트 | 파일명 | 용도 | 주요 기능 |
|---------|--------|------|----------|
| **SidebarLayout** | `sidebar-layout.tsx` | 사이드바 기반 레이아웃 | - Navbar + Sidebar + Main content<br/>- 반응형 지원<br/>- 모바일 메뉴 토글 |
| **StackedLayout** | `stacked-layout.tsx` | 스택 레이아웃 | - 수직 구조<br/>- 간단한 페이지용 |
| **AuthLayout** | `auth-layout.tsx` | 인증 페이지 레이아웃 | - 로그인/회원가입 페이지<br/>- 중앙 정렬 카드 |
| **Navbar** | `navbar.tsx` | 네비게이션 바 | - 상단 고정 헤더<br/>- 반응형 메뉴 |

### 폼 컴포넌트 (8개)

| 컴포넌트 | 파일명 | 특징 | 접근성 |
|---------|--------|------|--------|
| **Input** | `input.tsx` | - 다양한 타입 지원<br/>- 에러 상태 표시 | ARIA labels |
| **Textarea** | `textarea.tsx` | - Auto-resize 옵션<br/>- 문자 수 제한 | ARIA labels |
| **Select** | `select.tsx` | - Native select 스타일링 | Native 접근성 |
| **Checkbox** | `checkbox.tsx` | - Headless UI 기반<br/>- 커스텀 디자인 | ARIA checked |
| **Radio** | `radio.tsx` | - 라디오 그룹<br/>- 커스텀 스타일 | ARIA radio |
| **Switch** | `switch.tsx` | - 토글 스위치<br/>- 애니메이션 | ARIA switch |
| **Combobox** | `combobox.tsx` | - 자동완성<br/>- 검색 기능 | ARIA combobox |
| **Listbox** | `listbox.tsx` | - 드롭다운 선택<br/>- 키보드 탐색 | ARIA listbox |

### 디스플레이 컴포넌트 (9개)

| 컴포넌트 | 파일명 | 용도 | 스타일 특징 |
|---------|--------|------|-----------|
| **Table** | `table.tsx` | 데이터 테이블 | - 반응형<br/>- Hover 효과<br/>- 클릭 가능한 행 |
| **Badge** | `badge.tsx` | 상태 라벨 | - 18가지 색상<br/>- 크기 변형 |
| **Avatar** | `avatar.tsx` | 사용자 아바타 | - 이미지/이니셜<br/>- 크기 옵션 |
| **Alert** | `alert.tsx` | 알림 메시지 | - 성공/에러/경고<br/>- 닫기 버튼 |
| **Divider** | `divider.tsx` | 구분선 | - 수평/수직 |
| **Heading** | `heading.tsx` | 제목 | - 레벨별 크기<br/>- Semantic HTML |
| **Text** | `text.tsx` | 본문 텍스트 | - 다양한 크기<br/>- 색상 옵션 |
| **DescriptionList** | `description-list.tsx` | 키-값 리스트 | - 정의 목록<br/>- 반응형 |
| **Fieldset** | `fieldset.tsx` | 폼 그룹 | - Legend 포함<br/>- 접근성 |

### 인터랙티브 컴포넌트 (4개)

| 컴포넌트 | 파일명 | 기능 | 애니메이션 |
|---------|--------|------|----------|
| **Button** | `button.tsx` | - 3가지 variant (solid/outline/plain)<br/>- 18가지 색상<br/>- 링크 모드 | Hover 효과 |
| **Dropdown** | `dropdown.tsx` | - 메뉴 드롭다운<br/>- Compound components | Fade in/out |
| **Dialog** | `dialog.tsx` | - 모달<br/>- Escape 닫기<br/>- Backdrop | Scale + Fade |
| **Pagination** | `pagination.tsx` | - 페이지 탐색<br/>- 이전/다음 버튼 | - |

### 네비게이션 컴포넌트 (2개)

| 컴포넌트 | 파일명 | 특징 |
|---------|--------|------|
| **Link** | `link.tsx` | - React Router 통합<br/>- 외부 링크 처리 |
| **Sidebar** | `sidebar.tsx` | - 계층적 메뉴<br/>- 현재 페이지 표시<br/>- 애니메이션 |

---

## 디자인 시스템 특징

### 1. 접근성 우선 (a11y First)

**Headless UI 활용:**
- WAI-ARIA 패턴 자동 적용
- 키보드 탐색 지원
- 스크린 리더 호환

**TouchTarget 구현:**
```tsx
// src/components/ui/button.tsx:194
export function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  )
}
```
- 모바일에서 최소 44×44px 터치 영역 보장
- `pointer-fine` 미디어 쿼리로 데스크톱에서는 숨김

### 2. CSS Variables 기반 테마 시스템

**Tailwind v4 @theme 지시자:**
```css
/* demo/src/styles/tailwind.css */
@import 'tailwindcss';

@theme {
  --font-sans: Inter, sans-serif;
  --font-sans--font-feature-settings: 'cv11';
}
```

**컴포넌트별 CSS Variables:**
```tsx
// Button 컴포넌트 예시
const styles = {
  colors: {
    'dark/zinc': [
      'text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90',
      '[--btn-hover-overlay:var(--color-white)]/10',
      '[--btn-icon:var(--color-zinc-400)]',
    ],
    // ... 18가지 색상 정의
  }
}
```

**다크모드 지원:**
- `dark:` prefix로 다크모드 스타일 정의
- CSS Variables로 동적 테마 전환
- 자동 시스템 테마 감지

### 3. Compound Component 패턴

**Sidebar 예시:**
```tsx
<Sidebar>
  <SidebarHeader>
    {/* 헤더 콘텐츠 */}
  </SidebarHeader>

  <SidebarBody>
    <SidebarSection>
      <SidebarItem href="/">
        <HomeIcon />
        <SidebarLabel>Home</SidebarLabel>
      </SidebarItem>
    </SidebarSection>
  </SidebarBody>

  <SidebarFooter>
    {/* 푸터 콘텐츠 */}
  </SidebarFooter>
</Sidebar>
```

**장점:**
- 명시적이고 읽기 쉬운 구조
- 유연한 조합 가능
- 타입 안정성

### 4. 반응형 디자인

**Tailwind Breakpoints:**
- `sm:` - 640px 이상
- `md:` - 768px 이상
- `lg:` - 1024px 이상
- `xl:` - 1280px 이상

**적용 예시:**
```tsx
// button.tsx:11
'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]'
```

### 5. 타입 안정성

**고급 TypeScript 패턴:**
```tsx
// button.tsx:161-168
type ButtonProps = (
  | { color?: keyof typeof styles.colors; outline?: never; plain?: never }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
) & { className?: string; children: React.ReactNode } & (
    | ({ href?: never } & Omit<Headless.ButtonProps, 'as' | 'className'>)
    | ({ href: string } & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>)
  )
```

**특징:**
- Discriminated Union으로 상호 배타적 props 강제
- `forwardRef`로 Ref 전달 지원
- Generic으로 다형성 구현

---

## Demo 애플리케이션 분석

### 페이지 구조

#### 1. Dashboard (Home)
**파일:** `demo/src/app/(app)/page.tsx`

**구성 요소:**
- **Stats Grid:** 4개의 통계 카드 (총 수익, 평균 주문액, 판매 티켓 수, 페이지뷰)
- **Period Selector:** 기간 선택 드롭다운
- **Recent Orders Table:** 최근 주문 목록 테이블

**특징:**
- 그리드 레이아웃: `sm:grid-cols-2 xl:grid-cols-4`
- 각 Stat 카드에 Badge로 변화율 표시
- Table에서 클릭 가능한 행 (TableRow에 href)

**코드 구조:**
```tsx
<>
  <Heading>Good afternoon, Erica</Heading>
  <Subheading>Overview</Subheading>
  <Select name="period">...</Select>

  <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
    <Stat title="Total revenue" value="$2.6M" change="+4.5%" />
    {/* 3개 더 */}
  </div>

  <Table>
    <TableHead>...</TableHead>
    <TableBody>
      {orders.map((order) => (
        <TableRow href={order.url}>...</TableRow>
      ))}
    </TableBody>
  </Table>
</>
```

#### 2. Events 페이지
**파일:** `demo/src/app/(app)/events/page.tsx`

**특징:**
- 이벤트 목록 테이블
- 상태 Badge (On Sale / Closed)
- 이미지 썸네일 + Avatar 컴포넌트

#### 3. Orders 페이지
**파일:** `demo/src/app/(app)/orders/page.tsx`

**특징:**
- 주문 목록 테이블
- 헤더에 "Create order" 버튼
- 고객 정보 + 이벤트 정보 표시

**주문 상세 페이지:**
- `orders/[id]/page.tsx`: 주문 상세 정보
- `orders/[id]/refund.tsx`: 환불 처리 폼

#### 4. Settings 페이지
**파일:** `demo/src/app/(app)/settings/page.tsx`

**특징:**
- 폼 컴포넌트 종합 예시
- Fieldset으로 그룹화
- 주소 입력 (address.tsx 컴포넌트)

#### 5. Auth 페이지
**파일:** `demo/src/app/(auth)/login/page.tsx` 등

**특징:**
- AuthLayout 사용
- 중앙 정렬 카드
- 로그인/회원가입/비밀번호 찾기

### ApplicationLayout 분석

**파일:** `demo/src/app/(app)/application-layout.tsx`

**구조:**
```tsx
<SidebarLayout
  navbar={
    <Navbar>
      <NavbarSpacer />
      <Dropdown>
        <Avatar />
        <AccountDropdownMenu />
      </Dropdown>
    </Navbar>
  }
  sidebar={
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <Avatar src="/teams/catalyst.svg" />
          <SidebarLabel>Catalyst</SidebarLabel>
          {/* 팀 전환 메뉴 */}
        </Dropdown>
      </SidebarHeader>

      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current={pathname === '/'}>
            <HomeIcon />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          {/* Events, Orders, Settings */}
        </SidebarSection>

        <SidebarSection className="max-lg:hidden">
          <SidebarHeading>Upcoming Events</SidebarHeading>
          {events.map(...)}
        </SidebarSection>

        <SidebarSpacer />

        <SidebarSection>
          {/* Support, Changelog */}
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter className="max-lg:hidden">
        <Dropdown>
          <Avatar + 사용자 정보 />
          <AccountDropdownMenu />
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  }
>
  {children}
</SidebarLayout>
```

**주요 패턴:**
1. **Navbar에 사용자 메뉴만 표시** (모바일 대응)
2. **Sidebar에 주 네비게이션**
3. **동적 섹션** (Upcoming Events)
4. **Footer에 사용자 정보** (데스크톱만)
5. **current prop으로 현재 페이지 표시**

### Mock 데이터 구조

**파일:** `demo/src/data.ts`

**주요 함수:**
```typescript
getOrders(): Order[]        // 주문 목록 (25개)
getRecentOrders(): Order[]  // 최근 주문 (10개)
getOrder(id): Order         // 주문 상세
getEvents(): Event[]        // 이벤트 목록 (4개)
getEvent(id): Event         // 이벤트 상세
getEventOrders(id): Order[] // 이벤트별 주문
getCountries(): Country[]   // 국가 목록 (3개)
```

**데이터 관계:**
```
Order
  ├── customer: Customer
  ├── event: Event
  ├── payment: Payment
  └── amount: Amount

Event
  ├── statistics (revenue, tickets, pageViews)
  └── status: "On Sale" | "Closed"
```

---

## 개편 방향 및 계획

### 목표

**"Demo를 참고하여 메인 프로젝트에 적용"**

1. ✅ Demo의 ApplicationLayout을 메인 프로젝트에 적용
2. ✅ Dashboard 페이지 구조 도입
3. ✅ Table 기반 데이터 표시 패턴 적용
4. ✅ 일관된 페이지 레이아웃 구현
5. ✅ 업무 보고 시스템에 맞게 커스터마이징

### 메인 프로젝트 적용 계획

#### Phase 1: 레이아웃 구조 마이그레이션

**작업 항목:**

1. **ApplicationLayout 컴포넌트 생성**
   - 파일: `src/components/Layout.tsx` → `src/layouts/ApplicationLayout.tsx`로 이동
   - Demo의 `application-layout.tsx` 구조 참고
   - Sidebar 메뉴 항목 업무 보고 시스템에 맞게 수정:
     ```tsx
     - Home (대시보드)
     - Tasks (업무 목록)
     - New Task (업무 작성)
     - Team (팀 관리)
     - Settings (설정)
     ```

2. **Navbar 통합**
   - 사용자 프로필 드롭다운
   - 알림 아이콘 (추후)
   - 반응형 메뉴 토글

3. **Sidebar 네비게이션**
   - 현재 페이지 하이라이트
   - 팀/프로젝트 전환 드롭다운
   - 최근 업무 섹션 (Demo의 Upcoming Events 대신)

#### Phase 2: Dashboard 페이지 구현

**작업 항목:**

1. **Stats 컴포넌트 도입**
   - 파일: `demo/src/app/stat.tsx` → `src/components/Stat.tsx`
   - 업무 보고 통계:
     - 이번 주 작성한 업무 수
     - 총 업무 시간
     - 완료된 프로젝트 수
     - 팀 평균 업무 시간

2. **Dashboard 레이아웃**
   - 파일: `src/pages/Dashboard.tsx`
   - 구조:
     ```tsx
     <Heading>안녕하세요, {user.name}님</Heading>
     <Subheading>이번 주 현황</Subheading>
     <Stats Grid />
     <Subheading>최근 업무</Subheading>
     <Table />
     ```

3. **기간 필터**
   - Select 컴포넌트로 주/월/분기 선택
   - 통계 데이터 갱신

#### Phase 3: 업무 목록 페이지

**작업 항목:**

1. **TaskList 페이지 리팩토링**
   - 파일: `src/pages/TaskList.tsx`
   - Demo의 Orders 페이지 구조 참고
   - Table 컴포넌트 사용:
     ```tsx
     <Table>
       <TableHead>
         <TableRow>
           <TableHeader>업무 제목</TableHeader>
           <TableHeader>프로젝트</TableHeader>
           <TableHeader>작성일</TableHeader>
           <TableHeader>소요 시간</TableHeader>
           <TableHeader>상태</TableHeader>
         </TableRow>
       </TableHead>
       <TableBody>
         {tasks.map((task) => (
           <TableRow href={`/tasks/${task.id}`}>
             <TableCell>{task.title}</TableCell>
             <TableCell>
               <Badge>{task.project}</Badge>
             </TableCell>
             <TableCell>{task.date}</TableCell>
             <TableCell>{task.hours}h</TableCell>
             <TableCell>
               <Badge color={statusColor}>{task.status}</Badge>
             </TableCell>
           </TableRow>
         ))}
       </TableBody>
     </Table>
     ```

2. **필터링 및 정렬**
   - 프로젝트별 필터
   - 기간별 필터
   - 정렬 (작성일, 소요 시간)

3. **페이지네이션**
   - Pagination 컴포넌트 적용

#### Phase 4: 업무 작성/수정 폼

**작업 항목:**

1. **TaskForm 페이지 개선**
   - 파일: `src/pages/TaskForm.tsx`
   - Fieldset으로 섹션 분리:
     - 기본 정보 (제목, 프로젝트, 서비스)
     - 업무 내용
     - 시간 정보 (시작/종료 시간)
     - 첨부 파일 (추후)

2. **Form 컴포넌트 활용**
   - Input, Textarea, Select, Combobox
   - 에러 메시지 표시
   - React Hook Form 통합 유지

3. **저장 버튼**
   - Button 컴포넌트의 다양한 variant 활용
   - 저장/임시저장/취소

#### Phase 5: 인증 페이지

**작업 항목:**

1. **LoginForm 리팩토링**
   - 파일: `src/components/LoginForm.tsx`
   - AuthLayout 적용
   - Demo의 login 페이지 스타일 적용

2. **로고 및 브랜딩**
   - `demo/src/app/logo.tsx` 참고
   - 프로젝트 로고 추가

#### Phase 6: 팀 관리 페이지

**작업 항목:**

1. **새 페이지 생성**
   - 파일: `src/pages/TeamManagement.tsx`
   - 팀 멤버 목록 테이블
   - Avatar 컴포넌트 활용

2. **멤버 상세 정보**
   - DescriptionList 컴포넌트 활용
   - 역할, 권한 표시

### 컴포넌트 마이그레이션 우선순위

| 우선순위 | 컴포넌트 | 용도 | 상태 |
|---------|---------|------|------|
| 1 | SidebarLayout | 전체 레이아웃 | ✅ 이미 존재 |
| 1 | Sidebar | 메뉴 네비게이션 | ✅ 이미 존재 |
| 1 | Navbar | 상단 바 | ✅ 이미 존재 |
| 2 | Table | 데이터 표시 | ✅ 이미 존재 |
| 2 | Badge | 상태 표시 | ✅ 이미 존재 |
| 2 | Button | 액션 버튼 | ✅ 이미 존재 |
| 3 | Stat | 통계 카드 | ⚠️ Demo에서 가져오기 |
| 3 | Avatar | 사용자 프로필 | ✅ 이미 존재 |
| 3 | Dropdown | 메뉴 | ✅ 이미 존재 |
| 4 | Dialog | 모달 | ✅ 이미 존재 |
| 4 | Pagination | 페이지 탐색 | ✅ 이미 존재 |
| 5 | Alert | 알림 | ✅ 이미 존재 |

### 스타일 가이드 정의

**파일:** `.doc/style-guide.md` (신규 생성)

**내용:**
1. 색상 팔레트
   - Primary: zinc
   - Success: green
   - Warning: amber
   - Error: red
   - Info: blue

2. 타이포그래피
   - Heading: 3xl/2xl/xl/lg
   - Body: base/sm
   - Caption: xs

3. 간격 (Spacing)
   - Section gap: 8 (2rem)
   - Component gap: 4 (1rem)
   - Inline gap: 2 (0.5rem)

4. 컴포넌트별 사용 가이드
   - 언제 Badge vs Button을 사용할지
   - Table vs Grid 선택 기준
   - Dialog vs Dropdown 사용 시나리오

---

## 마이그레이션 체크리스트

### 준비 단계

- [x] Demo 애플리케이션 분석 완료
- [x] 컴포넌트 인벤토리 작성
- [ ] 스타일 가이드 문서 작성
- [ ] 디자인 토큰 정의 (색상, 타이포그래피, 간격)

### Phase 1: 레이아웃 (예상 시간: 2-3일)

- [ ] `src/layouts/ApplicationLayout.tsx` 생성
- [ ] Sidebar 메뉴 항목 정의
- [ ] Navbar 사용자 드롭다운 구현
- [ ] 현재 페이지 하이라이트 로직
- [ ] 반응형 테스트 (모바일/태블릿/데스크톱)
- [ ] 다크모드 테스트

### Phase 2: Dashboard (예상 시간: 2일)

- [ ] `src/components/Stat.tsx` 컴포넌트 생성
- [ ] Dashboard 페이지 리팩토링
- [ ] 통계 데이터 API 연동
- [ ] 기간 필터 구현
- [ ] 최근 업무 테이블 구현

### Phase 3: 업무 목록 (예상 시간: 2-3일)

- [ ] TaskList 페이지 리팩토링
- [ ] Table 컴포넌트 적용
- [ ] Badge로 상태 표시
- [ ] 필터링 기능 구현
- [ ] 정렬 기능 구현
- [ ] Pagination 적용

### Phase 4: 업무 폼 (예상 시간: 2일)

- [ ] TaskForm 페이지 개선
- [ ] Fieldset으로 섹션 분리
- [ ] Form validation 강화
- [ ] 에러 메시지 UI 개선
- [ ] 저장 버튼 상태 관리

### Phase 5: 인증 (예상 시간: 1일)

- [ ] LoginForm 리팩토링
- [ ] AuthLayout 적용
- [ ] 로고 추가
- [ ] 폼 스타일 통일

### Phase 6: 팀 관리 (예상 시간: 2일)

- [ ] TeamManagement 페이지 생성
- [ ] 멤버 목록 테이블
- [ ] Avatar 컴포넌트 적용
- [ ] 역할/권한 표시
- [ ] 멤버 추가/수정 Dialog

### 테스트 & 최적화 (예상 시간: 2-3일)

- [ ] 접근성 테스트 (WCAG 2.1 AA)
  - [ ] 키보드 탐색
  - [ ] 스크린 리더 (NVDA/VoiceOver)
  - [ ] 포커스 관리
  - [ ] ARIA 라벨
- [ ] 반응형 테스트
  - [ ] 모바일 (375px, 414px)
  - [ ] 태블릿 (768px, 1024px)
  - [ ] 데스크톱 (1280px, 1920px)
- [ ] 브라우저 호환성
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] 성능 최적화
  - [ ] 번들 사이즈 분석
  - [ ] Code splitting
  - [ ] Lazy loading
- [ ] 다크모드 테스트

### 문서화 (진행 중)

- [x] 디자인 시스템 분석 문서
- [ ] 컴포넌트 사용 가이드
- [ ] 스타일 가이드
- [ ] 마이그레이션 로그
- [ ] Storybook 설정 (선택)

---

## 추가 개선 사항

### 단기 개선 (1-2주)

1. **Loading 상태**
   - Skeleton UI 추가
   - Loading spinner 컴포넌트

2. **Empty State**
   - 데이터 없을 때 표시
   - 일러스트레이션 추가

3. **Toast 알림**
   - 성공/에러 메시지 Toast
   - 자동 닫기 기능

4. **검색 기능**
   - 전역 검색 (Cmd+K)
   - Combobox 활용

### 중기 개선 (1개월)

1. **차트 및 그래프**
   - 업무 시간 추이 그래프
   - 프로젝트별 시간 분포
   - Recharts 또는 D3 통합

2. **알림 시스템**
   - 실시간 알림
   - 알림 센터 Dialog
   - 읽음/안읽음 표시

3. **고급 필터링**
   - 다중 필터 조합
   - 저장된 필터
   - 필터 프리셋

4. **엑셀 내보내기**
   - 업무 목록 Excel 다운로드
   - PDF 리포트 생성

### 장기 개선 (2-3개월)

1. **대시보드 커스터마이징**
   - 위젯 추가/제거
   - 드래그 앤 드롭 재배치
   - 사용자별 레이아웃 저장

2. **협업 기능**
   - 업무 댓글
   - 멘션 (@username)
   - 실시간 협업 (WebSocket)

3. **모바일 앱**
   - React Native 또는 PWA
   - 오프라인 지원
   - 푸시 알림

4. **AI 기능**
   - 업무 자동 분류
   - 소요 시간 예측
   - 업무 추천

---

## 참고 자료

### 내부 문서
- `CLAUDE.md` - 프로젝트 가이드
- `.doc/technical-specification.md` - 기술 명세
- `.doc/state-management-design.md` - 상태 관리 전략
- `.doc/database-erd.md` - 데이터베이스 구조

### 외부 자료
- [Headless UI Documentation](https://headlessui.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React 19 Release Notes](https://react.dev/)

### 디자인 참고
- Demo 애플리케이션 (`demo/src`)
- [Catalyst UI Kit](https://tailwindui.com/templates/catalyst) (Demo의 기반)

---

## 결론

현재 프로젝트는 견고한 디자인 시스템 기반을 갖추고 있으며, Demo 애플리케이션의 패턴을 적용하면 빠르게 일관되고 접근성 높은 UI를 구현할 수 있습니다.

**핵심 성공 요인:**
1. ✅ 이미 27개의 고품질 UI 컴포넌트 보유
2. ✅ 접근성 우선 설계 (Headless UI)
3. ✅ 반응형 및 다크모드 기본 지원
4. ✅ 타입 안정성 (TypeScript)
5. ✅ 실제 작동하는 Demo 참고 가능

**예상 일정:**
- 전체 마이그레이션: **약 2-3주**
- MVP (Phase 1-3): **약 1주**
- 완전한 구현 (Phase 1-6 + 테스트): **약 2-3주**

단계별로 진행하며 각 Phase 완료 시 사용자 피드백을 받아 다음 단계에 반영하는 것을 권장합니다.