# Seminar 09 — Solution & Reflection

Answer the following questions. There are no single right answers — justify your thinking.

---

## Q1: Roles vs Permissions

> What is the difference between a role and a permission in Clerk? Why is checking permissions at the route level safer than checking the role name directly?

**Your answer:**

_[Write your answer here]_

---

## Q2: JWT Claims

> What claim in the JWT contains the user's permissions? Where is it set (which system/dashboard), and where is it verified (which file and line in this codebase)?

**Your answer:**

_[Write your answer here]_

---

## Q3: Wide Events vs Log Lines

> Look at a trace for `enrollment.bulkEnroll` in ClickStack. What attributes did you add, and why are they more useful than a plain log line like `"Student 123 enrolled in course 456"`?

**Your answer:**

_[Write your answer here]_

**Screenshot or span attribute list:**

_[Paste the ClickStack span attributes here, or describe what you see]_

---

## Q4: Production Readiness

> What **one thing** would you add to either the auth or observability setup to make this app genuinely production-ready? (No right answer — justify your choice with a concrete reason.)

**Your answer:**

_[Write your answer here]_

---

## Q5: Unprotected Transfer

> The `POST /students/:id/transfer` endpoint is intentionally left unprotected in this exercise (see `enrollments.routes.ts`). Should it require a permission? If so, which one and why? If not, justify why it's safe to leave open.

**Your answer:**

_[Write your answer here]_
