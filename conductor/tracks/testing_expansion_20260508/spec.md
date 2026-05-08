# Specification: Testing Harness Expansion (WINE-61, WINE-74)

## Overview
Massive expansion of the testing infrastructure for both Backend (apps/server) and Frontend (apps/web), including unit, integration, and e2e tests. Goal is high reliability and automated verification in CI.

## Functional Requirements
- **Backend (BE) Coverage**: Achieve 90% overall coverage using Vitest and API testing tools.
- **Critical BE Modules**: 100% coverage for: `wine`, `cart`, `guest-session`, `auth`, `users`.
- **Frontend (FE) Coverage**: Achieve 90% overall coverage using Vitest and React Testing Library (RTL).
- **End-to-End (e2e)**: Expand Playwright suite to cover full user flows (Order, Registration, etc.).
- **Performance Testing**: Implement basic performance/load testing benchmarks.
- **Security Scanning**: Integrate security scanning (e.g., dependency audits, static analysis).
- **CI Integration**: Automate all tests in GitHub Actions.

## Non-Functional Requirements
- **Performance**: Tests should run efficiently in CI.
- **Reliability**: Minimize flaky e2e tests.

## Acceptance Criteria
- Coverage reports show >= 90% overall and 100% for critical modules.
- e2e suite covers all primary user journeys.
- CI pipeline successfully executes all test types on PR.
- Performance and security reports are generated.

## Out of Scope
- Manual QA processes.
- Stress testing beyond basic benchmarks.
