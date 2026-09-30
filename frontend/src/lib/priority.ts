import type { Priority } from '@/api/types'

export const PRIORITY_OPTIONS: Priority[] = ['LOW', 'MEDIUM', 'HIGH']

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
}

export const PRIORITY_BADGE_VARIANTS: Record<Priority, 'outline' | 'secondary' | 'destructive'> = {
  LOW: 'outline',
  MEDIUM: 'secondary',
  HIGH: 'destructive',
}
