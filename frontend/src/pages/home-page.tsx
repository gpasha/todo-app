import { useState } from 'react'
import type { Todo } from '@/api/types'
import { AddTodoForm } from '@/components/add-todo-form'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EmptyState, ErrorState, TodoListSkeleton } from '@/components/states'
import { ThemeToggle } from '@/components/theme-toggle'
import { TodoItem } from '@/components/todo-item'
import { Separator } from '@/components/ui/separator'
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from '@/hooks/use-todos'
import { toast } from 'sonner'

export const HomePage = () => {
  const { data: todos, isPending, isError, error } = useTodos()
  const createMutation = useCreateTodo()
  const updateMutation = useUpdateTodo()
  const deleteMutation = useDeleteTodo()
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null)

  const handleCreate = async (title: string) => {
    try {
      await createMutation.mutateAsync({ title })
      toast.success('Задача добавлена')
    } catch {
      toast.error('Не удалось создать задачу')
    }
  }

  const handleToggle = (todo: Todo) => {
    updateMutation.mutate(
      { id: todo.id, payload: { completed: !todo.completed } },
      { onError: () => toast.error('Не удалось изменить статус') },
    )
  }

  const handleConfirmDelete = () => {
    if (!todoToDelete) {
      return
    }
    const target = todoToDelete
    setTodoToDelete(null)
    deleteMutation.mutate(target.id, {
      onSuccess: () => toast.success('Задача удалена'),
      onError: () => toast.error('Не удалось удалить задачу'),
    })
  }

  const handleCancelDelete = () => setTodoToDelete(null)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мои задачи</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавляйте задачи, отмечайте выполненные и открывайте детали.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <AddTodoForm isSubmitting={createMutation.isPending} onSubmit={handleCreate} />

      <Separator />

      {isPending && <TodoListSkeleton />}

      {isError && <ErrorState message={`Не удалось загрузить задачи: ${error.message}`} />}

      {todos && todos.length === 0 && <EmptyState />}

      {todos && todos.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Список задач">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isBusy={updateMutation.isPending}
              onToggle={handleToggle}
              onDelete={setTodoToDelete}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(todoToDelete)}
        title="Удалить задачу?"
        message={todoToDelete ? `Задача «${todoToDelete.title}» будет удалена безвозвратно.` : ''}
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  )
}
