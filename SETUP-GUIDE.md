# 하네스 엔지니어링 셋업 가이드

## 이 스캐폴드는 무엇인가

이 프로젝트는 **도메인에 독립적인 하네스 엔지니어링 기반**이다.
특정 도메인(SaaS, AI 서비스, 데이터 파이프라인 등)이 결정되면 이 기반 위에 도메인 특화 코드만 추가하면 된다.
에이전트(Claude Code, Cursor 등)가 즉시 안정적으로 코딩을 시작할 수 있는 환경이 갖춰져 있다.

---

## 사전 준비

```bash
# 필수 도구 설치
brew install node pnpm git tmux jq

# Claude Code 설치 (아직 없다면)
npm install -g @anthropic-ai/claude-code

# cmux 설치 (병렬 에이전트용, macOS)
# 옵션 A: cmux 터미널 앱 (GUI 기반)
#   → https://cmux.com 에서 다운로드
#
# 옵션 B: cmux CLI (git worktree 기반)
curl -fsSL https://github.com/craigsc/cmux/releases/latest/download/install.sh | sh
```

---

## Phase 1: 리포지터리 초기화

```bash
# 1. 이 스캐폴드를 새 프로젝트로 복사
cp -r harness-scaffold/ my-project/
cd my-project/

# 2. Git 초기화
git init
git add -A
git commit -m "chore: initial harness scaffold"

# 3. 의존성 설치
pnpm install

# 4. 훅 스크립트 실행 권한 부여
chmod +x tools/hooks/*.sh
chmod +x tools/scripts/*.sh
chmod +x .cmux/setup
```

---

## Phase 2: 프로젝트 구조 이해

```
my-project/
├── CLAUDE.md                          ← 에이전트의 진입점 (~60줄 목차)
├── .claude/
│   ├── settings.json                  ← 권한, 훅, 가드레일 설정
│   ├── agents/                        ← 서브에이전트 정의
│   │   ├── code-reviewer.md           ← 코드 리뷰 전문 에이전트
│   │   ├── security-reviewer.md       ← 보안 감사 에이전트
│   │   └── doc-gardener.md            ← 문서 관리 에이전트
│   ├── commands/                      ← 슬래시 커맨드 (/review, /plan 등)
│   │   ├── review.md                  ← /review — 풀 코드 리뷰
│   │   ├── plan.md                    ← /plan — 실행 계획 수립
│   │   ├── health.md                  ← /health — 프로젝트 건강 체크
│   │   └── entropy-check.md           ← /entropy-check — 드리프트 탐지
│   ├── skills/                        ← 에이전트 스킬 (필요 시 로드)
│   │   ├── code-reviewer/SKILL.md
│   │   └── doc-gardener/SKILL.md
│   └── rules/                         ← 파일 패턴별 규칙
│       ├── architecture.md            ← 레이어 의존성 규칙
│       └── typescript.md              ← TS 코딩 규칙
├── docs/                              ← 지식 베이스 (기록 시스템)
│   ├── architecture/overview.md       ← 아키텍처 레이어 맵
│   ├── conventions/coding.md          ← 코딩 컨벤션
│   ├── design/_TEMPLATE.md            ← 설계 문서 템플릿
│   ├── quality/grades.md              ← 도메인별 품질 등급
│   └── plans/
│       ├── active/_TEMPLATE.md        ← 실행 계획 템플릿
│       ├── completed/                 ← 완료된 계획
│       └── tech-debt/                 ← 기술 부채 추적
├── packages/                          ← 레이어별 패키지 (도메인 추가 시 생성)
│   ├── types/                         ← Zod 스키마, 타입 정의
│   ├── config/                        ← 환경 변수, 기능 플래그
│   ├── repo/                          ← 데이터 접근 (DB, API)
│   ├── service/                       ← 비즈니스 로직
│   ├── runtime/                       ← 서버 부팅, 라우팅
│   ├── ui/                            ← 컴포넌트, 페이지
│   └── shared/                        ← 크로스레이어 유틸리티
├── tools/
│   ├── hooks/                         ← Claude Code 가드레일 훅
│   │   ├── block-dangerous-commands.sh
│   │   └── post-edit-lint.sh
│   ├── linters/
│   │   └── architecture-linter.mjs    ← 커스텀 아키텍처 린터
│   ├── scripts/
│   │   └── entropy-check.sh           ← 엔트로피 관리 스크립트
│   └── structural-tests/
│       └── architecture.test.ts       ← 아키텍처 불변 조건 테스트
├── .github/workflows/ci.yml           ← CI 파이프라인
├── .cmux/setup                        ← cmux 워크트리 초기화 훅
├── package.json                       ← 루트 스크립트
├── tsconfig.json                      ← TypeScript 설정
├── vitest.config.ts                   ← 테스트 설정
└── pnpm-workspace.yaml                ← 모노레포 설정
```

---

## Phase 3: 가드레일 동작 확인

### 3-1. 훅 테스트

`.claude/settings.json`에 정의된 훅이 제대로 작동하는지 확인:

```bash
# 위험 명령 차단 테스트
echo '{"tool_input":{"command":"rm -rf /"}}' | bash tools/hooks/block-dangerous-commands.sh
# → {"decision":"block","reason":"Destructive rm -rf..."} 출력되어야 함

# main 직접 push 차단 테스트
echo '{"tool_input":{"command":"git push origin main"}}' | bash tools/hooks/block-dangerous-commands.sh
# → {"decision":"block","reason":"Direct push to main/master..."} 출력되어야 함

# 정상 명령 허용 테스트
echo '{"tool_input":{"command":"ls -la"}}' | bash tools/hooks/block-dangerous-commands.sh
echo $?  # → 0 (허용)
```

### 3-2. 아키텍처 린터 테스트

```bash
node tools/linters/architecture-linter.mjs
# → "✅ Architecture lint passed" 출력 (아직 코드가 없으므로)
```

---

## Phase 4: 도메인 추가 시 워크플로

특정 도메인이 결정되면 이렇게 시작한다:

```bash
# 1. Claude Code 실행
claude

# 2. 계획 수립
> /plan

# 3. Claude가 인터뷰 후 docs/plans/active/에 계획 작성

# 4. 계획 확인 후 구현 시작
> 이 계획대로 구현해줘. packages/ 레이어 구조에 맞춰서.

# 5. 완료 후 리뷰
> /review

# 6. 건강 체크
> /health
```

---

## Phase 5: 병렬 에이전트 워크플로 (cmux)

### 옵션 A: cmux CLI (git worktree 기반)

```bash
# 새 에이전트 워크트리 생성 + Claude Code 실행
cmux new feature/auth-api
# → 독립된 워크트리에서 Claude Code가 실행됨

# 동시에 다른 작업 시작
cmux new feature/user-ui
# → 두 번째 에이전트가 별도 워크트리에서 독립 작업

# 워크트리 간 전환
cmux ls         # 현재 워크트리 목록
cmux attach feature/auth-api   # 특정 에이전트 터미널로 전환

# 작업 완료 후 병합
cmux merge feature/auth-api    # main에 병합
cmux rm feature/auth-api       # 워크트리 정리
```

### 옵션 B: Claude Code Agent Teams (내장 기능)

```bash
# tmux 설치 확인
tmux -V

# ~/.claude.json에 팀 모드 설정
# "teammateMode": "tmux"

# Claude Code에서 팀 생성
claude
> 3명의 팀을 만들어서 병렬로 작업해줘:
> 1번: packages/types/에 User, Auth 스키마 정의
> 2번: packages/repo/에 데이터 접근 레이어 구현
> 3번: packages/service/에 비즈니스 로직 구현
```

### 옵션 C: 수동 tmux 병렬 실행

```bash
# tmux 세션 생성
tmux new-session -d -s harness

# 패널 분할 + 각 패널에서 독립 Claude 실행
tmux split-window -h
tmux send-keys -t harness:0.0 "cd packages/types && claude" C-m
tmux send-keys -t harness:0.1 "cd packages/service && claude" C-m

# tmux 세션 접속
tmux attach -t harness
```

---

## Phase 6: 엔트로피 관리 (주간)

```bash
# 커맨드라인에서 직접 실행
bash tools/scripts/entropy-check.sh

# 또는 Claude Code 내에서
claude
> /entropy-check
```

매주 1회 실행을 권장한다. 기술 부채는 이자가 붙기 전에 조금씩 갚는 것이 효과적이다.

---

## 핵심 파일별 역할 요약

| 파일 | 역할 | 수정 빈도 |
|------|------|-----------|
| `CLAUDE.md` | 에이전트 진입점 — 목차 역할 | 드물게 (구조 변경 시) |
| `.claude/settings.json` | 권한 + 가드레일 훅 | 드물게 |
| `.claude/agents/*.md` | 서브에이전트 정의 | 새 역할 추가 시 |
| `.claude/commands/*.md` | 슬래시 커맨드 | 워크플로 추가 시 |
| `.claude/rules/*.md` | 파일별 규칙 | 패턴 추가 시 |
| `docs/architecture/` | 레이어 맵 | 아키텍처 변경 시 |
| `docs/conventions/` | 코딩 규칙 | 컨벤션 변경 시 |
| `docs/quality/` | 품질 등급 | 자동 업데이트 |
| `docs/plans/` | 실행 계획 | 매 작업마다 |
| `tools/linters/` | 아키텍처 린터 | 규칙 추가 시 |
| `tools/hooks/` | 가드레일 스크립트 | 보안 정책 변경 시 |

---

## 도메인 특화 시 체크리스트

도메인이 결정되면 아래를 순서대로 진행:

- [ ] `docs/plans/active/`에 도메인 계획 작성
- [ ] `packages/types/src/<domain>/`에 Zod 스키마 정의
- [ ] `packages/config/src/`에 환경 변수 추가
- [ ] `packages/repo/src/<domain>/`에 데이터 접근 구현
- [ ] `packages/service/src/<domain>/`에 비즈니스 로직 구현
- [ ] `packages/runtime/src/`에 라우팅/미들웨어 추가
- [ ] `packages/ui/src/<domain>/`에 UI 구현
- [ ] `docs/architecture/overview.md` 업데이트
- [ ] `docs/quality/grades.md`에 새 도메인 등급 추가
- [ ] `/review` 실행하여 전체 검증
- [ ] `/health` 실행하여 건강 체크
