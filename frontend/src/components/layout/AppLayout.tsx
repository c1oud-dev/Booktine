import { Outlet } from 'react-router-dom';
import AppFooter from './AppFooter';
import AppHeader from './AppHeader';

export default function AppLayout() {
  return (
    <div className="app-shell flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
