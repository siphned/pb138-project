import { faker } from '@faker-js/faker'
import { db } from './index'
import { students, instructors, courses, enrollments } from './schema'

async function main() {
  console.log('Seeding database...')

  // Clear existing data (reverse FK order)
  await db.delete(enrollments)
  await db.delete(courses)
  await db.delete(students)
  await db.delete(instructors)

  // ── Instructors (done) ──────────────────────────────────────────────────

  const createdInstructors = await db
    .insert(instructors)
    .values(
      Array.from({ length: 3 }, () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        department: faker.helpers.arrayElement([
          'Department of Computer Science',
          'Department of Information Systems',
          'Department of Mathematics',
        ]),
      })),
    )
    .returning()

  console.log(`Created ${createdInstructors.length} instructors`)

  // ── Students (done) ─────────────────────────────────────────────────────

  const createdStudents = await db
    .insert(students)
    .values(
      Array.from({ length: 10 }, () => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        uco: faker.string.numeric(6),
      })),
    )
    .returning()

  console.log(`Created ${createdStudents.length} students`)

  // ── Courses ─────────────────────────────────────────────────────────────

  const createdCourses = await db
    .insert(courses)
    .values(
      Array.from({ length: 5 }, (_, i) => ({
        code: `PB${100 + i}`,
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        credits: faker.helpers.arrayElement([2, 3, 4, 5, 6]),
        instructorId: faker.helpers.arrayElement(createdInstructors).id,
        semester: faker.helpers.arrayElement(['fall', 'spring'] as const),
        year: 2026,
        capacity: faker.helpers.arrayElement([20, 30, 50]),
      })),
    )
    .returning()

  console.log(`Created ${createdCourses.length} courses`)

  // ── Enrollments ─────────────────────────────────────────────────────────

  const enrollmentValues: { studentId: string; courseId: string }[] = []
  for (const student of createdStudents) {
    const randomCourses = faker.helpers.arrayElements(createdCourses, { min: 1, max: 3 })
    for (const course of randomCourses) {
      enrollmentValues.push({ studentId: student.id, courseId: course.id })
    }
  }

  const createdEnrollments = await db.insert(enrollments).values(enrollmentValues).returning()

  console.log(`Created ${createdEnrollments.length} enrollments`)

  console.log('Done!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
