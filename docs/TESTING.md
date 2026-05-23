# Testing Strategy & CI/CD Integration

## Overview

This document outlines the testing strategy for the WineMarket platform, including unit tests, integration tests, and end-to-end (E2E) tests. All tests are automated via CI/CD and required to pass before merging to protected branches.

---

## Test Pyramid

```
      Unit Tests (70%)
         /          \
        /            \
    Integration (20%)
       /       \
      /         \
    E2E (10%)
```

- **Unit Tests**: Fast, isolated, test individual functions/components
- **Integration Tests**: Test module interactions and services
- **E2E Tests**: Test complete user workflows across the application

---

## CI/CD Pipeline

### Workflow: `.github/workflows/ci.yml`

The CI pipeline runs automatically on:
- Push to `main` or `dev` branches
- Pull requests targeting `dev` or `main`
- Manual trigger via workflow dispatch

#### Pipeline Stages (in order)

1. **Install** - Restore dependencies from cache
2. **Generate** - Generate OpenAPI spec and Kubb client
3. **Lint** - Run Biome linter and formatter checks
4. **Typecheck** - TypeScript compilation check
5. **Build** - Build both server and web applications
6. **E2E Tests** (Required gate) - Playwright E2E regression detection
7. **Unit Tests** - Vitest unit test suite

### Required Status Checks

The following must pass before merging:
- Install (ensures dependencies are correct)
- Generate (ensures API spec is valid)
- Lint (code style and quality)
- Typecheck (type safety)
- Build (application builds successfully)
- **E2E Tests** (regression detection) **← BLOCKING**
- Unit Tests (code coverage and correctness)

### CI Protection Policy

**E2E tests MUST pass before merge.** This is a hard requirement:
- Red E2E job blocks PR merge
- No force-push to circumvent
- Fix failing tests or adjust test expectations
- If flaky, update retry policy in `playwright.config.ts`

---

## E2E Testing (Playwright)

### Configuration

**File**: `apps/web/playwright.config.ts`

Key settings:
- **Browsers**: Chromium (primary), Firefox and Safari via local runs
- **Retries**: 2 retries in CI, 0 locally
- **Base URL**: `http://localhost:5173`
- **Test Directory**: `apps/web/src/__tests__/e2e`
- **Reporter**: HTML report + JSON results with trace on failure
- **Web Server**: Auto-starts dev server during tests
- **Timeout**: 30 seconds per test (5 seconds for expectations)
- **Screenshots**: Only on failure for faster execution

### Running E2E Tests

#### Locally

```bash
# Run all E2E tests
bun run test:e2e

# Run specific test file
bun exec playwright test auth.spec.ts

# Run in debug mode
bun exec playwright test --debug

# Run with UI mode (recommended for development)
bun exec playwright test --ui

# View previous test report
bun exec playwright show-report
```

#### In CI/CD

```bash
# Automatically run in CI pipeline after build succeeds
# (no manual action needed)
```

E2E tests run on GitHub Actions after successful build. The job:
- Installs Playwright browsers with system dependencies
- Runs tests with `CI=true` flag (disables interactive features)
- Captures failure traces and screenshots
- Uploads HTML report and JSON results as artifacts
- Blocks merge if any test fails
- Uses 30-minute timeout as safety guard

### Test Structure

**Example**: `apps/web/src/__tests__/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to sign in', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.click('button:has-text("Sign In")');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button:has-text("Submit")');
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
```

### Best Practices

1. **Test user-facing workflows**, not implementation details
2. **Use data-testid attributes** for reliable selectors
   ```typescript
   // In components
   <button data-testid="submit-btn">Submit</button>
   
   // In tests
   await page.click('[data-testid="submit-btn"]');
   ```
3. **Avoid hardcoded waits** - use `waitFor` methods
   ```typescript
   // Don't do this
   await page.waitForTimeout(1000);
   
   // Do this instead
   await page.waitForLoadState('networkidle');
   await page.locator('[data-testid="user-menu"]').isVisible();
   ```
4. **Clean up state** between tests (or use fixtures)
5. **Keep tests focused** - one user scenario per test
6. **Name tests descriptively** - describe what user does

### Debugging Failed Tests

When E2E tests fail in CI:

1. **Download artifacts** from GitHub Actions
   - `playwright-report/` - HTML report with traces
   - `e2e-test-results/` - JSON results

2. **View HTML report**
   ```bash
   # After downloading playwright-report.zip
   unzip playwright-report.zip
   open index.html  # or use your browser
   ```

3. **Check test trace**
   - Click failed test in report
   - View screenshot at failure point
   - Review network requests and DOM state

4. **Reproduce locally**
   ```bash
   # Run specific failing test with debug
   bun exec playwright test --debug -g 'test name'
   
   # Or use UI mode
   bun exec playwright test --ui -g 'test name'
   ```

---

## Unit & Integration Tests

### Configuration

**Files**: 
- `apps/server/vitest.config.ts`
- `apps/web/vitest.config.ts`

Settings:
- **Test Runner**: Vitest
- **Coverage Threshold**: 70% (enforced in CI)
- **Test Pattern**: `**/*.test.ts`, `**/*.spec.ts`

### Running Tests

#### Locally

```bash
# Run all unit tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run with coverage report
bun run test --coverage

# Run specific test file
bun run test auth.test.ts

# Run tests matching pattern
bun run test --grep 'createUser'
```

#### In CI/CD

Unit tests run after E2E tests. Failures do NOT block merge but are flagged for review.

### Coverage Requirements

**Thresholds by package:**
- `apps/server`: 70% line coverage
- `apps/web`: 70% line coverage
- `packages/shared`: 80% line coverage

Coverage is enforced in CI and reported in PR summaries.

---

## Common CI Issues & Solutions

### E2E Tests Timeout

**Symptom**: `Test timeout of 1800000ms exceeded`

**Solutions**:
1. Check if dev server starts correctly
2. Increase test timeout in specific test:
   ```typescript
   test('slow test', async ({ page }) => {
     test.setTimeout(60000); // 60 seconds
     // test code
   });
   ```
3. Split large test into smaller ones

### Flaky Tests

**Symptom**: Test passes locally but fails intermittently in CI

**Solutions**:
1. Add explicit waits instead of implicit:
   ```typescript
   // Don't do this
   await page.waitForTimeout(1000);
   
   // Do this
   await page.waitForLoadState('networkidle');
   await page.locator('button').isVisible();
   ```

2. Use more specific selectors:
   ```typescript
   // Brittle
   await page.click('button');
   
   // Specific
   await page.click('[data-testid="submit-btn"]');
   ```

3. Increase retries for specific flaky tests:
   ```typescript
   test('flaky test', async ({ page }) => {
     test.retries(3);
     // test code
   });
   ```

### Dependencies Not Installed

**Symptom**: `Cannot find module 'playwright'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
bun exec playwright install
```

### Port Already in Use

**Symptom**: `Error: connect EADDRINUSE 127.0.0.1:5173`

**Solution**:
```bash
# Kill existing process
lsof -ti :5173 | xargs kill -9

# Or change port in playwright.config.ts
# and update base URL accordingly
```

---

## Validation Checklist

Before pushing to GitHub:

```bash
# Run full validation suite locally
bun run validate
```

This runs (in order):
1. `bun run lint` - Biome checks
2. `bun run check` - Biome format/organize
3. `bun run generate` - Orval/Kubb generation
4. `bun run check-types` - TypeScript check
5. `bun run test` - Unit tests
6. `bun run test:e2e` - E2E tests
7. `bun run build` - Production build

**If any step fails, fix it before pushing.**

---

## GitHub Actions Troubleshooting

### View Live Logs

1. Go to PR → "Checks" tab
2. Click failing job name
3. Expand step logs
4. Look for first error

### Re-run Failed Jobs

1. Go to PR → "Checks" tab
2. Click "Re-run failed jobs"
3. GitHub re-runs only failed jobs
4. Wait for green checkmark

### View Artifacts

1. Go to PR → "Checks" tab
2. Scroll to "Artifacts" section
3. Download `playwright-report` for E2E failures
4. Download `e2e-test-results` for detailed results

---

## Test Maintenance

### Adding New E2E Tests

1. Create file: `apps/web/src/__tests__/e2e/feature.spec.ts`
2. Import Playwright test functions
3. Write tests following existing patterns
4. Test locally: `bun run test:e2e --grep 'feature'`
5. Commit with message: `test(WINE-XXX): add e2e tests for feature`
6. Push and verify CI passes

### Updating Tests After UI Changes

When UI changes cause test failures:

1. Run locally in UI mode: `bun exec playwright test --ui`
2. Update selectors to match new DOM
3. Re-test locally
4. Commit with message: `test(WINE-XXX): update e2e tests for ui changes`

### Deprecating Tests

When removing tested features:

1. Check if tests are still needed
2. Remove test file or individual tests
3. Run full suite locally: `bun run validate`
4. Commit with message: `test(WINE-XXX): remove e2e tests for deprecated feature`

---

## Performance & Resource Management

### CI Job Resources

- **Timeout**: 30 minutes maximum (safeguard against hangs)
- **Memory**: GitHub Actions default (~7GB available)
- **Storage**: Artifacts retained 30 days

### Optimization Tips

1. **Cache aggressively** - Dependencies cache hit saves 2-3 minutes
2. **Parallelize jobs** - lint, typecheck, test run in parallel after install
3. **Limit artifact retention** - 30 days is default, adjust if needed
4. **Use concurrency** - Cancel old runs when new push happens

---

## Team Responsibilities

### Developers

- Write tests alongside features (TDD preferred)
- Run `bun run validate` before pushing
- Fix failing tests immediately
- Review test failures in CI and investigate

### Code Reviewers

- Check test coverage in PR
- Verify E2E scenario makes sense
- Ensure tests are maintainable
- Request changes if coverage drops

### Matej (Team Lead)

- Monitor CI health
- Update test policies as needed
- Unblock team on flaky tests
- Document new test patterns

---

## References

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- Project: `docs/CODING_STANDARDS.md`
- Workflow: `.github/workflows/ci.yml`

---

**Last Updated**: May 17, 2026  
**Maintained by**: Test Engineering Team
