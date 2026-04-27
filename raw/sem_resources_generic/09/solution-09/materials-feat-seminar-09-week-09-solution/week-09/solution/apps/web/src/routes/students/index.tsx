import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useGetStudents, getStudentsQueryKey } from '@/generated/hooks/useGetStudents'
import { usePostStudents } from '@/generated/hooks/usePostStudents'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/students/')({
  component: StudentsPage,
})

function StudentsPage() {
  const { data: students, isPending, isError } = useGetStudents()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [uco, setUco] = useState('')

  const queryClient = useQueryClient()

  const mutation = usePostStudents({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getStudentsQueryKey() })
        setFirstName('')
        setLastName('')
        setEmail('')
        setUco('')
      },
    },
  })

  if (isPending) {
    return <p>Loading students…</p>
  }

  if (isError) {
    return <p className="text-destructive">Failed to load students. Is the server running?</p>
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3">
        {students?.map((student) => (
          <div key={student.id} className="rounded-lg border border-border px-4 py-3">
            <strong>{student.firstName} {student.lastName}</strong>
            <span className="ml-2 text-sm text-muted-foreground">
              {student.email} · UCO {student.uco}
            </span>
          </div>
        ))}
      </div>

      <h3 className="mb-3">Add student</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate({ data: { firstName, lastName, email, uco } })
        }}
        className="flex max-w-sm flex-col gap-2"
      >
        <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="UCO (6 digits)" value={uco} onChange={(e) => setUco(e.target.value)} />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create student'}
        </Button>
        {mutation.error && (
          <p className="text-sm text-destructive">{mutation.error.message}</p>
        )}
      </form>
    </div>
  )
}
