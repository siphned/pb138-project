const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

try {
  const branchesOutput = execSync("git branch -r --sort=-committerdate", { encoding: "utf8" });
  const branches = branchesOutput
    .split("\n")
    .map((b) => b.trim())
    .filter((b) => b);

  const candidateBranches = [];

  for (const branch of branches) {
    if (branch.includes("->")) continue;
    if (branch === "origin/main" || branch === "origin/dev" || branch === "origin/HEAD") continue;

    const branchName = branch.replace("origin/", "");

    if (
      branchName.startsWith("WINE-") ||
      branchName.startsWith("feature/") ||
      branchName.startsWith("fix/") ||
      branchName.startsWith("ci/") ||
      branchName.startsWith("chore/")
    ) {
      candidateBranches.push(branch);
    }
  }

  const results = [];

  for (const branch of candidateBranches) {
    const logOutput = execSync(`git log -1 --format="%at %an" ${branch}`, {
      encoding: "utf8",
    }).trim();
    const firstSpace = logOutput.indexOf(" ");
    const timestamp = Number.parseInt(logOutput.substring(0, firstSpace), 10);
    const author = logOutput.substring(firstSpace + 1);

    const branchName = branch.replace("origin/", "");

    // Extract Jira ID if present (e.g., WINE-123)
    const jiraMatch = branchName.match(/WINE-\d+/);
    const jira_id = jiraMatch ? jiraMatch[0] : null;

    results.push({
      author,
      branch: branchName,
      jira_id,
      timestamp,
    });
  }

  const dir = "D:/pb138/project/winery/docs/maestro";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, "merge_inventory.json"), JSON.stringify(results, null, 2));
} catch (_error) {
  process.exit(1);
}
