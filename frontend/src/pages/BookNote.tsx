import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  readingStatus?: '독서중' | '완독';  // 독서 상태
  author?: string;                    // 사용자가 글 작성 시 입력한 "책의 저자"
  inputAuthor?: string;
  memos?: { id: number; memo: string }[];
}

const BookNote: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = () => {
      fetch('http://localhost:8083/posts')
        .then((res) => {
          if (!res.ok) throw new Error('게시글 불러오기 실패');
          return res.json();
        })
        .then((data: Post[]) => {
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

  // 검색어로 필터링 (제목 + 내용에 searchTerm 포함 여부)
  const filteredPosts = posts.filter((post) => {
    const combinedText = `${post.title} ${post.content}`.toLowerCase();
    return combinedText.includes(searchTerm.toLowerCase());
  });

  return (
    <div
      style={{
        padding: '40px 60px',
        boxSizing: 'border-box',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* 상단 영역: Book Note + 검색 + 글쓰기 버튼 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontWeight: 'bold', fontSize: '40px', margin: 0 }}>Book Note</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '20px',
              border: '1px solid #ccc',
              outline: 'none',
            }}
          />
          <button
            onClick={handleCreatePost}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 20px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            글쓰기
          </button>
        </div>
      </div>

      <hr style={{ border: '1px solid #000', marginBottom: '40px' }} />

      {/* 게시물이 없는 경우는 기존 코드 그대로 유지 */}
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
        /* 게시물이 있는 경우 → 원하는 디자인 */
        <div>
          {filteredPosts.map((post) => {
            // 1) 독서 상태(읽는중/완독) 뱃지 색상/레이블 결정
            let badgeColor = '#F39C12'; // 기본: 독서중(주황)
            let badgeLabel = '독서중';
            if (post.readingStatus === '완독') {
              badgeColor = '#2ECC71'; // 완독(초록)
              badgeLabel = '완독';
            }

            // 2) 저자 (사용자가 글 작성 시 입력)
           // post.author가 { name, avatar } 형태라면:
            let bookAuthor = '저자 미상';
            if (typeof post.author === 'object' && post.author !== null) {
              bookAuthor = post.inputAuthor || '저자 미상';
            } else if (typeof post.author === 'string') {
              bookAuthor = post.author;
            }
            // 3) 메모 일부 → post.content에서 앞부분만 추출
            //    (사용자가 입력한 "메모"가 content라고 가정)
            const snippetLength = 120;
            const snippet = (post.memos && post.memos.length > 0)
              ? (post.memos[0].memo.length > snippetLength
                  ? post.memos[0].memo.slice(0, snippetLength) + '...'
                  : post.memos[0].memo)
              : (post.content || '');

            return (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                style={{
                  cursor: 'pointer',
                  marginBottom: '20px',
                }}
              >
                {/* 독서 상태 뱃지 */}
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: badgeColor,
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  {badgeLabel}
                </div>

                {/* 책 제목 */}
                <h3 style={{ margin: '8px 0 4px 0', fontSize: '20px' }}>
                  {post.title}
                </h3>

                {/* 저자 */}
                <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                  {post.inputAuthor || '저자 미상'}
                </div>

                {/* 메모 일부 (snippet) */}
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                  {snippet}
                </p>

                {/* 하나의 게시글마다 선으로 구분 */}
                <hr style={{
                  marginTop: '16px',
                  border: 0,
                  borderTop: '1px solid #ccc',
                }}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookNote;
