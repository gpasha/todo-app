import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTodo, deleteTodo, fetchTodoById, fetchTodos, updateTodo } from '../api/todos.api'
import { CreateTodoPayload, Todo, UpdateTodoPayload } from '../api/types'

export const todosQueryKey = ['todos'] as const

export const todoQueryKey = (id: string) => ['todo', id] as const

export const useTodos = () =>
  useQuery({
    queryKey: todosQueryKey,
    queryFn: fetchTodos,
  })

export const useTodo = (id: string) =>
  useQuery({
    queryKey: todoQueryKey(id),
    queryFn: () => fetchTodoById(id),
    enabled: Boolean(id),
  })

export const useCreateTodo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTodoPayload) => createTodo(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosQueryKey }),
  })
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTodoPayload }) =>
      updateTodo(id, payload),
    onSuccess: (todo: Todo) => {
      queryClient.invalidateQueries({ queryKey: todosQueryKey })
      queryClient.invalidateQueries({ queryKey: todoQueryKey(todo.id) })
    },
  })
}

export const useDeleteTodo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosQueryKey }),
  })
}
