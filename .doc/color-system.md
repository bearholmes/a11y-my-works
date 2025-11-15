# 색상 시스템 가이드

## 개요

본 프로젝트는 Catalyst 디자인 시스템의 색상 패턴을 따릅니다. 모든 색상 사용은 의미론적이어야 하며, 일관성을 유지해야 합니다.

## Demo 기반 색상 패턴

### 1. Lime (연두)
**용도**: 성공, 완료, 활성 상태, 증가

**사용 예시:**
- 완료율 100% Badge
- 활성화된 사용자/서비스
- 승인 완료 상태
- 증가하는 통계 수치 (+)
- "On Sale" 등 활성 상태

```tsx
<Badge color="lime">활성</Badge>
<Badge color="lime">100%</Badge>
<Stat change="+12%" /> {/* 내부적으로 lime 사용 */}
```

### 2. Zinc (회색)
**용도**: 기본값, 중립 상태, 비활성, 분류 정보

**사용 예시:**
- 역할, 플랫폼, 청구 그룹 등 분류 정보
- 비활성 상태
- 프로젝트명, 서비스명 등 일반 정보
- 기본 텍스트 색상
- 완료율 80% 이하 (중립)

```tsx
<Badge color="zinc">관리자</Badge>
<Badge color="zinc">WEB</Badge>
<Badge color="zinc">비활성</Badge>
```

### 3. Red/Pink (빨강/분홍)
**용도**: 경고, 감소, 실패, 미완료

**사용 예시:**
- 완료율 50% 미만
- 미완료 업무
- 감소하는 통계 수치 (-)
- 에러 상태
- 거부/삭제 액션

```tsx
<Badge color="red">미완료</Badge>
<Badge color="red">30%</Badge>
<Stat change="-5%" /> {/* 내부적으로 pink 사용 */}
```

### 4. Yellow/Amber (노랑/호박색)
**용도**: 진행 중, 주의, 대기

**사용 예시:**
- 완료율 50-80%
- 승인 대기 상태
- 진행 중인 작업
- 주의가 필요한 상태

```tsx
<Badge color="yellow">승인 대기</Badge>
<Badge color="yellow">65%</Badge>
```

### 5. Purple (보라)
**용도**: 특별한 강조, 특정 기능

**사용 예시:**
- 업무보고 필수 사용자
- 특별한 권한이나 기능
- 아바타 배경

```tsx
<Badge color="purple">업무보고 필수</Badge>
<Avatar className="bg-purple-500" />
```

### 6. Green (초록)
**용도**: 일반적인 완료/통과 (lime보다 약한 성공)

**사용 예시:**
- 일반적인 완료 상태
- 통과한 검증

```tsx
<Badge color="green">완료</Badge>
```

## 포커스 및 접근성

**Blue (파란)**: 포커스 outline 전용
- 일반 UI 색상으로 사용 금지
- `outline-blue-500`, `data-focus:`, `focus:` 스타일에만 사용
- 접근성을 위해 유지 필수

```tsx
// ✅ 올바른 사용
className="focus:outline-blue-500"

// ❌ 잘못된 사용
<Badge color="blue">...</Badge>
className="bg-blue-600"
```

## 색상 변경 히스토리

### 2025-01-16: Demo 패턴 적용

**수정된 파일:**
1. **AdminDashboard.tsx**
   - 완료율 100% Badge: green → lime
   - 완료율 80% Badge: blue → zinc
   - 완전 작성 사용자 Stat: green → lime

2. **MemberList.tsx**
   - 역할 Badge: blue → zinc
   - 승인 버튼: green → lime

3. **ProjectList.tsx**
   - 플랫폼 Badge: 조건부(blue/lime/purple) → zinc

4. **ServiceList.tsx**
   - 청구 그룹 Badge: purple → zinc

5. **Profile.tsx**
   - 활성 상태 Badge: green → lime

## 컴포넌트별 색상 가이드

### Badge
```tsx
// 성공/활성
<Badge color="lime">활성</Badge>

// 중립/정보
<Badge color="zinc">역할명</Badge>

// 경고/실패
<Badge color="red">비활성</Badge>

// 진행 중
<Badge color="yellow">대기</Badge>

// 특별 강조
<Badge color="purple">특별</Badge>
```

### Stat
```tsx
// 증가 (자동으로 lime)
<Stat change="+12%" />

// 감소 (자동으로 pink)
<Stat change="-5%" />

// 변화 없음 (자동으로 zinc)
<Stat change="0%" />
```

### 버튼
```tsx
// 주요 액션
<Button color="dark">저장</Button>

// 긍정 액션
<Button color="lime">승인</Button>

// 부정 액션
<Button color="red">삭제</Button>

// 일반 액션
<Button color="zinc">취소</Button>
```

## 주의사항

1. **의미론적 사용**: 색상은 시각적 선호도가 아닌 의미에 따라 선택
2. **일관성 유지**: 같은 의미는 항상 같은 색상 사용
3. **접근성 고려**: 색상만으로 정보를 전달하지 말고 텍스트도 함께 제공
4. **Blue 금지**: 포커스 outline 외에는 blue 사용 금지
5. **Demo 참조**: 불확실할 경우 `demo/src/` 디렉토리 참조

## 참고 파일

- Demo Badge 컴포넌트: `demo/src/components/badge.tsx`
- Demo Stat 컴포넌트: `demo/src/app/stat.tsx`
- 프로젝트 Badge 컴포넌트: `src/components/ui/badge.tsx`
- 프로젝트 Stat 컴포넌트: `src/components/Stat.tsx`
