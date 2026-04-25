import { useState } from 'react'
import { z } from 'zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/react'
import { useGetCourses, getCoursesQueryKey } from '@/generated/hooks/useGetCourses'
import { usePostCourses } from '@/generated/hooks/usePostCourses'
import type { Course } from '@/generated/types/Course'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const searchSchema = z.object({
  semester: z.enum(['spring', 'fall']).optional(),
})

export const Route = createFileRoute('/courses/')({
  validateSearch: searchSchema,
  component: CoursesPage,
})

function CourseCard({ course }: { course: Course }) {
  const occupancy = Math.round((course.enrolled / course.capacity) * 100)

  return (
    <Link
      to="/courses/$id"
      params={{ id: course.id }}
      className="flex flex-col gap-2 rounded-lg border border-border p-4 hover:border-foreground/30 transition-colors"
    >
      <div className="flex items-baseline justify-between">
        <strong>{course.code} – {course.name}</strong>
        <span className="text-xs text-muted-foreground">{course.credits} credits</span>
      </div>

      <p className="m-0 text-sm text-muted-foreground">{course.description}</p>

      <div className="text-xs text-muted-foreground">
        {course.semester.charAt(0).toUpperCase() + course.semester.slice(1)} {course.year}
        {' · '}
        {course.enrolled}/{course.capacity} enrolled ({occupancy}%)
      </div>
    </Link>
  )
}

function CoursesPage() {
  const { semester } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { sessionClaims } = useAuth()
  const role = sessionClaims?.role as string | undefined
  const canCreateCourse = role === 'admin' || role === 'instructor'

  const { data: courses, isPending, isError } = useGetCourses(
    semester ? { semester } : undefined,
  )

  if (isPending) {
    return <p>Loading courses…</p>
  }

  if (isError) {
    return <p className="text-destructive">Failed to load courses. Is the server running?</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Select
          value={semester ?? 'all'}
          onValueChange={(v) =>
            navigate({
              search: { semester: v === 'all' ? undefined : (v as 'spring' | 'fall') },
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All semesters</SelectItem>
            <SelectItem value="spring">Spring</SelectItem>
            <SelectItem value="fall">Fall</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {courses?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {canCreateCourse && <CreateCourseForm />}
    </div>
  )
}

function CreateCourseForm() {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [credits, setCredits] = useState('')
  const [capacity, setCapacity] = useState('')
  const [instructorId, setInstructorId] = useState('')

  const queryClient = useQueryClient()
  const mutation = usePostCourses({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getCoursesQueryKey() })
        setCode('')
        setName('')
        setDescription('')
        setCredits('')
        setCapacity('')
        setInstructorId('')
      },
    },
  })

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-lg font-semibold">Create course</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate({
            data: {
              code,
              name,
              description,
              credits: Number(credits),
              capacity: Number(capacity),
              instructorId,
              semester: 'spring',
              year: new Date().getFullYear(),
            },
          })
        }}
        className="flex max-w-sm flex-col gap-2"
      >
        <Input placeholder="Course code (e.g. PB138)" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input placeholder="Course name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input placeholder="Credits" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} />
        <Input placeholder="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <Input placeholder="Instructor ID" value={instructorId} onChange={(e) => setInstructorId(e.target.value)} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create course'}
        </Button>
        {mutation.error && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}
      </form>
    </div>
  )
}
