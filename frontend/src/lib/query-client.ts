import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
    return false
  }
  return failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryRequest,
      refetchOnWindowFocus: false,
    },
  },
})
