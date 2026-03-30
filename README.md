# 🏗️ Harness Engineering Template

> **에이전트가 안정적으로 코딩할 수 있는 환경을 먼저 구축하고, 그 위에서 도메인을 얹는다.**

OpenAI Codex 팀의 실전 사례(3명 → 100만 라인, 1,500 PR)와 Anthropic·Google DeepMind의 하네스 엔지니어링 원칙을 기반으로 구축된 **에이전트 코딩 스캐폴드**다.

## 이게 뭔가요?

Claude Code, Cursor, Codex 같은 AI 코딩 에이전트가 **안전하고 일관된 코드**를 생성할 수 있도록 설계된 프로젝트 템플릿이다.

도메인(SaaS, AI 서비스, 데이터 파이프라인 등)에 독립적이며, 새 프로젝트를 시작할 때 이 템플릿에서 **Use this template**을 누르고, 도메인 특화 설정만 추가하면 바로 에이전트 코딩을 시작할 수 있다.

## 포함된 것

| 카테고리 | 파일 | 역할 |
|----------|------|------|
| **진입점** | `CLAUDE.md` | 에이전트의 목차 (~60줄) |
| **가드레일** | `.claude/settings.json` | 권한, 훅, 위험 명령 차단 |
| **서브에이전트** | `.claude/agents/` | code-reviewer, security-reviewer, doc-gardener |
| **슬래시 커맨드** | `.claude/commands/` | /review, /plan, /health, /entropy-check, /create-skill, /refresh-skills |
| **스킬** | `.claude/skills/` | 코드 리뷰, 문서 관리 (도메인 스킬은 직접 추가) |
| **규칙** | `.claude/rules/` | 아키텍처 레이어, TypeScript 규칙 |
| **지식 베이스** | `docs/` | 아키텍처, 컨벤션, 품질 등급, 실행 계획 |
| **강제 메커니즘** | `tools/` | 커스텀 아키텍처 린터, 구조적 테스트, 엔트로피 관리 |
| **CI** | `.github/workflows/` | lint → typecheck → test → structural test |
| **병렬 에이전트** | `.cmux/setup` | cmux 워크트리 초기화 |

## Quick Start

### 1. 템플릿에서 새 프로젝트 생성

GitHub에서 **Use this template** → **Create a new repository**

```bash
git clone <your-new-repo>
cd <your-new-repo>
```

### 2. 초기 설정

```bash
pnpm install
chmod +x tools/hooks/*.sh tools/scripts/*.sh .cmux/setup
```

### 3. 도메인 특화 스킬 생성

```bash
claude
> /create-skill
# Claude가 인터뷰 후 최신 공식 문서에서 스킬을 자동 생성
```

### 4. PRD 작성 & 에이전트 코딩 시작

```bash
claude
> /plan
# Claude가 인터뷰 → docs/plans/active/에 실행 계획 작성
# 계획 확인 후 구현 시작
```

### 5. 검증

```bash
> /review    # 코드 리뷰 (code-reviewer + security-reviewer)
> /health    # 전체 건강 체크
```

## 전체 워크플로

```
┌─────────────────────────────────────────────────────────┐
│  1. Use this template → 새 리포 생성                      │
│  2. /create-skill → 도메인 스킬 생성 (최신 공식 문서 기반)   │
│  3. /plan → PRD/실행 계획 수립                             │
│  4. 에이전트 코딩 시작 (cmux / Agent Teams)                │
│  5. /review → 자동 코드 리뷰                              │
│  6. /health → 건강 체크                                   │
│  7. /entropy-check → 주간 정리 (반복)                      │
└─────────────────────────────────────────────────────────┘
```

## 아키텍처 레이어

```
Types → Config → Repo → Service → Runtime → UI
```

각 레이어는 아래 방향으로만 의존할 수 있다. 역방향은 **커스텀 린터와 구조적 테스트로 기계적 차단**된다.

자세한 내용: [`docs/architecture/overview.md`](docs/architecture/overview.md)

## 도메인 스킬 생성 가이드

미리 만든 스킬은 금방 낡는다. 대신 **최신 공식 문서에서 직접 스킬을 생성하는 워크플로**를 제공한다.

```bash
claude
> /create-skill
# 1. 기술/버전/영역 인터뷰
# 2. Context7 또는 웹에서 최신 공식 문서 수집
# 3. 시니어 레벨 패턴 필터링
# 4. SKILL.md + references/ + examples/ + scripts/ 생성
# 5. Gotchas 섹션 포함 (Breaking Changes + Claude 실수 패턴)
```

자세한 내용: [`docs/guides/domain-skill-setup-guide.md`](docs/guides/domain-skill-setup-guide.md)

## 가드레일

| 레이어 | 메커니즘 | 역할 |
|--------|----------|------|
| PreToolUse Hook | `tools/hooks/block-dangerous-commands.sh` | rm -rf, git push main, 시크릿 읽기 차단 |
| PostToolUse Hook | `tools/hooks/post-edit-lint.sh` | TS/TSX 자동 포맷 |
| Stop Hook | Prompt-based | 테스트 실행 여부, 완료도 검증 |
| Architecture Linter | `tools/linters/architecture-linter.mjs` | 레이어 의존성, 파일 크기, 네이밍 강제 |
| Structural Tests | `tools/structural-tests/architecture.test.ts` | CI에서 불변 조건 검증 |
| Permissions | `.claude/settings.json` | 파일/명령어 접근 제어 |

## 병렬 에이전트 (cmux / Agent Teams)

### cmux (git worktree 기반)

```bash
cmux new feature/auth-api     # 워크트리 1
cmux new feature/user-ui      # 워크트리 2 (동시 진행)
cmux merge feature/auth-api   # 병합
```

### Claude Code Agent Teams (내장)

```bash
claude
> 3명의 팀을 만들어서 병렬로 작업해줘:
> 1번: Types 레이어 스키마 정의
> 2번: Repo 레이어 데이터 접근 구현
> 3번: Service 레이어 비즈니스 로직 구현
```

## 파일 구조

```
.
├── CLAUDE.md                          ← 에이전트 진입점 (목차)
├── .claude/
│   ├── settings.json                  ← 가드레일 설정
│   ├── agents/                        ← 서브에이전트 (3개)
│   ├── commands/                      ← 슬래시 커맨드 (6개)
│   ├── skills/                        ← 스킬 (2개 기본 + 도메인 추가)
│   └── rules/                         ← 파일별 규칙 (2개)
├── docs/
│   ├── architecture/overview.md       ← 레이어 맵
│   ├── conventions/coding.md          ← 코딩 규칙
│   ├── guides/
│   │   └── domain-skill-setup-guide.md ← 스킬 생성 가이드
│   ├── design/_TEMPLATE.md            ← 설계 문서 템플릿
│   ├── quality/grades.md              ← 품질 등급
│   └── plans/                         ← 실행 계획
├── packages/                          ← 레이어별 코드 (도메인 추가 시)
├── tools/
│   ├── hooks/                         ← 가드레일 훅
│   ├── linters/                       ← 커스텀 린터
│   ├── scripts/                       ← 엔트로피 관리
│   └── structural-tests/              ← 아키텍처 테스트
├── .github/workflows/ci.yml           ← CI 파이프라인
├── .cmux/setup                        ← 병렬 에이전트 초기화
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── pnpm-workspace.yaml
```

## 참고 자료

- [하네스 엔지니어링: 에이전트 우선 세계에서 Codex 활용하기](https://openai.com) — OpenAI 내부 팀 사례
- [Effective harnesses for long-running agents](https://anthropic.com) — Anthropic
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices) — 공식 문서
- [Skill Authoring Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) — 공식 문서
- [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — HumanLayer

## License

MIT
