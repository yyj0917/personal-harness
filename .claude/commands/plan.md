---
description: Create a structured execution plan before implementing complex features
---

Before writing any code, create an execution plan:

1. Ask me to describe the feature or task in detail. Use the AskUserQuestion tool to interview me about requirements, constraints, and edge cases.

2. Write the plan as a markdown file in `docs/plans/active/<feature-name>.md` with this structure:
   ```
   # Plan: <Feature Name>
   Status: 🟡 In Progress
   Created: <date>
   
   ## Goal
   <1-2 sentence description>
   
   ## Requirements
   <bullet list from interview>
   
   ## Architecture Impact
   <which layers are affected, any new packages needed>
   
   ## Implementation Steps
   <numbered, ordered steps — each should be a single PR-sized unit>
   
   ## Test Strategy
   <what tests are needed>
   
   ## Open Questions
   <anything unresolved>
   
   ## Decision Log
   <decisions made during implementation, with reasoning>
   ```

3. Review the plan with me before starting implementation.

4. As implementation progresses, update the Decision Log section with any changes from the original plan.
