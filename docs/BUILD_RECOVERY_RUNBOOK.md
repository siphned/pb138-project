# Build Recovery Runbook — April 28, 2026

**Status:** 🔴 BUILD BROKEN — 540+ errors  
**Root Cause:** Missing type exports in custom-instance.ts  
**Fix Time:** 30 minutes  
**Owner:** Any team member (simple fix)  

---

## Quick Fix (Copy-Paste Ready)

### File: `apps/web/src/lib/custom-instance.ts`

**Location:** After line 27 (after `export type BodyType<BodyData> = BodyData;`)

**Add these lines:**

```typescript
// Type exports required by Kubb-generated hooks
export type Client = typeof customInstance;
export type RequestConfig = AxiosRequestConfig;
export type ResponseErrorConfig<E> = AxiosError<E>;

// Default export for Kubb client import
export default customInstance;
```

### Full Updated File (Paste entire content):

```typescript
import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";

export const axiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return axiosInstance({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;

// Type exports required by Kubb-generated hooks
export type Client = typeof customInstance;
export type RequestConfig = AxiosRequestConfig;
export type ResponseErrorConfig<E> = AxiosError<E>;

// Default export for Kubb client import
export default customInstance;

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}
```

---

## Verification Steps

After applying the fix, run in order:

```bash
# Step 1: Build (should now pass)
bun run build

# Step 2: Type check
bun run check-types

# Step 3: Lint & format
bun run check

# Step 4: Tests (should pass 198/200)
bun run test
```

---

## Expected Results

### ✅ If Successful
```
web#build completed
apps/server#check-types completed
Found 0 errors
198 tests passing
```

### ❌ If Still Broken
- **540 errors remain** → Check custom-instance.ts saved correctly
- **Different errors appear** → Run `bun run generate` to regenerate Kubb hooks
- **Type check fails** → Look for specific error lines and fix locally

---

## Commit & Push

```bash
# 1. Check what changed
git status

# 2. Add the fix
git add apps/web/src/lib/custom-instance.ts

# 3. Commit with Jira key
git commit -m "fix(WINE-XXX): add missing type exports to custom-instance for Kubb"

# 4. Push to your feature branch
git push origin feature/WINE-XXX-your-branch-name
```

---

## If Build Still Fails

### Check 1: Did the file save?
```bash
cat apps/web/src/lib/custom-instance.ts | grep "export type Client"
# Should print: export type Client = typeof customInstance;
```

### Check 2: Are there syntax errors?
```bash
bun run check-types 2>&1 | head -20
# Will show first 20 type errors if any
```

### Check 3: Regenerate Kubb hooks
```bash
# If still broken, regenerate everything
cd apps/server
bun run dev  # Start backend in one terminal

# In another terminal at root:
bun run generate
```

### Check 4: Look at specific error
```bash
bun run build 2>&1 | grep "custom-instance" | head -5
# Will show exact import errors
```

---

## Rollback (If Needed)

```bash
# Undo the change
git checkout apps/web/src/lib/custom-instance.ts

# Or restore from git
git reset --hard HEAD
```

---

## Success Criteria

✅ Build completes without errors  
✅ Type check passes  
✅ Lint passes  
✅ 198/200 tests pass  
✅ Can run `bun dev` without build errors  

Once all 5 are green → Ready to resume feature work!

---

**Need help?** Check:
- `docs/API/KUBB_WORKFLOW.md` — Kubb/Orval setup guide
- `apps/web/orval.config.ts` — Kubb configuration
- `apps/web/src/generated/` — Generated hook examples
- Team lead or `#dev-help` Slack channel
