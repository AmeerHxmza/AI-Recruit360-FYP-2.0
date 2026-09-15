# AI-Recruit360 design system

Modern minimal recruitment workspace. The signature is a clear evidence trail: a candidate's application, source evidence, assessment and interview lead to a human decision.

## Layout families
- Marketing: concise product introduction, real recruitment workflow, focused call to action.
- Workspace: navy navigation rail, light canvas, page heading, action toolbar, table or evidence detail.
- Candidate: centered reading column, clear progress, one primary next action.

## Typography and color
Inter for body and controls; Geist for headings; system monospace only for identifiers.
Canvas #F5F7FA; surface #FFFFFF; ink #172B4D; secondary #52637A; border #DEE5EE; action #2459C4; navigation #172B4D.
Colors are semantic CSS variables in frontend/app/tokens.css, exposed to Tailwind in globals.css.
Body 14–16px, metadata 12px, page title 28–32px. Normal headings, no decorative italics.

## Interaction
8px spacing rhythm. 8px input/button corners, 12px large panels. One containment layer. No decorative gradients, floating badges, fake browser chrome, fabricated metrics or always-on notification dots.
Visible focus, semantic labels, accessible dialogs, reduced motion. Mobile down to 320px; tables scroll within their own region.
Success feedback describes a saved change. Failure feedback preserves input and gives a retry path.
Use native HTML elements and existing React components. Do not add a UI framework.

## Scope
The product supports jobs, candidates, applications, assessments, interviews and recruiter decisions. No avatar platform, billing, scheduling service, or distributed queue is required for this FYP.
