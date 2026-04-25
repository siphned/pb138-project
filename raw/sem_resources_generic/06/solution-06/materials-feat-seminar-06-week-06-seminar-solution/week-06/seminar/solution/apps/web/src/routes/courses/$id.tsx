import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoursesByIdQueryOptions } from '@/generated/hooks/useGetCoursesById'
import { LoaderCircle } from 'lucide-react'

export const Route = createFileRoute('/courses/$id')({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(getCoursesByIdQueryOptions(params.id)),
  pendingComponent: () => (
    <div className="flex justify-center p-8">
      <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
  errorComponent: () => (
    <div className="p-4">
      <p className="text-destructive">Failed to load course.</p>
      <Link to="/courses" className="text-sm underline">Back to courses</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-4">
      <p className="text-muted-foreground">Course not found.</p>
      <Link to="/courses" className="text-sm underline">Back to courses</Link>
    </div>
  ),
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { id } = Route.useParams()
  const { data: course } = useSuspenseQuery(getCoursesByIdQueryOptions(id))

  const occupancy = Math.round((course.enrolled / course.capacity) * 100)

  return (
    <div>
      <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>

      <h2 className="mt-4 mb-2 text-xl font-bold">
        {course.code} – {course.name}
      </h2>

      <p className="mb-4 text-muted-foreground">{course.description}</p>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm max-w-md">
        <dt className="text-muted-foreground">Credits</dt>
        <dd>{course.credits}</dd>
        <dt className="text-muted-foreground">Semester</dt>
        <dd>{course.semester.charAt(0).toUpperCase() + course.semester.slice(1)} {course.year}</dd>
        <dt className="text-muted-foreground">Enrollment</dt>
        <dd>{course.enrolled}/{course.capacity} ({occupancy}%)</dd>
      </dl>
    </div>
  )
}
