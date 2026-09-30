export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Todo {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: Priority
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTodoPayload {
  title: string
}

export interface UpdateTodoPayload {
  title?: string
  description?: string
  completed?: boolean
  priority?: Priority
}
