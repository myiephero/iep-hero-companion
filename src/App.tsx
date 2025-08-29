import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold text-center mb-8">
              My IEP Hero
            </h1>
            <p className="text-center text-muted-foreground">
              Empowering Parents, Elevating Advocacy
            </p>
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;