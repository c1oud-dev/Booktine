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
import { useEffect } from 'react';
import Footer from './components/Footer'; 


//라우팅 담당 파일
const App: React.FC = () => {
  useEffect(() => {
    
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
