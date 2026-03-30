# 도메인 특화 스킬 셋업 가이드

> 이 가이드는 **스킬 자체가 아니라 "스킬을 만드는 방법"**을 다룬다.
> 기술은 빠르게 변하기 때문에 미리 만든 스킬은 금방 낡는다.
> 대신 최신 공식 문서에서 직접 스킬을 생성하는 워크플로를 익히면,
> 어떤 도메인이든 항상 최신 상태의 실전급 스킬을 만들 수 있다.

---

## 1. 스킬의 해부학

스킬은 **폴더**다. 파일이 아니다.

```
.claude/skills/my-skill/
├── SKILL.md              ← 진입점 (500줄 이하, 에이전트가 처음 읽는 파일)
├── references/           ← 심화 문서 (필요할 때만 로드)
│   ├── patterns.md
│   └── api-reference.md
├── scripts/              ← 결정론적 스크립트 (실행됨, 컨텍스트에 로드 안 됨)
│   └── validate.sh
└── examples/             ← 예시 코드 (필요할 때만 로드)
    ├── good.ts
    └── bad.ts
```

### Progressive Disclosure (점진적 공개)

에이전트의 컨텍스트 윈도우는 희소 리소스다. 스킬의 핵심 원칙:

1. **세션 시작 시**: SKILL.md의 `name` + `description`만 로드 (~100토큰)
2. **스킬이 관련될 때**: SKILL.md 본문 전체 로드 (<5,000토큰)
3. **심화가 필요할 때**: references/ 내 특정 파일만 로드

→ 100개 스킬을 설치해도 실제로 사용되는 스킬만 컨텍스트를 차지한다.

---

## 2. SKILL.md 작성 원칙

### Frontmatter (YAML 헤더)

```yaml
---
name: nextjs-app-router
description: >
  Use when creating or modifying Next.js App Router pages, layouts,
  server components, or route handlers. Triggers on: "page", "route",
  "layout", "server component", "RSC", "next.js", "app router".
---
```

**description은 트리거다, 요약이 아니다.** 모델이 "이 스킬을 로드할까?"를 판단하는 유일한 근거이므로, **"언제 발동해야 하는가?"** 관점에서 작성한다.

### 본문 구조

```markdown
# [스킬 이름]

## 핵심 원칙
(이 스킬이 Claude의 기본 동작에서 벗어나게 만드는 것만 적는다)

## 워크플로
(목표와 제약 조건을 주되, 단계별 처방은 하지 않는다)

## 참조 자료
→ references/patterns.md: [어떤 내용이 들어있는지 한 줄 설명]
→ references/api-reference.md: [한 줄 설명]
→ examples/: [좋은 예 / 나쁜 예 설명]

## Gotchas
(가장 높은 시그널. Claude가 반복적으로 틀리는 것들을 누적 기록)
- ❌ [Claude가 자주 하는 실수]
- ✅ [올바른 방법]
```

### 핵심 규칙

| 규칙 | 이유 |
|------|------|
| SKILL.md 500줄 이하 | 컨텍스트 윈도우 보호 |
| 당연한 걸 적지 않는다 | Claude의 기본 동작을 바꾸는 것만 적는다 |
| 처방하지 않고 목표+제약을 준다 | Claude에게 자율성을 주어야 더 나은 결과 |
| Gotchas 섹션 필수 | 가장 레버리지 높은 콘텐츠 |
| 스크립트를 포함한다 | Claude가 재구성하지 않고 조합하게 한다 |
| 린터 역할을 시키지 않는다 | 린터는 hooks/로, 스킬은 판단이 필요한 것만 |

---

## 3. 최신·실전급 스킬을 만드는 워크플로

### Step 1: 공식 문서에서 최신 패턴 수집

**Context7 MCP 활용 (가장 권장)**

프로젝트에 Context7 MCP가 연결되어 있으면 Claude Code에서 바로 최신 문서를 가져올 수 있다:

```
# Claude Code에서:
> Next.js 15 App Router의 최신 라우팅 패턴을 Context7에서 조회해서
> .claude/skills/nextjs-routing/references/patterns.md에 정리해줘
```

Context7은 공식 문서의 최신 버전을 실시간으로 가져오므로 **스킬이 항상 최신 상태**를 유지할 수 있다.

**수동 수집 시**

```bash
# Claude Code에서 웹 검색 + 공식 문서 크롤링
> Next.js 15 App Router의 공식 문서에서 Server Components 베스트 프랙티스를
> 검색하고, 핵심 패턴을 references/server-components.md에 정리해줘.
> 소스 URL도 포함해.
```

**수집 우선순위:**
1. 공식 문서 (nextjs.org/docs, react.dev, tailwindcss.com 등)
2. 프레임워크 공식 블로그 / 릴리스 노트
3. 프레임워크 메인테이너의 글 (Lee Robinson, Dan Abramov 등)
4. 검증된 커뮤니티 리소스 (awesome-* 레포, 공식 examples)

**피해야 할 것:**
- 6개월 이상 된 블로그 글 (특히 빠르게 변하는 프레임워크)
- "Best practices" 제목의 일반론 (구체적 코드 패턴이 없는 것)
- StackOverflow 답변 (버전 불일치가 심함)

### Step 2: 시니어 레벨의 패턴 필터링

수집한 문서에서 **시니어 개발자가 실제로 적용하는 패턴**만 추출한다.
Claude Code에 이렇게 요청:

```
> 수집한 references/에서 다음 기준으로 패턴을 필터링해줘:
>
> 1. 스케일 가능한가? (100개 컴포넌트에서도 작동하는 패턴인가)
> 2. 에러 핸들링이 포함되어 있는가?
> 3. 타입 안전성이 보장되는가?
> 4. 테스트 가능한 구조인가?
> 5. 프레임워크의 공식 권장 방식인가?
>
> 이 기준을 통과하지 못하는 패턴은 references/에서 제거하고,
> 통과한 패턴만 SKILL.md의 핵심 원칙 섹션에 요약해줘.
```

### Step 3: Gotchas 수집

**초기 Gotchas는 세 곳에서 수집:**

1. **프레임워크 마이그레이션 가이드** — 버전 업그레이드 시 깨지는 것들
2. **GitHub Issues의 "bug" 라벨** — 가장 많이 보고되는 문제
3. **직접 실험** — Claude에게 작업을 시키고, 틀리는 것을 기록

```
> Next.js 15에서 Next.js 14와 달라진 Breaking Changes를 정리하고,
> Claude가 습관적으로 14 패턴으로 코드를 생성할 수 있는 부분을
> Gotchas 섹션에 추가해줘.
```

**이후 Gotchas는 실전에서 누적:**

코드 리뷰 중 Claude가 틀린 것이 발견되면:
```
> 이 실수를 .claude/skills/nextjs-routing/SKILL.md의 Gotchas에 추가해줘:
> - ❌ [Claude가 한 실수]
> - ✅ [올바른 방법]
```

이것이 **피드백 루프**다. 시간이 지날수록 스킬의 품질이 올라간다.

### Step 4: 예시 코드 (Good vs Bad)

```
.claude/skills/my-skill/examples/
├── good-server-component.tsx   ← 이렇게 해야 한다
├── bad-server-component.tsx    ← 이렇게 하면 안 된다 (+ 왜 안 되는지 주석)
└── good-error-boundary.tsx
```

Claude는 **인컨텍스트 러너**다. 기존 코드 패턴을 학습하므로, 좋은 예시/나쁜 예시를 제공하면 새 코드 생성 시 좋은 패턴을 따른다.

### Step 5: 검증 스크립트

스킬이 생성한 코드를 자동 검증하는 스크립트를 포함한다:

```bash
# .claude/skills/my-skill/scripts/validate.sh
#!/bin/bash
# 생성된 컴포넌트가 규칙을 준수하는지 검증

FILE=$1

# "use client" 디렉티브 없이 useState를 사용하면 실패
if grep -q "useState\|useEffect\|useContext" "$FILE"; then
  if ! head -1 "$FILE" | grep -q "'use client'"; then
    echo "❌ Client hooks detected without 'use client' directive"
    exit 1
  fi
fi

echo "✅ Validation passed"
```

---

## 4. 스킬 생성 실전 예시

"Next.js 15 App Router" 스킬을 만드는 전체 흐름:

```bash
# 1. 스킬 디렉터리 생성
mkdir -p .claude/skills/nextjs-app-router/{references,scripts,examples}

# 2. Claude Code에서 최신 문서 수집
claude
> Context7에서 Next.js 15 App Router 공식 문서를 가져와서
> .claude/skills/nextjs-app-router/references/에 정리해줘:
> - routing.md: 라우팅 패턴
> - data-fetching.md: 서버 컴포넌트 데이터 페칭
> - caching.md: 캐싱 전략
> - error-handling.md: 에러 처리 패턴

# 3. 시니어 패턴 필터링 + SKILL.md 생성
> 수집한 references/를 바탕으로 SKILL.md를 작성해줘.
> 핵심 원칙은 시니어 레벨 패턴만, Gotchas는 v14→v15 Breaking Changes 포함.
> description은 트리거 관점으로 작성하고, 500줄 이하로.

# 4. Good/Bad 예시 생성
> references/를 참고해서 examples/에 good/bad 예시 코드를 만들어줘.
> good: 올바른 서버 컴포넌트 패턴
> bad: 흔한 실수 (클라이언트 훅을 서버 컴포넌트에서 사용 등)

# 5. 검증 스크립트 생성
> scripts/validate.sh를 만들어줘.
> 서버/클라이언트 컴포넌트 분리, 디렉티브 검증 등.
```

---

## 5. 추천 도메인 스킬 세트

네 스택(Next.js 15, React 19, Tailwind v4, React Query, Drizzle ORM, NeonDB)을
기준으로, 아래 스킬들을 위 워크플로로 생성하면 된다:

### 프론트엔드

| 스킬 이름 | 트리거 | 핵심 내용 |
|-----------|--------|-----------|
| `nextjs-app-router` | page, route, layout, RSC | 라우팅 패턴, 서버/클라이언트 분리, 캐싱 |
| `react-components` | component, UI, form, state | React 19 패턴, use() 훅, Server Actions |
| `tailwind-styling` | style, design, responsive, UI | Tailwind v4 유틸리티, 테마, 반응형 |

### 데이터 레이어

| 스킬 이름 | 트리거 | 핵심 내용 |
|-----------|--------|-----------|
| `drizzle-schema` | schema, migration, DB, table | Drizzle ORM 스키마 정의, 마이그레이션 |
| `react-query-data` | query, mutation, cache, fetch | React Query v5 패턴, 캐시 전략 |
| `api-design` | API, endpoint, route handler | Route Handlers, Server Actions, tRPC |

### 인프라

| 스킬 이름 | 트리거 | 핵심 내용 |
|-----------|--------|-----------|
| `vercel-deploy` | deploy, production, preview | Vercel 설정, 환경변수, Edge Runtime |
| `neondb-ops` | database, connection, pool | NeonDB 연결 패턴, 서버리스 풀링 |

### 각 스킬을 위 워크플로대로 만들면:
```
claude
> /plan
> "nextjs-app-router 스킬을 만들거야. Context7에서 최신 문서를 가져와서
>  시니어 레벨 패턴으로 필터링하고, Gotchas와 good/bad 예시를 포함해서
>  .claude/skills/nextjs-app-router/에 완성해줘."
```

---

## 6. 스킬 유지보수 사이클

스킬은 **살아있는 문서**다. 정기적으로 업데이트해야 한다.

### 언제 업데이트하는가

| 트리거 | 액션 |
|--------|------|
| 코드 리뷰에서 Claude 실수 발견 | → Gotchas에 추가 |
| 프레임워크 메이저 업데이트 | → references/ 전체 재수집 |
| 새로운 공식 패턴 발표 | → references/ 해당 파일 업데이트 |
| 3개월 경과 | → 전체 freshness check |

### 자동화

```bash
# .claude/commands/refresh-skills.md
> 모든 스킬의 references/ 파일을 Context7에서 최신 버전으로 업데이트해줘.
> 변경사항이 있으면 SKILL.md의 Gotchas도 함께 업데이트하고,
> 변경 내역을 docs/plans/completed/skill-refresh-YYYY-MM-DD.md에 기록해줘.
```

---

## 7. 최종 체크리스트

새 도메인 스킬을 만들 때마다 확인:

- [ ] description이 **트리거 관점**으로 작성되었는가?
- [ ] SKILL.md가 **500줄 이하**인가?
- [ ] **공식 문서**를 소스로 사용했는가? (블로그나 SO가 아닌)
- [ ] **Gotchas 섹션**이 있는가?
- [ ] **Good/Bad 예시**가 examples/에 있는가?
- [ ] 린터 역할을 시키고 있지 않은가? (→ hooks로 이동)
- [ ] Claude의 기본 동작을 **변경하는 것만** 적었는가?
- [ ] references/에 **심화 문서**가 분리되어 있는가?
