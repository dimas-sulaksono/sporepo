# Contributing to sporepo

Thank you for your interest in contributing to **sporepo**! We welcome contributions that uphold the highest standards of software engineering, code quality, and prompt engineering discipline.

---

## 1. Guiding Principles

Before contributing, please keep in mind our non-negotiable core principles:

1. **Zero Runtime Dependencies:** The CLI core must stay zero-dependency. Only Node.js built-in modules (`fs`, `path`, `child_process`, `crypto`, etc.) are permitted in runtime code. Do not add runtime dependencies to `package.json`.
2. **Reviewer Gatekeeper Barrier:** All feature proposals must undergo an audit for edge cases and design decisions before implementation code is written.
3. **The Iron Law of Debugging:** Never apply guesswork or symptom patches. Always isolate root causes and write a failing automated test (TDD RED) before committing a fix.
4. **Terminal-Proven Verification:** Every PR must be accompanied by terminal test execution proof (exit code 0).

---

## 2. Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Getting Started

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/dimas-sulaksono/sporepo.git
   cd sporepo
   ```

2. **Install Development Dependencies:**
   ```bash
   npm install
   ```

3. **Build the Project:**
   ```bash
   npm run build
   ```
   *To watch for changes during development:*
   ```bash
   npm run watch
   ```

4. **Run the Test Suite:**
   ```bash
   npm test
   ```

---

## 3. Contribution Workflows

### A. Proposing a New Feature

1. Open an Issue using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml) or generate a local Meta-Prompt:
   ```bash
   node bin/sporepo.js req "Your Feature Title"
   ```
2. Complete the multi-persona responsibilities (@Architect, @Backend, @QA) and touch boundaries.
3. Address reviewer gatekeeper audit questions before writing code.

### B. Reporting or Fixing a Bug

1. Open an Issue using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml) or scaffold a local bug report:
   ```bash
   node bin/sporepo.js bug "Your Bug Title"
   ```
2. Provide ground-truth reproduction evidence (reproducible cURL command and actual error payload).
3. Follow the 4-phase systematic debugging lifecycle:
   - **Phase 1:** Root cause analysis.
   - **Phase 2:** Defect isolation.
   - **Phase 3:** Write a failing test in `tests/` (TDD RED).
   - **Phase 4:** Apply the minimal fix until the test passes (TDD GREEN).

---

## 4. Submitting a Pull Request (PR)

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-name
   ```
2. Ensure full test suite passes and packaging check succeeds:
   ```bash
   npm test
   npm pack --dry-run
   ```
3. Commit your changes with descriptive commit messages:
   ```bash
   git commit -m "feat(req): add support for custom template flags"
   ```
4. Push your branch and open a Pull Request against `main`.

---

## 5. Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors. Please treat others with respect and professionalism.
