import { Show, SignInButton } from '@clerk/react'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/students')({
  component: StudentsLayout,
})

function StudentsLayout() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Students</h1>
      <Show when="signed-in">
        <Outlet />
      </Show>
      <Show when="signed-out">
        <p className="text-muted-foreground">
          <SignInButton mode="modal">
            <button className="underline">Sign in</button>
          </SignInButton>{' '}
          to view students.
        </p>
      </Show>
    </div>
  )
}
