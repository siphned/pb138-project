# Specification: Server Coverage OOM Resolution & Optimization

## Overview
Address the persistent "JavaScript heap out of memory" error during server coverage collection. The goal is to stabilize CI, enforce coverage targets, and improve test execution efficiency through sharding and import optimization.

## Functional Requirements
- **Test Sharding**: Implement Vitest `--shard` to distribute the testing load across multiple processes.
- **Import Optimization**: Audit and refactor `index.ts` (barrel files) and large schema imports to reduce memory footprint per worker.
- **CI Enforcement**: Configure and enforce 90% coverage thresholds in GitHub Actions.
- **Workflow Update**: Update `.github/workflows/ci.yml` to support parallel test sharding and coverage aggregation.

## Non-Functional Requirements
- **Memory Usage**: Peak heap usage during coverage collection should stay well below 2GB.
- **Build Time**: Total CI test time should not significantly increase.

## Acceptance Criteria
- Full coverage collection for `apps/server` passes consistently without OOM.
- Coverage reports are successfully aggregated from shards.
- CI fails if coverage falls below 90%.

## Out of Scope
- Migrating away from Vitest.
- Major architectural refactoring beyond import cleanup.
