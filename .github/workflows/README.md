# GitHub Actions Workflows

이 디렉토리는 프로젝트의 GitHub Actions workflow 파일을 포함합니다.

## Lint Check Workflow

### 기능

`lint.yml` workflow는 다음 기능을 제공합니다:

1. **자동 린트 검사**: PR이 생성되거나 업데이트될 때 자동으로 `biome check` 실행
2. **머지 방지**: 린트 오류가 있으면 workflow가 실패하여 머지 차단
3. **자동 코멘트**: 린트 결과를 PR에 자동으로 코멘트로 추가
   - ❌ 실패 시: 오류 내용과 수정 방법 안내
   - ✅ 성공 시: 성공 메시지 표시
4. **스마트 업데이트**: 기존 봇 코멘트가 있으면 새로 생성하지 않고 업데이트

### 트리거 조건

다음 이벤트에서 자동 실행됩니다:
- PR이 새로 생성될 때 (`opened`)
- PR에 새 커밋이 푸시될 때 (`synchronize`)
- 닫힌 PR이 다시 열릴 때 (`reopened`)

### Branch Protection Rule 설정

린트 검사를 머지 전 필수 조건으로 만들려면:

1. GitHub 저장소 페이지 → **Settings** → **Branches**로 이동
2. **Branch protection rules**에서 **Add rule** 클릭
3. Branch name pattern에 보호할 브랜치 입력 (예: `main`, `develop`)
4. 다음 옵션 활성화:
   - ✅ **Require status checks to pass before merging**
   - 검색창에서 **Lint Check / Run Biome Lint** 선택
   - ✅ **Require branches to be up to date before merging** (선택사항)
5. **Create** 버튼 클릭

### 로컬에서 테스트

PR을 올리기 전에 로컬에서 미리 확인:

```bash
# 린트 오류 확인
pnpm lint

# 자동 수정 가능한 오류 수정
pnpm lint:fix
```

### Workflow 구성

```yaml
name: Lint Check
on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read          # 코드 체크아웃 권한
  pull-requests: write    # PR 코멘트 작성 권한
```

### 주요 단계

1. **코드 체크아웃**: PR의 코드를 가져옴
2. **Node.js & pnpm 설정**: Node.js 20, pnpm 8 설치
3. **캐싱**: pnpm store 캐싱으로 빌드 속도 향상
4. **의존성 설치**: `pnpm install --frozen-lockfile`
5. **린트 실행**: `pnpm lint` 실행 및 결과 저장
6. **PR 코멘트**: 결과를 PR에 자동 코멘트

### 문제 해결

#### Workflow가 실행되지 않는 경우
- `.github/workflows/` 디렉토리가 저장소 루트에 있는지 확인
- YAML 문법 오류가 없는지 확인
- PR이 fork에서 생성된 경우, 저장소 설정에서 "Run workflows from fork pull requests" 권한 확인

#### 코멘트가 생성되지 않는 경우
- 저장소 Settings → Actions → General → Workflow permissions에서
  "Read and write permissions" 권한이 활성화되어 있는지 확인

#### 캐싱이 작동하지 않는 경우
- `pnpm-lock.yaml` 파일이 저장소에 커밋되어 있는지 확인

### 커스터마이징

#### Node.js 버전 변경
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 원하는 버전으로 변경
```

#### pnpm 버전 변경
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 8  # 원하는 버전으로 변경
```

#### 추가 검사 단계 추가
```yaml
- name: Run type check
  run: pnpm tsc --noEmit

- name: Run tests
  run: pnpm test
```

## 향후 개선 사항

- [ ] TypeScript 타입 체크 workflow 추가
- [ ] 테스트 커버리지 리포트 추가
- [ ] 빌드 검증 workflow 추가
- [ ] 자동 배포 workflow 추가 (main 브랜치 머지 시)
