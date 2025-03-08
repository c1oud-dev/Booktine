import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface PostDetail {
  id: number;
  title: string;
  startDate: string;
  readingStatus: '독서중' | '완독';
  inputAuthor: string;
  genre: string;
  publisher: string;
  summary: string;
  review: string;
  endDate: string;
  
  author: {
    name: string;
    avatar: string;
  };
  lastModified: string;

  // 메모 목록
  memos: {
    id: number;
    pageNumber: string;
    memo: string;
  }[];
}

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<PostDetail | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8083/posts/${id}`) // 절대 경로 사용
      .then((res) => {
        if (!res.ok) {
          throw new Error('게시글 불러오기 실패');
        }
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => console.error('Error fetching post:', err));
  }, [id]);

  const handleEdit = () => {
    // URL 경로 파라미터 방식으로 전달하여 CreatePostPage에서 기존 데이터를 로드하도록 함
    navigate(`/createpost/${id}`);
  };

  const handleDelete = () => {
    fetch(`http://localhost:8083/posts/${id}`, { method: 'DELETE' })
    .then((res) => {
      if (!res.ok) {
        throw new Error('게시글 삭제 실패');
      }
      navigate('/booknote');
    })
    .catch((err) => console.error('Error deleting post:', err));
  };

  if (!post) return <div>Loading...</div>;

  // PostDetailPage.tsx 내 최하단의 return(...) 부분만 교체
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
      {/* ──────────────────────────────────────────────
          (1) 상단 영역: 책을 펴낸 날짜 박스 + 독서 상태
          ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        {/* 책을 펴낸 날 아이콘 + 날짜 박스 */}
        <img
          src="/openbook_icon.png"
          alt="open book icon"
          style={{ width: '30px', height: '30px' }}
        />
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>책을 펴낸 날</span>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid #ccc',
            backgroundColor: '#eee', 
            padding: '6px 10px',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {post?.startDate || '—'}
        </div>

        {/* 독서 상태 (CreatePostPage와 동일 스타일) */}
        {post?.readingStatus === '독서중' ? (
          <div
            style={{
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '20px',
              padding: '8px 16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🔥 독서중
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#0538ff',
              color: '#fff',
              border: '1px solid #ccc',
              borderRadius: '20px',
              padding: '8px 16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ✅ 완독
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────
          (2) 메인 제목
          ────────────────────────────────────────────── */}
      <h1 style={{ margin: '0 0 20px 0', fontSize: '36px', fontWeight: 'bold' }}>
        {post?.title}
      </h1>

      {/* (3) 사용자 정보, 작성일자/시간, 메뉴 아이콘 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {/* 사용자 사진 */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#ccc',
            border: '1px solid #666',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {post.author.avatar && (
            <img
              src={post.author.avatar}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        {/* 사용자명 및 작성일자/시간 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{post.author.name}</span>
          <span style={{ fontSize: '14px', color: '#666' }}>{post.lastModified}</span>
        </div>
        {/* 메뉴 아이콘: 오른쪽 정렬 */}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: 'pointer', fontSize: '24px' }}
          >
            ⋮
          </div>
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '30px',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 10,
                width: '130px',
              }}
            >
              {/* 수정하기 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid #ccc',
                }}
                onClick={handleEdit}
              >
                <span style={{ fontSize: '14px' }}>수정하기</span>
                <img
                  src="/modify_icon.png"
                  alt="modify"
                  style={{ width: '16px', height: '16px' }}
                />
              </div>
              {/* 삭제하기 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  color: 'red',
                }}
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
              >
                <span style={{ fontSize: '14px' }}>삭제하기</span>
                <img
                  src="/delete_icon.png"
                  alt="delete"
                  style={{ width: '16px', height: '16px' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <hr style={{ marginBottom: '20px' }} />

      {/* ──────────────────────────────────────────────
          (5) 저자, 장르, 출판사, 한줄요약
          ────────────────────────────────────────────── */}
      <div style={{ marginTop: '40px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>저 자</label>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '6px 8px',
              backgroundColor: '#eee',
              fontSize: '13px',
              width: 'fit-content',
              whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록
              minWidth: '50px',      // 최소 가로 폭 설정
              minHeight: '2.3em',    // 최소 높이 설정 (텍스트 라인 높이와 유사)
            }}
          >
            {post.inputAuthor}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>장 르</label>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '6px 8px',
              backgroundColor: '#eee',
              fontSize: '13px',
              width: 'fit-content',
              whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록
              minWidth: '50px',      // 최소 가로 폭 설정
              minHeight: '2.3em',    // 최소 높이 설정 (텍스트 라인 높이와 유사)
            }}
          >
            {post.genre}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <label style={{ fontWeight: 'bold' }}>출판사</label>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '6px 8px',
              backgroundColor: '#eee',
              fontSize: '13px',
              width: 'fit-content',
              whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록
              minWidth: '50px',      // 최소 가로 폭 설정
              minHeight: '2.3em',    // 최소 높이 설정 (텍스트 라인 높이와 유사)
            }}
          >
            {post.publisher}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>한줄요약</label>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '6px 8px',
              backgroundColor: '#eee',
              fontSize: '13px',
              width: 'fit-content',
              whiteSpace: 'nowrap', // 텍스트가 줄바꿈되지 않도록
              minWidth: '50px',      // 최소 가로 폭 설정
              minHeight: '2.3em',    // 최소 높이 설정 (텍스트 라인 높이와 유사)
            }}
          >
            {post.summary}
          </span>
        </div>

      </div>

      {/* ──────────────────────────────────────────────
          (6) 메모들
          ────────────────────────────────────────────── */}
      {post?.memos && post.memos.map((m) => (
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>P. {m.pageNumber}
        <div
          key={m.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '20px',
            backgroundColor: '#fff',
          }}
        >
          <div>{m.memo}</div>
        </div>
          </div>
      ))}

      {/* ──────────────────────────────────────────────
          (7) 후기
          ────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#fff4c2',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #ccc',
        }}
      >
        <h3 style={{ margin: 0, marginBottom: '10px', fontWeight: 'bold' }}>후기</h3>
        <p style={{ margin: 0 }}>{post?.review || ''}</p>
      </div>

      {/* ──────────────────────────────────────────────
          (8) 책을 닫은 날 (오른쪽 하단)
          ────────────────────────────────────────────── */}
      <div style={{ textAlign: 'right', marginTop: '30px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <img
            src="/closebook_icon.png"
            alt="close book icon"
            style={{ width: '20px', height: '20px' }}
          />
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>책을 닫은 날</span>
          <div
            style={{
              border: '1px solid #ccc',
              backgroundColor: '#eee',
              padding: '5px 10px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {post?.endDate || '  '}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          (9) 삭제 확인 Modal
          ────────────────────────────────────────────── */}
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
                onClick={() => {
                  setShowDeleteModal(false);
                  handleDelete();
                }}
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
                onClick={() => setShowDeleteModal(false)}
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
  );

};

export default PostDetailPage;
