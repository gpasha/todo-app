import axios from 'axios'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import type { Priority } from '@/api/types'
import { ErrorState } from '@/components/states'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useTodo, useUpdateTodo } from '@/hooks/use-todos'
import { formatDateTime } from '@/lib/format'
import {
  PRIORITY_BADGE_VARIANTS,
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
} from '@/lib/priority'

const TITLE_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 10000

export const TodoDetailPage = () => {
  const { id = '' } = useParams()
  const { data: todo, isPending, isError, error } = useTodo(id)
  const updateMutation = useUpdateTodo()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')

  useEffect(() => {
    if (!todo) {
      return
    }
    setTitle(todo.title)
    setDescription(todo.description ?? '')
    setPriority(todo.priority)
  }, [todo])

  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { title: title.trim(), description, priority },
      })
      toast.success('Изменения сохранены')
    } catch {
      toast.error('Не удалось сохранить изменения')
    }
  }

  const backLink = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/" aria-label="Вернуться к списку задач">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Вернуться к списку
      </Link>
    </Button>
  )

  if (isPending) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        {backLink}
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </main>
    )
  }

  if (isNotFound) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        {backLink}
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">Задача не найдена</p>
            <p className="text-sm text-muted-foreground">
              Возможно, она была удалена или ссылка некорректна
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (isError || !todo) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
        {backLink}
        <ErrorState message="Не удалось загрузить задачу." />
      </main>
    )
  }

  const isSaveDisabled = updateMutation.isPending || title.trim().length === 0

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        {backLink}
        <ThemeToggle />
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Детали задачи</h1>
        <p className="text-sm text-muted-foreground">
          Создана: <span className="font-mono">{formatDateTime(todo.createdAt)}</span>
        </p>
      </header>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="todo-title">Заголовок</Label>
              <Input
                id="todo-title"
                type="text"
                value={title}
                maxLength={TITLE_MAX_LENGTH}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="todo-description">Описание</Label>
              <Textarea
                id="todo-description"
                value={description}
                maxLength={DESCRIPTION_MAX_LENGTH}
                rows={6}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="todo-priority">Приоритет</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger id="todo-priority" aria-label="Приоритет">
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {PRIORITY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Текущий статус:</span>
                <Badge variant={PRIORITY_BADGE_VARIANTS[todo.priority]}>
                  {PRIORITY_LABELS[todo.priority]}
                </Badge>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end gap-2 border-t pt-6">
            <Button variant="outline" asChild>
              <Link to="/" aria-label="Отменить изменения">
                Отмена
              </Link>
            </Button>
            <Button type="submit" disabled={isSaveDisabled} aria-label="Сохранить изменения">
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Сохранить
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
