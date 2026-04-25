// This page demonstrates how to use generated hooks from the OpenAPI spec.
//
// Kubb generates `useGetCourses` from the OpenAPI spec:
//   src/generated/hooks/useGetCourses.ts

import { useState } from 'react'
import { useGetCourses } from '../generated/hooks/useGetCourses'
import type { Course } from '../generated/types/Course'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function CourseCard({ course }: { course: Course }) {
  const occupancy = Math.round((course.enrolled / course.capacity) * 100)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
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
    </div>
  )
}

export function CoursesPage() {
  const [semester, setSemester] = useState<string>('all')

  const { data: courses, isLoading, isError } = useGetCourses(
    semester === 'all' ? undefined : { semester: semester as 'fall' | 'spring' },
  )

  if (isLoading) {
    return <p>Loading courses…</p>
  }

  if (isError) {
    return <p className="text-destructive">Failed to load courses. Is the server running?</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <h1 className="m-0">Courses</h1>
        <Select value={semester} onValueChange={(v) => setSemester(v ?? 'all')}>
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
    </div>
  )
}
