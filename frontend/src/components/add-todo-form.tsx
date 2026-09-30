import { FormEvent, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const TITLE_MAX_LENGTH = 100

export interface AddTodoFormProps {
  isSubmitting: boolean
  onSubmit: (title: string) => Promise<void>
}

export const AddTodoForm = ({ isSubmitting, onSubmit }: AddTodoFormProps) => {
  const [title, setTitle] = useState('')
  const trimmedTitle = title.trim()
  const isSubmitDisabled = isSubmitting || trimmedTitle.length === 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitDisabled) {
      return
    }
    await onSubmit(trimmedTitle)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="new-todo-title">Новая задача</Label>
        <Input
          id="new-todo-title"
          type="text"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="Что нужно сделать?"
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitDisabled} aria-label="Добавить задачу">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="h-4 w-4" aria-hidden="true" />
        )}
        Добавить
      </Button>
    </form>
  )
}
