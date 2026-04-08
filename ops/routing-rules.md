# Routing Rules

| Task Type | Model | Notes |
| --- | --- | --- |
| Planning / architecture / high risk | openai/gpt-5.4 | planner model |
| Implementation / refactor / fixes | minimax-coding-plan/MiniMax-M2.7 | temporary worker fallback |
| Worker fallback | openai/gpt-5.4 | escalate when stuck |
| Review / security | openai/gpt-5.4 | temporary review and audit fallback |
| QA verification | opencode/minimax-m2.5-free | validation |
| Ops / heartbeat | omlxmini/omlxmini/qwen3.5-9b | summaries |
