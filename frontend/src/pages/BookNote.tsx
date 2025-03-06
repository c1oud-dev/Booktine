import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 예시: 게시글(Post) 데이터 구조
interface Post {
  id: number;
  title: string;
  content: string;
}

const BookNote: React.FC = () => {
  // 게시글 목록 예시 (실제로는 API 호출 등을 통해 가져옴)
  const [posts, setPosts] = useState<Post[]>([]);

  const navigate = useNavigate();

  // "글쓰기" 버튼 클릭 시 처리할 함수 (예: 모달 열기 또는 다른 페이지로 이동)
  const handleCreatePost = () => {
    navigate('/createpost');
    // 여기서 모달 열기, 혹은 새 글 작성 페이지로 이동 로직 등을 구현
  };

  return (
    // 페이지 여백을 원하는 만큼 조절 (왼쪽, 오른쪽 등)
    <div
      style={{
        paddingLeft: '200px',
        paddingRight: '200px',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      {/* 상단 제목 */}
      <h2
        style={{
          fontWeight: 'bold',
          fontSize: '40px',
          marginBottom: '10px',
        }}
      >
        Book Note
      </h2>
      {/* 제목 아래 선 */}
      <hr style={{ border: '1px solid #000', marginBottom: '40px' }} />

      {/* 게시글이 없는 경우 / 있는 경우 조건부 렌더링 */}
      {posts.length === 0 ? (
        // 게시글이 없는 경우
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
        // 게시글이 존재하는 경우 (게시글 목록 표시)
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
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

          {/* 글쓰기 버튼 (게시글 목록 상단 또는 하단에 배치 가능) */}
          <button
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 20px',
              cursor: 'pointer',
            }}
            onClick={handleCreatePost}
          >
            글쓰기
          </button>
        </div>
      )}
    </div>
  );
};

export default BookNote;
