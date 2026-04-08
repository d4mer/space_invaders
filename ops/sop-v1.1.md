# Agentic Coding Team SOP

## Team Roles + Model Mapping
- Planner: openai/gpt-5.4
- Worker: minimax-coding-plan/MiniMax-M2.7
- Worker fallback: openai/gpt-5.4
- Reviewer: openai/gpt-5.4
- QA: opencode/minimax-m2.5-free
- Ops: omlxmini/omlxmini/qwen3.5-9b
- Security: openai/gpt-5.4

## Required Packet Fields
1. Task ID
2. Goal
3. Scope In / Scope Out
4. Likely Files/Modules
5. Acceptance Criteria
6. Risk level
7. Deadline or priority
8. Escalation trigger
9. Budget

## Execution Flow
Planner -> Worker -> Reviewer -> Security if needed -> QA -> Ops

## Quality Gates
- acceptance criteria met
- tests updated where behavior changed
- reviewer sign-off present
- security scan passed for medium/high risk
- rollback note present for non-trivial changes
