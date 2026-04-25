import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/students')({
  component: StudentsLayout,
})

function StudentsLayout() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Students</h1>
      <Outlet />
    </div>
  )
}
