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
2. Goal (1 sentence)
3. Scope In / Scope Out
4. Likely Files/Modules
5. Acceptance Criteria (testable, numbered)
6. Risk level (low / medium / high)
7. Deadline or priority
8. Escalation trigger
9. Budget (time cap, attempt cap)

## Execution Flow
Planner -> Worker -> Reviewer -> Security if needed -> QA -> Ops

## Quality Gates (ALL must be met)
1. **Runtime Evidence Gate**: Actual execution evidence required for tests/smoke/build steps
   - Commands used to run verification
   - Output summary or screenshot proof
   - Explicit blocker if execution failed (not just static analysis)
2. **Acceptance Criteria Met**: All numbered criteria verified
3. **Test Evidence Gate**: Tests updated where behavior changed, with specific commands/results
4. **Worker Output Contract**: Work log includes:
   - Investigation phase findings
   - Implementation actions taken
   - Validation steps performed
5. **QA Output Contract**: QA report includes:
   - Commands used for verification
   - Pass/fail per acceptance criterion
   - Specific blockers or evidence gaps found
6. **Reviewer Sign-off**: Explicit PASS/FAIL with checklist completed
7. **Security Scan**: Passed for medium/high risk tasks (invoked: yes/no + result)
8. **Rollback Note**: Present for non-trivial changes (trigger, method, owner)

## Worker Output Contract
Workers MUST include in worklog:
- Investigation: What was analyzed, what bottlenecks/issues found
- Implementation: Specific changes made with reasoning
- Validation: Commands run, outputs observed, smoke test results

## QA Output Contract
QA MUST include in review:
- Verification commands used (exact commands for smoke/test runs)
- Pass/fail per acceptance criterion
- Specific blockers or evidence gaps found

## Completion Criteria (ALL must be satisfied)
1. Acceptance criteria met with runtime evidence
2. Tests updated where behavior changed (with test commands)
3. Worker output contract satisfied
4. QA verification completed with explicit pass/fail
5. Reviewer sign-off present
6. Security scan passed (if medium/high risk)
7. Rollback note present (if non-trivial change)

## Lessons Learned from Project
1. **Static analysis is insufficient**: Acceptance criteria like "tests pass" require actual execution evidence, not just code review
2. **Unclear output contracts cause rework**: Workers and QA need explicit expectations for what evidence to provide
3. **Incomplete worklogs block troubleshooting**: Investigation phase findings must be documented
4. **Smoke tests need explicit verification steps**: "Game works" is not enough; specific checks required
5. **Rollback notes are often omitted**: Non-trivial changes need explicit rollback guidance

## Lightweight Process for Small Projects
- Keep templates minimal but enforce evidence gates
- Use smoke tests as primary verification where feasible
- Require runtime evidence only for acceptance criteria that need execution
- Keep security scans risk-proportional (low risk: optional, medium/high: required)
