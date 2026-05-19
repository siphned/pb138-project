#!/bin/bash

branches=(
  "feature/WINE-204-e2e-ci-regression"
  "feature/WINE-205-unit-test-coverage"
  "feature/WINE-212-dark-mode"
  "fix/WINE-210-auth-redirect-tests"
  "fix/WINE-211-role-requests-error-message"
  "WINE-173-fix-dev-branch-integrity"
  "WINE-61-ci-enforcement"
  "WINE-61-oom-resolution"
  "WINE-69-wine-and-winemakers-profile"
  "ci/task1-update-triggers"
  "ci/task2-security-fast"
  "ci/task3-compliance"
  "ci/task4-security-deep"
  "ci/task5-quality"
  "ci/task6-integration"
  "ci/task7-playwright"
)

echo "Creating MRs for 16 test branches..."
count=0
success=0
failed=0

for branch in "${branches[@]}"; do
  count=$((count + 1))

  # Extract WINE ticket number from branch name
  ticket=$(echo "$branch" | grep -oE "WINE-[0-9]+" || echo "MISC")

  echo "[$count/16] Creating PR for $branch..."

  gh pr create \
    --base dev \
    --head "$branch" \
    --title "[$ticket] Test coverage and integration improvements" \
    --body "Automated test additions for regression detection and coverage expansion. Review test quality and approve if comprehensive." \
    --assignee siphned \
    2>&1

  if [ $? -eq 0 ]; then
    echo "  ✅ PR created"
    success=$((success + 1))
  else
    echo "  ⚠️ PR creation failed or already exists"
    failed=$((failed + 1))
  fi

  sleep 1  # Small delay to avoid rate limiting
done

echo ""
echo "✅ PR creation batch complete!"
echo "Summary: $success successful, $failed failed/existing"
