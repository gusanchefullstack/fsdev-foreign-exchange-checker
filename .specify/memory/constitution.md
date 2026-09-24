<!--
Sync Impact Report
==================
Version change: (unratified template) → 1.0.0
Bump rationale: Initial ratification. All template placeholders replaced with project-specific
governance derived from my-sdd-docs/constitution-draft.md.

Modified principles (template slot → new title):
  - [PRINCIPLE_1_NAME] → I. Spec-Driven Development (Zero Shadow Code)
  - [PRINCIPLE_2_NAME] → II. Design Fidelity (Figma Is the Source of Truth)
  - [PRINCIPLE_3_NAME] → III. Specified Data Sources Only
  - [PRINCIPLE_4_NAME] → IV. Friendly, Semantic Error Handling
  - [PRINCIPLE_5_NAME] → V. Simplicity and Consistent Conventions

Added sections:
  - Purpose (preamble, from draft §1 "About the application")
  - Technology Stack & Architecture (template [SECTION_2_NAME])
  - Versioning & Repository Policy (template [SECTION_3_NAME])
  - Governance (filled)

Removed sections: none

Templates reviewed (not modified; they read the constitution at runtime):
  - .specify/templates/plan-template.md ("Constitution Check" gate) ✅ compatible
  - .specify/templates/spec-template.md ✅ compatible
  - .specify/templates/tasks-template.md ✅ compatible

Deferred TODOs: none. Ratification date set to first adoption date (2026-09-24).
Non-governance intents deferred (not executed): initialize local git repo; create GitHub repo(s)
with the "fsdev-" prefix.
-->

# FX Checker (Foreign Exchange Currency Converter) Constitution

## Purpose

This project builds the Frontend Mentor "FX Checker" currency app as close to the provided design
as possible. The app converts between currencies using live exchange rates and offers a
rate-history chart, a multi-currency comparison, pinned favorite pairs, and a running log of
conversions. This constitution governs how that app is specified, designed, built, and versioned.

## Core Principles

### I. Spec-Driven Development (Zero Shadow Code) — NON-NEGOTIABLE

- Implementation MUST cover only behavior documented in the feature's `spec.md`. Features,
  options, or abstractions added "just in case" are prohibited.
- If a user instruction contradicts this constitution, or a logical fault or gap is detected in
  the spec, the agent MUST stop before touching source code, state the conflict, and request that
  `spec.md` (or this constitution) be updated first.
- Every change to source code MUST be traceable to a spec requirement or a task in `tasks.md`.

**Rationale**: The spec is the single contract between the author and the implementer; untracked
code erodes that contract and makes the project harder to verify and maintain.

### II. Design Fidelity (Figma Is the Source of Truth)

- The Figma file in `/figma-design` (`*.fig`) is authoritative for CSS styles, colors, spacing,
  typography, and responsive layouts. Its "Design" and "Design System" pages MUST be consulted for
  styling details.
- Design details MUST be retrieved through the Figma Desktop MCP connection rather than guessed.
- The Figma designs define the expected output for mobile, tablet, and desktop. Responsive
  best practices MUST be applied between those breakpoints without deviating from the Figma specs.
- Images and SVGs MUST come from the project assets folder; when an asset is missing there, it
  MUST be taken from the Figma file.

**Rationale**: The challenge is judged on visual accuracy; a single authoritative design source
prevents drift and subjective styling decisions.

### III. Specified Data Sources Only

- Application data MUST come exclusively from the APIs defined in the spec.
- Introducing an alternative data provider, mock data in production code, or an undeclared
  endpoint requires a spec amendment first (see Principle I).

**Rationale**: Fixing the data contract in the spec keeps behavior predictable and reviewable.

### IV. Friendly, Semantic Error Handling

- **UI**: Raw errors and stack traces MUST NEVER be shown to end users. Every technical failure
  MUST be translated into a friendly, actionable message.
- **Backend** (if one exists): Responses MUST use semantically correct HTTP status codes.

**Rationale**: Users need understandable feedback, and API consumers need machine-meaningful
status codes; leaking internals is both a UX and a security concern.

### V. Simplicity and Consistent Conventions

- Keep a plain, flat structure; over-engineering (unneeded layers, patterns, or abstractions) is
  prohibited unless justified in the plan's Complexity Tracking.
- React code MUST use function components.
- Naming MUST follow `camelCase` for functions and variables, and `PascalCase` for components,
  interfaces, types, and classes.

**Rationale**: A small, consistent codebase is easier to review, test, and extend.

## Technology Stack & Architecture

- **Repository layout**: Frontend and backend (if a backend exists) MUST live in separate
  repositories. Monorepos and monoliths are not permitted.
- **Frontend / UI**: React with TypeScript. Styling MUST use CSS Modules and classes. Fonts,
  colors, gradients, and typography MUST be parameterized as design tokens in a dedicated,
  separate file so they can be changed centrally.
- **Backend** (only if required by the spec): Node.js + Express.js with TypeScript, following
  REST API guidelines.
- **Database** (only if required by the spec): Prisma Postgres accessed through the Prisma ORM.
- **Language**: TypeScript is mandatory for both frontend and backend code.

## Versioning & Repository Policy

- A local git repository MUST exist for each app before implementation starts.
- GitHub repositories MUST be named with the `fsdev-` prefix.
- The GitHub repositories (frontend, and backend if applicable) MUST be created as the first
  step of implementation.
- Design files (`*.fig`, `*.sketch`, `*.xd`) MUST NEVER be pushed to GitHub; `.gitignore` MUST
  exclude them and those entries MUST NOT be removed.

## Governance

- This constitution supersedes all other project practices. When guidance conflicts, this
  document wins; runtime guidance (e.g., `CLAUDE.md`) MUST stay consistent with it.
- **Amendments**: Proposed via `/speckit-constitution`, documented with a Sync Impact Report, and
  approved by the project owner before taking effect. Dependent specs, plans, and tasks MUST be
  reviewed for consistency after each amendment.
- **Versioning policy**: Semantic versioning. MAJOR for backward-incompatible removals or
  redefinitions of principles; MINOR for new principles/sections or materially expanded guidance;
  PATCH for clarifications and wording fixes.
- **Compliance review**: Every `plan.md` MUST pass the Constitution Check gate before Phase 0
  research and again after Phase 1 design. `/speckit-analyze` MUST treat constitution violations
  as critical. Any justified deviation MUST be recorded in the plan's Complexity Tracking.

**Version**: 1.0.0 | **Ratified**: 2026-09-24 | **Last Amended**: 2026-09-24
