# Specification: Test Stability & Sharding

## Overview
Implement Vitest sharding to mitigate OOM errors during CI and stabilize test environment.

## Functional Requirements
- Implement sharding in `vitest.config.ts`.
- Ensure coverage reports remain accurate despite sharding.

## Acceptance Criteria
- 0 OOM errors in CI.
- All tests passing.
- Coverage reports intact.
