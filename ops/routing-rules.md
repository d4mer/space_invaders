# Routing Rules

| Task Type | Model | Notes |
| --- | --- | --- |
| Planning / architecture / high risk | openai/gpt-5.4 | planner model |
| Implementation / refactor / fixes | minimax-coding-plan/MiniMax-M2.7 | temporary worker fallback |
| Worker fallback (stuck) | openai/gpt-5.4 | escalate when stuck |
| Review / security audit | openai/gpt-5.4 | temporary review and audit fallback |
| QA verification (runtime evidence gates) | opencode/minimax-m2.5-free | validation with test commands |
| Ops / heartbeat summaries | omlxmini/omlxmini/qwen3.5-9b | summaries |

## Worker Output Contract
Workers must provide:
1. Investigation phase findings (what was analyzed, what issues found)
2. Implementation actions taken with reasoning
3. Validation steps performed (commands run, outputs observed)

## QA Output Contract  
QA must provide:
1. Verification commands used (exact smoke/test run commands)
2. Pass/fail per acceptance criterion
3. Specific blockers or evidence gaps found

## Runtime Evidence Gate
Tasks with acceptance criteria requiring execution MUST include:
- Actual commands used for verification
- Output summary or screenshot proof
- Explicit blocker if execution failed

## Security Scan Proportional Requirements
- Low risk: Optional but recommended
- Medium risk: Required
- High risk: Required with full scan
