# Conductor Workflow

## General Workflow
1. **Jira Issue Creation**: Before starting any work on a track, create a corresponding Jira issue.
2. **Jira Transition Discovery**: Before starting work, query the available Jira workflow transitions for the created issue using the MCP to ensure valid status changes are used.
3. **Worktree and Branch Setup**:
    - Create a new git worktree to isolate the changes for the track.
    - Within the worktree, create a new git branch named according to the convention: `<JIRA-ISSUE-ID>-<short-description-in-kebab-case>` (e.g., `PROJ-123-fix-login-button`).
4. **Conductor Files Synchronization**: Copy the entire `conductor` directory from the main project root into the newly created worktree directory. This ensures the plan and spec are available within the isolated environment.
5. **Implementation & Jira Transition**:
    - Begin work on the track, following the TDD Loop.
    - As work progresses, transition the Jira issue to the appropriate status (e.g., 'In Progress', 'In Review', 'Done') using the valid transition IDs discovered in step 2.
6. **TDD Loop**:
   - Inspect, and understand presented issues.
   - Implement minimal code to pass.
   - Refactor and verify.
7. **Validation**: Run full suite (lint, type-check, tests).

## Commit and PR Naming Convention
- **Commits**: All commit messages MUST follow the format: `<type>(<JIRA-ISSUE-ID>): <description>`.
- **Pull Requests**: The title of all Pull Requests MUST follow the format: `[<JIRA-ISSUE-ID>] <description>`.

## Phase Completion Verification and Checkpointing Protocol
For each phase in the implementation plan, a manual verification step is required.

**Protocol**:
- Review implemented features against the spec.
- Ensure test coverage for new logic.
- Verify no regressions in existing tests.
- Final sign-off for the phase.

## Task Workflow
This protocol defines the lifecycle for executing each task in an implementation plan.

1.  **Announce Task:** Announce the task description from the plan file that is about to be executed.

2.  **Execute Task:** Perform the necessary actions to complete the task. This may include:
    - Running shell commands (`run_shell_command`).
    - Reading files (`read_file`).
    - Editing code (`replace`).
    - Writing new files (`write_file`).
    - Asking for user input if the task requires it (`ask_user`).

3.  **Verify Task Completion:**
    - After executing the task, verify its successful completion.
    - For tasks that produce a tangible output (e.g., code change, file creation), the verification should involve checking that output (e.g., running tests, linting, or checking file content).
    - For tasks requiring manual verification (like the "Conductor - User Manual Verification" tasks), use the `ask_user` tool to get confirmation from the user. The question should be: "Please verify that '<Task Name>' is complete according to the protocol in workflow.md. Is it complete?"

4.  **Update Plan File:**
    - Once the task is verified as complete, update the implementation plan file (`plan.md`).
    - Mark the task as complete by changing `[ ]` to `[x]`.
    - **CRITICAL**: The update must be precise, only changing the status marker for the single task that was just completed. Use the `replace` tool for this.
