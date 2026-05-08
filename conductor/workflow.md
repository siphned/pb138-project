# Conductor Workflow

## General Workflow
1. **Research & Strategy**: Understand the requirement and map the impact.
2. **TDD Loop**:
   - Write failing unit/integration tests.
   - Implement minimal code to pass.
   - Refactor and verify.
3. **Validation**: Run full suite (lint, type-check, tests).

## Phase Completion Verification and Checkpointing Protocol
For each phase in the implementation plan, a manual verification step is required.

**Protocol**:
- Review implemented features against the spec.
- Ensure test coverage for new logic.
- Verify no regressions in existing tests.
- Final sign-off for the phase.
