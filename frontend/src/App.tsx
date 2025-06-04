import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import HomePage from './pages/HomePage';
import BookNote from './pages/BookNote';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import Header from './components/Header';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import { useEffect, useState } from 'react';
import Footer from './components/Footer'; 
import { fetchCurrentUser } from './services/AuthService';


//라우팅 담당 파일
const App: React.FC = () => {

  const [auth, setAuth] = useState<{ email: string; nickname: string } | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const user = await fetchCurrentUser();
        setAuth(user);          // user === null → 비로그인
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/booknote" element={<BookNote />} />
        <Route path="/createpost/:id" element={<CreatePostPage />} />
        <Route path="/createpost" element={<CreatePostPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
