import { useMemo, useState } from "react";

import { ShadcnProductForm } from "./components/ShadcnProductForm";
import { SimpleProductForm } from "./components/SimpleProductForm";

type TaskId = "task1" | "task3";

function App() {
  const [activeTask, setActiveTask] = useState<TaskId>("task1");

  const taskContent = useMemo(() => {
    if (activeTask === "task1") {
      return {
        title: "Task 1: Basic + Dynamic Form",
        description:
          "Single minimal-styled RHF + Zod form with name, price, and optional discount code.",
        node: <SimpleProductForm />,
      };
    }

    return {
      title: "Task 3: Upgrade to Shadcn",
      description:
        "Use generated UI components from components/ui (Button, Input, Field, Label, FieldError).",
      node: <ShadcnProductForm />,
    };
  }, [activeTask]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <p className="m-0 text-xs font-bold uppercase tracking-[0.06em] text-indigo-600">
          PB138 Seminar 07 Assignment
        </p>
        <h1 className="my-1 text-3xl font-semibold tracking-tight">React Hook Form Tasks</h1>
        <p className="m-0 text-slate-600">
          Student app comparing plain RHF + Zod form vs Shadcn UI form.
        </p>
      </header>

      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Assignment tasks">
        <button
          className={
            activeTask === "task1"
              ? "rounded-full border border-indigo-600 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700"
          }
          onClick={() => setActiveTask("task1")}
          type="button"
        >
          Task 1
        </button>
        <button
          className={
            activeTask === "task3"
              ? "rounded-full border border-indigo-600 bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700"
          }
          onClick={() => setActiveTask("task3")}
          type="button"
        >
          Task 3
        </button>
      </nav>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-live="polite">
        <h2 className="m-0 text-xl font-semibold tracking-tight">{taskContent.title}</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">{taskContent.description}</p>
        {taskContent.node}
      </section>
    </main>
  );
}

export default App;
