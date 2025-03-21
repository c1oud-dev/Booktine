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
      window.dispatchEvent(new Event('postsUpdated'));
      navigate('/booknote');
    })
    .catch((err) => console.error('Error deleting post:', err));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div style={{ 
        backgroundColor: '#F7F5F5',
        minHeight: '100vh',
      }}
    >
      {/* 회색 배경 상단 영역 */}
      <div
        style={{
          height: '250px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#999',
          color: '#fff',
          marginTop: '60px',
        }}
      >
        {/* (1) 독서 상태 뱃지 */}
        <div
          style={{
            backgroundColor: post?.readingStatus === '독서중' ? '#fff' : '#486284',
            color: post?.readingStatus === '독서중' ? '#333' : '#fff',
            border: '1px solid #C4C4C4',
            borderRadius: '20px',
            padding: '5px 11px',
            fontWeight: 'bold',
            marginBottom: '30px',
            fontSize: '14 px',
          }}
        >
          {post?.readingStatus === '독서중' ? '🔥 독서중' : '✅ 완독'}
        </div>

        {/* (2) 제목 */}
        <h1
          style={{
            fontSize: '24px',
            textAlign: 'center',
            width: '60%',
            color: '#fff',
            paddingBottom: '15px',
            fontWeight: 'bold'
          }}
        >
          {post?.title}
        </h1>

        {/* (3) 사용자 정보 */}
        <div
          style={{
            width: '70%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '30px'
          }}
        >
          {/* 사용자 프로필 사진 */}
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            {post?.author.avatar && (
              <img
                src={post.author.avatar}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>

          {/* 사용자명 */}
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {post?.author.name}
          </span>

          {/* 작성일자 */}
          <div style={{ fontSize: '14px', color: '#ddd',}}>
            {formatDateTime(post?.lastModified ?? '')}
          </div>

          {/* 메뉴 아이콘 (오른쪽 정렬) */}
          <div style={{  marginLeft: 'auto', position: 'relative' }}>
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
                  right: '5px',
                  top: '35px',
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
                    color: 'black',
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
      </div>


      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Book Information */}
      <div style={{ marginBottom: '70px' }}>
        <h2 style={{ fontSize: '25px', fontWeight: 'bold', marginBottom: '25px' }}>
          Book Information
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          {/* 왼쪽: 책을 펴낸 날, 저자, 장르, 출판사 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '100px', fontWeight: 'bold' }}>책을 펴낸 날</label>
              <input
                type="date"
                value={post?.startDate || ''}
                readOnly
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '60px', fontWeight: 'bold' }}>저 자 명</label>
              <input
                type="text"
                value={post?.inputAuthor || ''}
                readOnly
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '60px', fontWeight: 'bold' }}>장 르</label>
              <input
                type="text"
                value={post?.genre || ''}
                readOnly
                placeholder="장르"
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ width: '60px', fontWeight: 'bold' }}>출 판 사</label>
              <input
                type="text"
                value={post?.publisher || ''}
                readOnly
                style={{ flex: 1, padding: '8px', border: '1px solid #ccc' }}
              />
            </div>
          </div>
          {/* 오른쪽: Summary */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>Summary</label>
            <textarea
              value={post?.summary || ''}
              readOnly
              placeholder="요약한 내용이 없어요."
              style={{ flex: 1, padding: '10px', border: '1px solid #ccc', resize: 'none' }}
            />
          </div>
        </div>
      </div>


      {/* Memo */}
      <div style={{ marginBottom: '70px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Memo</h2>
        {post?.memos && post.memos.map((m) => (
          <div key={m.id}>
            <div
              style={{
                position: 'relative',
                backgroundColor: '#fff',
                boxShadow: '4px 4px 4px rgba(0,0,0,0.25)',
                marginBottom: '40px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: 10,
                  width: '30px',
                  height: '30px',
                  backgroundColor: 'red',
                  backgroundImage: 'url("/bookmark_icon.png")',
                  backgroundSize: 'cover',
                }}
              />
              <textarea
                value={m.memo}
                readOnly
                style={{
                  width: '100%',
                  minHeight: '100px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  marginTop: '20px',
                  backgroundColor: '#fff',
                }}
              />
              {m.pageNumber && m.pageNumber.trim() !== '' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '20px',
                  fontWeight: 'bold',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Page</span>
                <input
                  type="text"
                  value={m.pageNumber}
                  readOnly
                  style={{
                    textAlign: 'center',
                    width: '80px',
                    border: 'none',
                    outline: 'none',
                  }}
                />
              </div>
            )}


            </div>
          </div>
        ))}
      </div>

      {/* Review */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Review</h2>
        <div style={{ backgroundColor: '#fff', boxShadow: '4px 4px 4px rgba(0,0,0,0.25)', padding: '20px' }}>
          <textarea
            value={post?.review || ''}
            readOnly
            placeholder="리뷰를 작성한 게 없어요."
            style={{ width: '100%', minHeight: '100px', border: 'none', outline: 'none', resize: 'none' }}
          />
        </div>
      </div>

      {/* 책을 닫은 날 */}
      <div style={{ textAlign: 'right', marginTop: '50px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>책을 닫은 날</label>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <input
            type="date"
            value={post?.endDate || ''}
            readOnly
            style={{ padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff' }}
          />
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
