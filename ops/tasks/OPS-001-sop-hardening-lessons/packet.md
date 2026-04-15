# Task Packet

## Metadata
- Task ID: OPS-001
- Title: Document lessons learned and harden SOP gates
- Priority: high
- Deadline: TBD
- Risk: medium
- Owner model: omlx/qwen3-coder
- Reviewer model: openai/gpt-5.4
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)
Capture workflow lessons from this project and tighten the repo-local SOP so future tasks require stronger evidence, clearer outputs, and harder completion gates.

## Scope
- In:
  - Document the key workflow failures and fixes learned during this project.
  - Update SOP docs and task templates to require explicit runtime/test evidence when feasible.
  - Strengthen expectations for worker outputs, QA outputs, and completion gates.
  - Keep the changes repo-local and lightweight so they are usable on the next small project.
- Out:
  - Rewriting the entire workflow system.
  - Automating every gate in CI beyond small doc-level improvements.

## Likely Files/Modules
- `ops/sop-v1.1.md`
- `ops/templates/task-packet.md`
- `ops/routing-rules.md`
- `ops/tasks/OPS-001-sop-hardening-lessons/*`
- Optional new repo-local SOP/lessons document if justified

## Acceptance Criteria (testable)
1. The updated SOP explicitly requires actual execution evidence for tests/smoke/build steps when feasible, rather than static analysis alone.
2. The updated templates require workers and QA to report concrete commands/results or explicit execution blockers.
3. The updated SOP documents the main lessons learned from this project in a reusable form for future tasks.
4. The updated packet/template docs are internally consistent and validate cleanly where applicable.

## Test Plan
- Commands:
  - Review updated SOP docs and task template for required sections.
  - Validate the updated OPS-001 packet if modified.
- Expected outcomes:
  - SOP and templates clearly define stronger gates and output requirements.
  - Future tasks can reuse the tightened checklist without ambiguity.

## Dependencies
- Existing repo-local SOP/task assets only.

## Constraints
- Keep the process practical for small projects.
- Prefer specific, enforceable rules over generic process language.
- Preserve compatibility with the current task packet structure unless a small extension is clearly useful.

## Escalation Trigger
- If the proposed process becomes too heavyweight for routine small-project work, or if wider automation/CI redesign is needed.

## Budget
- Time cap: 1 focused documentation pass
- Attempt cap (max 2): 2
- Token/cost cap (optional): TBD
