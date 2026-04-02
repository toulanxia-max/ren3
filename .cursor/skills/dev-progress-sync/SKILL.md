---
name: dev-progress-sync
description: Summarizes each completed development change and writes a concise update into 开发进度报告.md. Use when features, bug fixes, scripts, or API changes are implemented and the user wants progress documentation kept current.
---

# Dev Progress Sync

## Purpose
Keep `开发进度报告.md` aligned with actual implementation after each meaningful development task.

## When To Use
- User asks for "总结", "开发进度", "写入报告", "更新文档".
- Any completed feature/fix changes frontend, backend, API, model, script, or startup flow.
- End of a multi-step coding request where changelog visibility matters.

## Required Workflow
1. Collect implemented changes from current task scope.
2. Group by feature area (frontend, backend, API, data model, scripts).
3. Write short, concrete bullets in `开发进度报告.md`:
   - what changed
   - key behavior/result
   - constraints/validation if added
4. Update report date in the footer.
5. Avoid speculative items; only document completed work.

## Output Style In Report
- Use section title: `## 🆕 本轮开发新增功能（YYYY-MM-DD）`
- Keep each item concise and implementation-focused.
- Mark completed items with `✅` in subsection titles.

## Guardrails
- Do not remove historical sections unless user requests cleanup.
- Do not document unimplemented plans.
- If uncertain whether a change is complete, mark as pending in chat, not in report.
