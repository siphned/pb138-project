import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/courses')({
  component: CoursesLayout,
})

function CoursesLayout() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Courses</h1>
      <Outlet />
    </div>
  )
}
