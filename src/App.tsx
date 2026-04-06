import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ChatInterface from './components/ChatInterface'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <ChatInterface darkMode={false} />
      </div>
    </QueryClientProvider>
  )
}

export default App