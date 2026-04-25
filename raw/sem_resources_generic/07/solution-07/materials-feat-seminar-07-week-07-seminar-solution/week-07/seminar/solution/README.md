# PB138 Seminar 07 Assignment

This project is a React + TypeScript starter app for seminar tasks.
The form components intentionally contain TODO instructions for students (not finished solutions).

1. Task 1: Basic Form (React Hook Form + Zod)
2. Task 2: Dynamic Form extension (add `hasDiscount` + conditional `discountCode` to Task 1)
3. Task 3: Upgrade to Shadcn form components (including `Select`)

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

- `src/components/SimpleProductForm.tsx` - starter instructions for Task 1 and Task 2
- `src/components/ShadcnProductForm.tsx` - starter instructions for Task 3
- `src/components/ui/` - generated UI components for Task 3
  - `button.tsx`
  - `input.tsx`
  - `select.tsx`
  - `field.tsx`
  - `label.tsx`

## Notes for Students

- Task 1: Create a schema with `name` and `price`, wire `useForm` + `zodResolver`, and submit valid data.
- Task 2: Extend Task 1 by adding `hasDiscount` and optional `discountCode`, and render `discountCode` only when checked.
- Task 3: Refactor the plain form to Shadcn components (`Form`, `FormField`, `FormItem`, `FormControl`, `FormMessage`, `Input`, `Button`, `Select`, `Checkbox`).

You can switch between Task 1 and Task 3 in the app UI while implementing the exercises.
