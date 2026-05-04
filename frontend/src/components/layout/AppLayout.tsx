import { Link, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Booktine</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/mypage">My Page</Link>
          <Link to="/progress">Progress</Link>
          <Link to="/recommendations">Recommendation</Link>
          <Link to="/signup">Sign up</Link>
          <Link to="/login">Login</Link>
          <Link to="/logout">Logout</Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
