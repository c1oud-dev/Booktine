// BookNote.tsx (수정된 부분, 전체 코드 참고)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
}

const BookNote: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  // 백엔드에서 게시글 목록을 가져오는 useEffect 추가
  useEffect(() => {
    const fetchPosts = () => {
      fetch('http://localhost:8083/posts')
        .then((res) => {
          if (!res.ok) throw new Error('게시글 불러오기 실패');
          return res.json();
        })
        .then((data) => {
          setPosts(data);
        })
        .catch((error) => console.error('Error fetching posts:', error));
    };
  
    fetchPosts();
  
    // "postsUpdated" 이벤트 발생 시 다시 fetch
    window.addEventListener('postsUpdated', fetchPosts);
  
    return () => {
      window.removeEventListener('postsUpdated', fetchPosts);
    };
  }, []);

  const handleCreatePost = () => {
    navigate('/createpost');
  };

  return (
    <div
      style={{
        paddingLeft: '200px',
        paddingRight: '200px',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      {/* 헤더 영역: "Book Note" + 글쓰기 버튼 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <h2 style={{ fontWeight: 'bold', fontSize: '40px' }}>Book Note</h2>
        <button
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 25px',
            cursor: 'pointer',
          }}
          onClick={handleCreatePost}
        >
          글쓰기
        </button>
      </div>

      <hr style={{ border: '1px solid #000', marginBottom: '40px' }} />

      {posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: '100px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}>
            게시물이 없습니다.
          </p>
          <p style={{ fontWeight: 'bold', fontSize: '40px', color: '#777', marginBottom: '30px' }}>
            게시물을 작성해주세요.
          </p>
          <button
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 25px',
              cursor: 'pointer',
            }}
            onClick={handleCreatePost}
          >
            글쓰기
          </button>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              style={{
                cursor: 'pointer',
                marginBottom: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
        
        </div>
      )}
    </div>
  );
};

export default BookNote;
