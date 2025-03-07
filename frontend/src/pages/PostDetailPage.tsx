import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface PostDetail {
  id: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  lastModified: string; // 예: "2023-03-15 14:30"
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
    navigate(`/createpost?id=${id}`);
  };

  const handleDelete = () => {
    fetch(`/posts/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          navigate('/booknote');
        } else {
          alert('게시글 삭제 실패');
        }
      })
      .catch((err) => console.error('Error deleting post:', err));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 헤더 영역: 사용자 정보 및 메뉴 아이콘 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 사용자 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={post.author.avatar}
            alt="User Avatar"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{post.author.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{post.lastModified}</div>
          </div>
        </div>
        {/* 메뉴 아이콘 */}
        <div style={{ position: 'relative' }}>
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
              }}
            >
              <button
                onClick={handleEdit}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                수정하기
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                삭제하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 게시글 제목 */}
      <h1 style={{ marginTop: '20px' }}>{post.title}</h1>
      <hr style={{ marginBottom: '20px' }} />

      {/* 게시글 내용 */}
      <div style={{ lineHeight: '1.6' }}>
        {post.content}
      </div>

      {/* 삭제 확인 Modal */}
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
