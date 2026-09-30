import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { HomePage } from '@/pages/home-page'
import { TodoDetailPage } from '@/pages/todo-detail-page'

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/todo/:id" element={<TodoDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster richColors closeButton position="bottom-right" />
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
