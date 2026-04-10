# Task Packet

## Metadata
- Task ID: BUG-002
- Title: regularize-loss-trigger
- Priority: high
- Deadline: none
- Risk: low
- Owner model: omlx/qwen3-coder
- Reviewer model: omlx/qwen3-coder
- QA model: opencode/minimax-m2.5-free

## Goal (1 sentence)

Regularize the current uncommitted loss-trigger change so it is validated and, if needed, refined through the proper delegated workflow.

## Scope
- In: review and refinement of the current uncommitted `game.js` loss-trigger change, plus task artifacts for this regularization task
- Out: unrelated gameplay changes, new features, or broad smoke-test rewrites

## Likely Files/Modules
- `game.js`
- `ops/tasks/BUG-002-regularize-loss-trigger/`

## Acceptance Criteria (testable)
1. The current uncommitted loss-trigger change is either validated as correct or minimally refined by the worker.
2. Reviewer and QA both assess the regularized change through the delegated workflow.
3. Task artifacts clearly state that this task regularizes a prior planner-direct edit.

## Test Plan
- Commands: use the live game or debug/smoke hooks to verify that the loss trigger now fires before visible base overlap and that restart still works
- Expected outcomes: the regularized change behaves correctly and the task artifacts reflect worker/reviewer/QA outcomes

## Dependencies

Current uncommitted `game.js` loss-trigger edit already present in the repo.

## Constraints

Keep the regularization bounded to the direct edit already made. Do not broaden scope.

## Escalation Trigger

If the current direct edit is fundamentally wrong and must be replaced rather than refined.

## Budget
- Time cap: 20 minutes
- Attempt cap (max 2): 1
- Token/cost cap (optional): n/a
