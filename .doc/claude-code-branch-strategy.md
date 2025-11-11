# Claude Code 브랜치 전략 설정 가이드

> 최종 업데이트: 2025-11-11

## 개요

본 문서는 Claude Code 웹버전에서 작업 시 `develop` 브랜치를 기본 브랜치로 사용하도록 설정하는 방법을 안내합니다.

## 브랜치 전략

### 기본 브랜치 구조

```
main (프로덕션)
  └── develop (개발)
       └── feature/xxx (기능 개발)
       └── fix/xxx (버그 수정)
       └── claude/xxx (Claude Code AI 작업)
```

- **main**: 프로덕션 배포용 안정 브랜치
- **develop**: 개발 통합 브랜치 (기본 작업 브랜치)
- **feature/**, **fix/**, **claude/**: develop에서 분기한 작업 브랜치

## GitHub 기본 브랜치 설정 방법

### 1. GitHub 웹사이트에서 설정

1. GitHub repository 페이지로 이동
   ```
   https://github.com/bearholmes/a11y-my-works
   ```

2. **Settings** 탭 클릭

3. 왼쪽 사이드바에서 **General** 선택 (기본 페이지)

4. **Default branch** 섹션 찾기

5. 브랜치 이름 옆의 **Switch to another branch** 버튼 클릭

6. `develop` 브랜치 선택

7. **Update** 버튼 클릭

8. 확인 대화상자에서 **I understand, update the default branch.** 클릭

### 2. GitHub CLI로 설정 (선택사항)

```bash
gh repo edit --default-branch develop
```

## Claude Code 웹버전에서의 동작

### 자동 인식

GitHub의 기본 브랜치가 `develop`으로 설정되면:

✅ **Claude Code가 자동으로 인식합니다**

- 새로운 작업 시 `develop` 브랜치에서 분기
- PR 생성 시 `develop`을 target 브랜치로 설정
- `claude/xxx-sessionId` 형식의 브랜치가 `develop`에서 생성됨

### 작업 흐름

1. **GitHub 이슈 또는 작업 요청**
   - Claude Code는 자동으로 `develop` 브랜치를 확인

2. **새 브랜치 생성**
   ```
   develop → claude/feature-name-sessionId
   ```

3. **작업 완료 후 PR 생성**
   ```
   claude/feature-name-sessionId → develop (PR)
   ```

4. **리뷰 및 머지**
   ```
   develop ← 머지 완료
   ```

5. **릴리스 준비 시**
   ```
   develop → main (릴리스 PR)
   ```

## 브랜치 보호 규칙 설정 (권장)

### main 브랜치 보호

1. **Settings** → **Branches** → **Add branch protection rule**

2. Branch name pattern: `main`

3. 권장 설정:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1개 이상)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators (선택)

### develop 브랜치 보호 (선택)

1. Branch name pattern: `develop`

2. 권장 설정:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging (CI/CD가 있는 경우)

## 로컬 개발자 설정

### Git 설정 업데이트

로컬에서 작업하는 개발자들은 다음과 같이 설정을 업데이트합니다:

```bash
# develop 브랜치로 전환
git checkout develop

# develop을 기본 업스트림으로 설정
git branch --set-upstream-to=origin/develop develop

# 최신 develop 가져오기
git pull origin develop
```

### 새 기능 브랜치 생성

```bash
# develop에서 새 기능 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 작업 후 푸시
git push -u origin feature/new-feature
```

### PR 생성

```bash
# GitHub CLI 사용 시
gh pr create --base develop --head feature/new-feature
```

## Claude Code 작업 확인

### 현재 브랜치 확인

Claude Code가 올바른 브랜치에서 작업 중인지 확인하려면:

```bash
# 현재 브랜치 확인
git branch --show-current

# 업스트림 브랜치 확인
git rev-parse --abbrev-ref @{upstream}
```

### 예상 출력

```bash
$ git branch --show-current
claude/some-feature-sessionId

$ git rev-parse --abbrev-ref @{upstream}
origin/develop
```

## 문제 해결

### Claude Code가 여전히 main에서 분기하는 경우

1. **GitHub 기본 브랜치 확인**
   ```bash
   git remote show origin | grep 'HEAD branch'
   ```
   - 출력: `HEAD branch: develop` (정상)
   - 출력: `HEAD branch: main` (설정 필요)

2. **GitHub 설정 재확인**
   - GitHub 웹사이트에서 Settings → Default branch 확인

3. **로컬 Git 캐시 갱신**
   ```bash
   git fetch origin
   git remote set-head origin -a
   ```

4. **Claude Code 세션 재시작**
   - 브라우저 새로고침 또는 새 세션 시작

### PR이 잘못된 브랜치를 타겟팅하는 경우

PR 생성 시 target 브랜치를 명시적으로 지정:

```bash
gh pr create --base develop --head claude/feature-sessionId
```

## 체크리스트

설정 완료 확인을 위한 체크리스트:

- [ ] `develop` 브랜치가 원격 저장소에 생성됨
- [ ] GitHub 기본 브랜치가 `develop`으로 설정됨
- [ ] (선택) `main` 브랜치 보호 규칙 설정
- [ ] (선택) `develop` 브랜치 보호 규칙 설정
- [ ] 팀원들에게 브랜치 전략 변경 공지
- [ ] Claude Code 웹에서 테스트 작업 수행 (새 브랜치가 develop에서 분기하는지 확인)

## 현재 상태

- ✅ **develop 브랜치 생성 완료** (2025-11-11)
- ⏳ **GitHub 기본 브랜치 설정 대기** (수동 설정 필요)

## 참고 자료

- [GitHub Docs - Managing the default branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

## 추가 권장사항

### CI/CD 파이프라인 설정

develop 브랜치로 변경 시 CI/CD 설정도 함께 업데이트:

```yaml
# .github/workflows/ci.yml 예시
on:
  push:
    branches:
      - main
      - develop  # develop 브랜치 추가
  pull_request:
    branches:
      - main
      - develop  # develop 브랜치 추가
```

### package.json 스크립트 업데이트 (선택)

브랜치 관련 유용한 스크립트:

```json
{
  "scripts": {
    "branch:sync": "git checkout develop && git pull origin develop",
    "branch:create": "git checkout develop && git pull && git checkout -b",
    "branch:clean": "git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
  }
}
```

## 연락처

브랜치 전략 관련 문의: 프로젝트 관리자
