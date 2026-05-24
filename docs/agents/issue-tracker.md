# Issue Tracker — Jira + GitHub Integration

Issues live in Jira. This repo is linked to Jira via the GitHub integration.

## Workflow Rules
1. **Keys**: Every branch and PR title MUST include the Jira issue key (e.g., `WINE-123`).
2. **Tracking**: Use `mcp_atlassian-rovo-mcp-server` tools for all Jira operations.
3. **Status**: Update Jira status as work progresses (In Progress -> Review -> Done).
4. **PRs**: Link GitHub PRs back to the Jira ticket manually if automation fails.

## Tools
- 	o-issues: Use to create Jira tickets from specs.
- 	riage: Use to manage incoming Jira issues.
- 	o-prd: Use to convert conversations to Jira-linked PRDs.
