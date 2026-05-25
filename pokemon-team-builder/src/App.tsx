import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { LookupPage } from './pages/LookupPage';
import { TeamPage } from './pages/TeamPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <main className="max-w-2xl mx-auto">
            <Routes>
              <Route path="/" element={<LookupPage />} />
              <Route path="/team" element={<TeamPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </QueryClientProvider>
  );
}
