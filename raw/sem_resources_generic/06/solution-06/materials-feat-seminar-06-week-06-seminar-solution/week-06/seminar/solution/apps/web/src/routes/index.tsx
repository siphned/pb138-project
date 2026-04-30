import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Welcome to PB138 University</h1>
      <p className="text-muted-foreground">
        Use the navigation above to browse students and courses.
      </p>
    </div>
  )
}
