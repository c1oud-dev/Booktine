import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  readingStatus?: '독서중' | '완독';
  author?: string;
  inputAuthor?: string;
  memos?: { id: number; memo: string }[];
  lastModified?: string; // 작성 날짜
}

const BookNote: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  // (null이면 메뉴가 닫힌 상태, postId가 들어있으면 그 게시물 메뉴만 열림)
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  // 삭제 모달 열림/닫힘
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // 삭제 대상 게시물 ID
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // "YYYY.MM.DD HH:mm" 형태로 반환
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchPosts = () => {
      fetch('http://localhost:8083/posts')
        .then((res) => {
          if (!res.ok) throw new Error('게시글 불러오기 실패');
          return res.json();
        })
        .then((data: Post[]) => {
          // (1) lastModified 기준으로 최근 게시물 우선 정렬
          data.sort((a, b) => {
            if (!a.lastModified || !b.lastModified) return 0;
            // 더 최근 날짜(시간)이 앞으로 오도록 내림차순
            return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
          });
  
          // (2) 정렬된 배열을 state에 저장
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

  // (B) 수정하기 버튼 클릭 → 글 수정 페이지 이동
  const handleEdit = (postId: number) => {
    // 메뉴 닫기
    setMenuPostId(null);
    // 예: /createpost/:id 로 이동
    navigate(`/createpost/${postId}`);
  };

  // (C) 삭제하기 버튼 클릭 → 삭제 모달 열기
  const handleDeleteClick = (postId: number) => {
    setMenuPostId(null);
    setDeleteTargetId(postId);
    setShowDeleteModal(true);
  };

  // (D) 실제 삭제 진행
  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;

    fetch(`http://localhost:8083/posts/${deleteTargetId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('게시글 삭제 실패');
        // 삭제 성공 시, posts를 다시 불러오거나 posts state에서 제거
        setPosts((prev) => prev.filter((p) => p.id !== deleteTargetId));
        setDeleteTargetId(null);
        setShowDeleteModal(false);
      })
      .catch((err) => console.error('Error deleting post:', err));
  };

  // (E) 삭제 모달 취소
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5' }}>
      <div
        style={{
          maxWidth: '1200px',
          padding: '100px 60px',
          margin: '0 auto',
          minHeight: '100vh',
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

        <hr style={{ border: '1px solid #000', marginBottom: '20px' }} />
        {/* 전체 글 문구 + 게시글 개수 */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>전체 글</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'red', marginLeft: '8px' }}>
            {filteredPosts.length}
          </span>
        </div>

        {/* 게시물이 없는 경우 */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <p style={{ fontSize: '18px', color: '#555', marginBottom: '10px' }}>게시물이 없습니다.</p>
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
          /* 게시물이 있는 경우 */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}
          >
            {filteredPosts.map((post) => {
              // 1) 독서 상태(읽는중/완독) 뱃지 색상/레이블
              let badgeColor = '#fff';
              let badgeLabel = '🔥 독서중';
              if (post.readingStatus === '완독') {
                badgeColor = '#486284';
                badgeLabel = '✅ 완독';
              }

              // 2) 저자
              let bookAuthor = '저자 미상';
              if (typeof post.author === 'object' && post.author !== null) {
                bookAuthor = post.inputAuthor || '저자 미상';
              } else if (typeof post.author === 'string') {
                bookAuthor = post.author;
              }

              // 3) 메모 일부 (snippet)
              const snippetLength = 60; // 약 4줄 정도
              const snippet =
                post.memos && post.memos.length > 0
                  ? post.memos[0].memo.length > snippetLength
                    ? post.memos[0].memo.slice(0, snippetLength) + '...'
                    : post.memos[0].memo
                  : post.content || '';

              return (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    padding: '20px',
                    boxSizing: 'border-box',
                    cursor: 'default',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  }}
                >
                  {/* 독서 상태 뱃지 및 메뉴 아이콘 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '15px',
                      position: 'relative',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div //뱃지
                      style={{
                        backgroundColor: badgeColor,
                        color: post?.readingStatus === '독서중' ? '#000' : '#fff',
                        borderRadius: '16px',
                        border: '1px solid #C4C4C4',
                        padding: '4px 12px',
                        fontSize: '12px',
                      }}
                    >
                      {badgeLabel}
                    </div>
                    <div
                      style={{
                        cursor: 'pointer',
                        fontSize: '24px',
                        marginLeft: 'auto',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuPostId(menuPostId === post.id ? null : post.id);
                      }}
                    >
                      ⋮
                    </div>
                    {menuPostId === post.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '0',
                          top: '30px',
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 10,
                          width: '130px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderBottom: '1px solid #ccc',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(post.id);
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>수정하기</span>
                          <img src="/modify_icon.png" alt="modify" style={{ width: '16px', height: '16px' }} />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            color: 'red',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(post.id);
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>삭제하기</span>
                          <img src="/delete_icon.png" alt="delete" style={{ width: '16px', height: '16px' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 책 제목 - 제목 클릭 시 이동 */}
                  <h3
                    className="post-title"
                    style={{
                      margin: '20px 0 0',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/post/${post.id}`);
                    }}
                  >
                    {post.title}
                  </h3>

                  {/* 저자 */}
                  <div style={{ marginTop: '20px', marginBottom: '20px', fontSize: '12px', color: '#111111' }}>
                    {post.inputAuthor || '저자 미상'}
                  </div>

                  {/* 메모 일부 (snippet) */}
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4', color: '#979797' }}>
                    {snippet}
                  </p>

                  {/* 작성 날짜 */}
                  <div
                    style={{
                      textAlign: 'left',
                      marginTop: '20px',
                      fontSize: '13px',
                      color: '#999',
                    }}
                  >
                    {formatDateTime(post?.lastModified ?? '')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 삭제 모달 */}
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: '300px',
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p>삭제하시겠습니까?</p>
              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleDeleteConfirm}
                  style={{
                    marginRight: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  확인
                </button>
                <button
                  onClick={handleDeleteCancel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fff',
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookNote;
