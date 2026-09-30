import { ClipboardList, TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const TodoListSkeleton = () => (
  <div className="flex flex-col gap-2" role="status" aria-label="Загрузка задач">
    <Skeleton className="h-14 w-full rounded-lg" />
    <Skeleton className="h-14 w-full rounded-lg" />
    <Skeleton className="h-14 w-full rounded-lg" />
  </div>
)

export interface ErrorStateProps {
  message: string
}

export const ErrorState = ({ message }: ErrorStateProps) => (
  <Card className="border-destructive/50 bg-destructive/5">
    <CardContent className="flex items-center gap-3 py-6 text-sm text-destructive">
      <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span role="alert">{message}</span>
    </CardContent>
  </Card>
)

export const EmptyState = () => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
      <ClipboardList className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">Пока нет ни одной задачи</p>
      <p className="text-sm text-muted-foreground">Добавьте первую задачу в форме выше</p>
    </CardContent>
  </Card>
)
