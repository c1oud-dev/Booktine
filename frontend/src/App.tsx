import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import HomePage from './pages/HomePage';
import BookNote from './pages/BookNote';
import CreatePostPage from './pages/CreatePostPage';
import Header from './components/Header';

//라우팅 담당 파일
const App: React.FC = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/booknote" element={<BookNote />} />
        <Route path="/createpost" element={<CreatePostPage />} />
      </Routes>
    </div>
  );
};

export default App;