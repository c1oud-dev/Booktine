import { Outlet } from 'react-router-dom';
import AppFooter from './AppFooter';
import AppHeader from './AppHeader';

export default function AppLayout() {
  return (
    <div className="app-shell flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="app-main w-full flex-1">
        <div className="rounded-2xl border border-border/70 bg-card px-4 py-6 shadow-card sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
