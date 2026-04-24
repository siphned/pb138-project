# AI-Assisted Development

## How LLMs Work

### Tokens

LLMs read **tokens**, not words.

```
"unhelpful"    → ["un", "help", "ful"]
"useState"     → ["use", "State"]
"<button>"     → ["<", "button", ">"]
```

- Roughly **3/4 of a word** on average
- ~750 words ≈ 1000 tokens
- **Code tokenizes less efficiently** than prose

**Implication:** You pay per token. Context is limited.

---

## Context Window

Your model's **working memory** — everything it can "see" at once.

```
┌─────────────────────────────────────────────┐
│ Context Window (e.g., 200K tokens)          │
│                                             │
│ System prompt │ CLAUDE.md │ Your question │ ← You are here
└─────────────────────────────────────────────┘
```

- When context is full, **earlier content is dropped**
- `CLAUDE.md` lives at the top (high priority)
- Keep it **lean, not bloated** — bloated docs reduce quality
- Bigger window = more files visible, better decisions

---

## System Prompt

Hidden instructions the model sees before your question.

```
[System Prompt - Hidden from you]
"You are a helpful coding assistant.
 Always use TypeScript. Follow ESLint rules.
 Prefer React hooks over class components."

[Your Question]
"Add a dark mode toggle"

[Model Response]
(follows the system prompt)
```

- **CLAUDE.md is injected into the system prompt** — that's why it works
- The system prompt **counts against** your context window
- Tools like Claude Code add their own system prompt on top

---

## Attention — Context is Power

Every token **attends to every other token** — the model connects distant references.

```tsx
function calculateTotal(items) {  // ← defined here
  return items.reduce(...)
}

// 300 lines later...
const result = calculateTotal(cart) // ← model connects these
```

- **Longer context = better understanding**
- Pasting full files gives better results than snippets
- The model can track long-range dependencies

---

## Hallucinations

LLMs predict the **most probable next token** — they don't "know" facts.

```tsx
import { useSomething } from "@tanstack/react-query";
//       ^^^^^^^^^^^^^ doesn't exist! But plausible.
```

**Why it happens:**
- No strong signal in training data
- Confident wrong answer (the model "believes" it)
- Never "runs" code — pattern-matches

**Defense:**
- Always verify code before shipping
- Run the code
- Use **Context7 MCP** to give AI live library documentation
- Check dependencies exist before installing

---

## Prompting Techniques

| Technique | Example | Why |
|---|---|---|
| **Chain-of-thought** | "Think step by step" | Improves complex logic |
| **Few-shot examples** | Show desired format | Model follows pattern |
| **Constraints** | "Use only stdlib" | Prevents hallucinated deps |
| **Specificity** | File names, frameworks | Better than vague descriptions |
| **Lean context** | CLAUDE.md is concise | Quality over quantity |

**Better prompts → better output.**

---

## AI Coding Approaches

```
Manual      Completion   Chat         Agentic      Autonomous
Coding      (Copilot)    (ChatGPT)    (Claude Code) (Vision)
│           │            │            │             │
You write   AI suggests  You ask,     AI operates  AI does
everything  next lines   AI answers   in your code everything

Control ────────────────────────────────────────→ Speed
```

Most developers use 2-3 depending on the task:
- **Completion** — quick line suggestions while coding
- **Chat** — learning, exploration, one-off snippets
- **Agentic** — full features, multi-file edits, running tests

---

## Vibe Coding vs. Agentic Coding

### Vibe Coding
```
You:  "make it look nicer"
AI:   [generates 200 lines]
You:  "looks good, ship it"
```

- **Minimal understanding** — you don't read the code
- **Works initially** — vibes are immaculate ✓
- **Fails over time** — week 5 you don't know how anything works
- **Doesn't scale** — technical debt compounds invisibly

### Agentic Coding
```
You:  [write spec]
      "add dark mode:
       - toggle in navbar
       - persist to localStorage
       - system preference fallback"

AI:   [implements across 4 files, adds tests]
You:  [review diff, evaluate, accept/reject]
```

- **You define what and why** — AI handles how and where
- **You evaluate every output** against your mental model
- **You own the spec** → you own the outcome
- **Scales** — you understand the decisions, can evolve the feature

**Vibe coding is a feeling. Agentic coding is a discipline.**

---

## CLAUDE.md — Your AI's Manual

The file Claude reads **before doing anything**.

```markdown
# Project: WineMarket

## Stack
- Frontend: React + Vite, TanStack Router, shadcn/ui, Tailwind
- Backend: Elysia + Bun, PostgreSQL + Drizzle ORM
- API: OpenAPI + Kubb for type generation

## Key Patterns
- File-based routing under `src/routes/`
- Repository → Service → Route layers
- Zod for validation (shared FE/BE)
- Always use generated Kubb hooks, never fetch manually

## Commands
- `bun dev` — start dev server
- `bun run generate` — regenerate Kubb types
- `bun run db:migrate` — apply migrations
- `bun run lint` — check code quality

## What NOT to do
- Don't hardcode URLs — use `Route.useNavigate()`
- Don't add new dependencies — ask first
- Don't manually write fetch code — regenerate with Kubb
- Don't soft-delete without adding `deletedAt` column
```

**Keep it lean.** Research shows bloated context files **reduce** success rates and increase costs by 20%+. Only include universal rules.

---

## MCP — Model Context Protocol

An open protocol connecting LLMs to **external tools**.

```
Claude Code ←→ MCP Server ←→ External System
```

Examples:
- **Context7** — live library documentation
- **Playwright** — browser automation
- **GitHub** — access PRs, issues, repos
- **Figma** — view designs
- **Slack** — send messages

Configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["@context7/mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

MCP turns Claude from "text in, text out" into an **agent that interacts with the world**.

---

## Skills — Reusable Workflows

Skills are **version-controlled, shareable prompts** for common tasks.

```bash
/commit              ← writes conventional commit message
/feature-dev         ← guided feature development workflow
/tdd                 ← test-driven development loop
/code-review         ← reviews code for quality and safety
```

Each skill encodes **best practices** into repeatable workflows. Skills enforce discipline — they prevent jumping to code before understanding the problem.

---

## Hooks — Automation

Shell commands that run **before or after** Claude's tool calls.

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "bunx biome format --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
      }]
    }]
  }
}
```

- Auto-format after every edit
- Run tests before accepting changes
- Audit logging of AI actions

---

## Workflow: Spec-Driven Development

Structure for building features with AI:

1. **Brainstorming** — explore requirements, write spec
2. **Writing Plans** — break spec into implementation steps
3. **Implementation** — execute plan (AI does the heavy lifting)
4. **Code Review** — verify quality and correctness

Each step produces an **artifact** (spec, plan, code, review).

---

## Security Risks

### Hallucinations in Dependencies

AI models **hallucinate package names**. Attackers register fake packages with malware.

```bash
# AI suggests:
npm install react-helper-utils
# ^^^ doesn't exist — but an attacker just registered it
```

**Defense:** Always verify dependencies exist before installing.

### Code Generation Risks

- **Auth/crypto code** — AI frequently generates insecure patterns
- **Complex logic** — lacks business context, higher risk of logic errors
- **Performance** — optimizes for "works", not efficiency
- **Architecture** — copies patterns, ignores trade-offs

**Rule:** Use AI for ~70% (fast). The last 30% (correctness, security, edge cases) is where engineers matter.

---

## When to Trust AI

| Use Case | Trust Level | Why |
|---|---|---|
| **Boilerplate** | ✅ High | Repetitive, easy to verify |
| **Styling/UI** | ✅ High | Visual feedback, errors obvious |
| **Data transformation** | ✅ High | Logic is straightforward |
| **Tests** | ✅ High | Easy to run and verify |
| **Business logic** | ⚠️ Medium | Needs context, easy to miss edge cases |
| **Auth/crypto** | ❌ Low | Security-critical, hallucinations dangerous |
| **Dependency choices** | ❌ Low | Hallucination risk, supply chain attacks |

---

## AI Tools in 2026

| Tool | Type | Notable |
|---|---|---|
| **GitHub Copilot** | Completion + Agent | Inline suggestions, 300 premium reqs/month |
| **Cursor** | Full IDE | 1M+ users, deep AI, fork of VS Code |
| **Claude Code** | CLI Agent | Skills, hooks, MCP, subagents |
| **Windsurf** | Full IDE | Acquired by Cognition (Devin makers) |
| **Antigravity** | Agent-first IDE | Free, built-in browser, multi-agent |

---

## Best Practices

### Plan First
Always ask for a step-by-step plan before coding. Forces thinking before implementation.

### Review Diffs
Read code changes as diffs. Spot-check logic, edge cases, security.

### Tight Loop
Generate → review → fix → **commit**. Incremental progress, not big rewrites.

### Use CLAUDE.md
Make it your guardrails. Only strict, enforceable rules. Keep it minimal.

### Leverage Tooling
Rely on TypeScript, tests, linters. They catch more than reviews.

### Add Constraints
"Don't add dependencies", "follow patterns", "no third-party auth yet"

### Prefer Minimal Changes
Avoid "smart" rewrites unless needed. Small, focused PRs.

### Use AI for Review
Bugs, edge cases, production risks. AI finds what humans miss.

---

## The 70/30 Rule

**AI gets you 70% fast.**
The last 30% — **correctness, security, edge cases** — is where engineers matter most.

> "AI-augmented software engineering, not automated software engineering." — Addy Osmani

You are **still the engineer**. The AI is a **power tool**.

---

## Related Pages

- [REACT.md](REACT.md) — React patterns for AI-friendly code
- [REST_API.md](REST_API.md) — API design that's easy to specify and generate
- [ROUTING.md](ROUTING.md) — Routing architecture for large apps
