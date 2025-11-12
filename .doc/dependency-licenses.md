# 라이브러리 의존성 라이센스 분석

> 최종 업데이트: 2025-11-11

## 개요

본 문서는 a11y-my-works 프로젝트에서 사용 중인 모든 의존성 라이브러리의 라이센스 정보를 정리한 문서입니다.

## 라이센스 요약

### 주요 프로덕션 의존성

| 패키지 | 버전 | 라이센스 | 용도 |
|--------|------|----------|------|
| react | 19.2.0 | MIT | UI 프레임워크 |
| react-dom | 19.2.0 | MIT | React DOM 렌더러 |
| react-router-dom | 7.9.5 | MIT | 라우팅 |
| @tanstack/react-query | 5.90.7 | MIT | 서버 상태 관리 |
| jotai | 2.15.1 | MIT | 클라이언트 상태 관리 |
| @supabase/supabase-js | 2.80.0 | MIT | Supabase 클라이언트 SDK |
| react-hook-form | 7.66.0 | MIT | 폼 관리 |
| @hookform/resolvers | 5.2.2 | MIT | 폼 유효성 검사 리졸버 |
| zod | 4.1.12 | MIT | 스키마 유효성 검사 |
| date-fns | 4.1.0 | MIT | 날짜 처리 |
| ofetch | 1.5.1 | MIT | HTTP 클라이언트 |

### 주요 개발 의존성

| 패키지 | 버전 | 라이센스 | 용도 |
|--------|------|----------|------|
| typescript | 5.9.3 | Apache-2.0 | TypeScript 컴파일러 |
| vite | 7.2.2 | MIT | 빌드 도구 |
| @vitejs/plugin-react | 5.1.0 | MIT | Vite React 플러그인 |
| tailwindcss | 4.1.17 | MIT | CSS 프레임워크 |
| @tailwindcss/vite | 4.1.17 | MIT | Tailwind Vite 플러그인 |
| @biomejs/biome | 2.3.4 | MIT OR Apache-2.0 | 린터 및 포매터 |
| husky | 9.1.7 | MIT | Git hooks |
| lint-staged | 16.2.6 | MIT | 스테이징된 파일 린팅 |

## 라이센스별 분류

### MIT License (대다수)

MIT 라이센스는 가장 허용적인(permissive) 오픈소스 라이센스 중 하나입니다.

**특징:**
- ✅ 상업적 사용 가능
- ✅ 수정 및 재배포 가능
- ✅ 사유 소프트웨어에 포함 가능
- ✅ 라이센스 및 저작권 고지만 포함하면 됨
- ❌ 보증 없음

**주요 패키지:**
- React 생태계 전체 (react, react-dom, react-router-dom)
- TanStack Query, Jotai
- Supabase SDK
- React Hook Form, Zod
- date-fns, ofetch
- Vite, Tailwind CSS
- 대부분의 Babel, Rollup 관련 패키지

**총 패키지 수:** 약 140개

---

### Apache License 2.0

Apache 2.0은 특허권 보호 조항이 포함된 허용적 라이센스입니다.

**특징:**
- ✅ 상업적 사용 가능
- ✅ 수정 및 재배포 가능
- ✅ 특허권 명시적 부여
- ✅ 변경사항 명시 필요
- ❌ 상표 사용 불가

**주요 패키지:**
- typescript (5.9.3)
- detect-libc
- baseline-browser-mapping

**총 패키지 수:** 3개

---

### MIT OR Apache-2.0 (듀얼 라이센스)

MIT와 Apache 2.0 중 선택 가능한 듀얼 라이센스입니다.

**특징:**
- ✅ 두 라이센스 중 하나를 선택하여 사용 가능
- ✅ 프로젝트에 맞는 라이센스 선택 가능

**주요 패키지:**
- @biomejs/biome (2.3.4)
- @biomejs/cli-linux-x64
- @biomejs/cli-linux-x64-musl

**총 패키지 수:** 3개

---

### MPL-2.0 (Mozilla Public License 2.0)

MPL 2.0은 파일 단위 카피레프트 라이센스입니다.

**특징:**
- ✅ 상업적 사용 가능
- ⚠️ 파일 단위 카피레프트 (해당 파일 수정 시 공개 필요)
- ✅ 다른 파일은 독점 라이센스 가능
- ✅ 특허권 보호

**주요 패키지:**
- lightningcss (dev)
- lightningcss-linux-x64-gnu (dev)
- lightningcss-linux-x64-musl (dev)

**총 패키지 수:** 3개

---

### ISC License

ISC는 MIT와 기능적으로 동일한 허용적 라이센스입니다.

**특징:**
- ✅ MIT와 거의 동일
- ✅ 더 간결한 문구

**주요 패키지:**
- semver
- picocolors
- graceful-fs (dev)
- lru-cache
- electron-to-chromium
- signal-exit (dev)
- yallist
- yaml (dev)

**총 패키지 수:** 8개

---

### BSD-3-Clause

BSD 3-Clause는 광고 조항이 제거된 허용적 라이센스입니다.

**특징:**
- ✅ MIT와 유사하게 허용적
- ✅ 저작자 이름을 광고에 사용 금지

**주요 패키지:**
- source-map-js (dev)

**총 패키지 수:** 1개

---

### CC-BY-4.0 (Creative Commons Attribution 4.0)

데이터 라이센스로, 저작자 표시만 하면 자유롭게 사용 가능합니다.

**특징:**
- ✅ 자유로운 사용 및 재배포
- ✅ 저작자 표시 필요
- ⚠️ 코드보다는 데이터에 적합

**주요 패키지:**
- caniuse-lite (브라우저 호환성 데이터)

**총 패키지 수:** 1개

---

### 0BSD (Zero-Clause BSD)

가장 허용적인 라이센스 중 하나로, 사실상 퍼블릭 도메인에 가깝습니다.

**특징:**
- ✅ 라이센스 고지도 불필요
- ✅ 완전한 자유

**주요 패키지:**
- tslib

**총 패키지 수:** 1개

---

## 라이센스 호환성 분석

### 상업적 사용

✅ **모든 라이센스가 상업적 사용을 허용합니다.**

### 라이센스 의무사항

| 라이센스 | 라이센스 고지 | 변경사항 문서화 | 소스코드 공개 |
|----------|---------------|-----------------|---------------|
| MIT | 필수 | 권장 | 불필요 |
| Apache-2.0 | 필수 | 필수 | 불필요 |
| MIT OR Apache-2.0 | 필수 | 선택적 | 불필요 |
| MPL-2.0 | 필수 | 필수 | 수정 파일만 |
| ISC | 필수 | 권장 | 불필요 |
| BSD-3-Clause | 필수 | 권장 | 불필요 |
| CC-BY-4.0 | 저작자 표시 | 권장 | 불필요 |
| 0BSD | 불필요 | 불필요 | 불필요 |

### 주의사항

1. **MPL-2.0 (lightningcss)**
   - lightningcss는 Tailwind CSS의 내부 의존성으로 사용됨
   - 우리가 직접 lightningcss 코드를 수정하지 않는 한 문제없음
   - 만약 lightningcss를 수정할 경우, 해당 파일의 소스코드 공개 필요

2. **라이센스 고지**
   - 프로덕션 빌드 시 모든 라이센스 고지를 포함해야 함
   - LICENSES.txt 또는 NOTICE 파일 생성 권장

3. **TypeScript (Apache-2.0)**
   - 개발 의존성이므로 프로덕션 배포에 포함되지 않음
   - 빌드 과정에서만 사용되므로 특별한 의무사항 없음

## 권장사항

### 1. 라이센스 고지 파일 생성

프로젝트 루트에 `LICENSES.txt` 또는 `NOTICE` 파일을 생성하여 모든 의존성의 라이센스를 고지하는 것을 권장합니다.

```bash
# 자동으로 라이센스 파일 생성
pnpm licenses list --long > LICENSES.txt
```

### 2. 프로덕션 빌드에 라이센스 포함

웹 애플리케이션의 경우, 일반적으로 다음 위치에 라이센스 정보를 제공합니다:
- `/about` 또는 `/licenses` 페이지
- 앱 설정의 "오픈소스 라이센스" 섹션
- `public/licenses.txt` 파일

### 3. 정기적인 라이센스 감사

의존성 업데이트 시마다 라이센스 변경사항을 확인합니다:

```bash
pnpm licenses list
```

### 4. 라이센스 자동 검사

CI/CD 파이프라인에 라이센스 검사를 추가하여 허용되지 않은 라이센스를 가진 패키지가 추가되는 것을 방지할 수 있습니다.

## 결론

본 프로젝트에서 사용하는 모든 라이브러리는 상업적 사용이 가능한 허용적(permissive) 라이센스를 사용하고 있습니다.

**핵심 요구사항:**
1. ✅ 모든 라이센스가 상업적 사용 허용
2. ✅ 소스코드 공개 의무 없음 (MPL-2.0 파일 수정 시 제외)
3. ⚠️ 라이센스 고지 필요 (0BSD 제외)
4. ✅ 사유 소프트웨어에 포함 가능

**법적 리스크:** 낮음

단, 프로덕션 배포 시 적절한 라이센스 고지를 포함하는 것을 권장합니다.

## 참고 자료

- [Open Source Initiative - Licenses](https://opensource.org/licenses)
- [Choose a License](https://choosealicense.com/)
- [TLDRLegal - Software Licenses Explained](https://tldrlegal.com/)
- [SPDX License List](https://spdx.org/licenses/)

## 업데이트 이력

- 2025-11-11: 초기 문서 작성 (pnpm licenses list 기반)
