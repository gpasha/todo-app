import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { Todo } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PRIORITY_BADGE_VARIANTS, PRIORITY_LABELS } from '@/lib/priority'

export interface TodoItemProps {
  todo: Todo
  isBusy: boolean
  onToggle: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export const TodoItem = ({ todo, isBusy, onToggle, onDelete }: TodoItemProps) => (
  <li className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50">
    <Checkbox
      id={`todo-checkbox-${todo.id}`}
      checked={todo.completed}
      disabled={isBusy}
      onCheckedChange={() => onToggle(todo)}
      aria-label={`Отметить задачу «${todo.title}» выполненной`}
    />
    <Link
      to={`/todo/${todo.id}`}
      aria-label={`Открыть задачу «${todo.title}»`}
      className={`flex-1 truncate hover:underline ${
        todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'
      }`}
    >
      {todo.title}
    </Link>
    <Badge variant={PRIORITY_BADGE_VARIANTS[todo.priority]}>
      {PRIORITY_LABELS[todo.priority]}
    </Badge>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => onDelete(todo)}
      disabled={isBusy}
      aria-label={`Удалить задачу «${todo.title}»`}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  </li>
)
