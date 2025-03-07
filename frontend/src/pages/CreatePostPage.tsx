import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Memo {
  id: number;
  pageNumber: string;
  memo: string;
  isMemoSaved: boolean;
}

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const postId = searchParams.get('id'); // URL에 ?id=xxx 형태로 전달

  useEffect(() => {
    if (postId) {
      // 예: 기존 게시글 데이터 불러오기 (fetch 사용, axios 등으로 변경 가능)
      fetch(`/posts/${postId}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title);
          // 필요에 따라 저자, 장르, 출판사, 한줄요약, 리뷰, 메모 등 다른 상태도 설정
          // 예: setMemos(data.memos);
        })
        .catch((error) => console.error('Error fetching post:', error));
    }
  }, [postId]);

  // ──────────────────────────────────────────────
  // 1) 모달 관련 상태 및 핸들러들
  // ──────────────────────────────────────────────

  const [showToast, setShowToast] = useState(false);
  const [showConfirmBackModal, setShowConfirmBackModal] = useState(false); // "뒤로가기" 확인 모달
  const [showCongratsModal, setShowCongratsModal] = useState(false); // "완독 축하합니다!" 모달

  const [readingStatus, setReadingStatus] = useState<'독서중' | '완독'>('독서중');

  const handleGoBack = () => {
    // 저장하지 않은 내용이 있다면 뒤로가기 모달 띄우기
    setShowConfirmBackModal(true);
  };
  const confirmGoBack = () => {
    setShowConfirmBackModal(false);
    navigate('/booknote');
  };
  const cancelGoBack = () => {
    setShowConfirmBackModal(false);
  };

  const handleCloseBookDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
        // 책을 닫은 날짜가 지정되면 "완독" 상태로 변경
        setReadingStatus('완독');
        setShowCongratsModal(true);
      }
  };
  const handleCloseCongratsModal = () => {
    setShowCongratsModal(false);
  };

  // ──────────────────────────────────────────────
  // 2) 제목 관련 상태 (제목 미입력 시 오류 처리)
  // ──────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ──────────────────────────────────────────────
  // 3) 메모 관련 상태 및 로직 (다중 메모)
  // ──────────────────────────────────────────────
  const [memos, setMemos] = useState<Memo[]>([
    { id: Date.now(), pageNumber: '', memo: '', isMemoSaved: false },
  ]);

  // 각 textarea DOM을 저장할 ref 객체 (key: 메모 id)
  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  // 자동 높이 조정 함수
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };

  const handleAddMemo = () => {
    const newMemo: Memo = { id: Date.now(), pageNumber: '', memo: '', isMemoSaved: false };
    setMemos([...memos, newMemo]);
  };

  // 메모 등록 버튼은 단순히 해당 메모의 isMemoSaved 상태를 변경만 함
  const handleRegisterMemo = (id: number) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isMemoSaved: true } : m))
    );
    setTimeout(() => {
      const el = textAreaRefs.current[id];
      if (el) {
        autoResize(el);
      }
    }, 0);
  };

  const handleEditMemo = (id: number) => {
    setMemos(memos.map((m) => (m.id === id ? { ...m, isMemoSaved: false } : m)));
  };

  const handleDeleteMemo = (id: number) => {
    setMemos(memos.filter((m) => m.id !== id));
  };

  const handleMemoChange = (id: number, field: 'pageNumber' | 'memo', value: string) => {
    setMemos(memos.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // ──────────────────────────────────────────────
  // 4) 저장하기 버튼 처리 (페이지 하단)
  // ──────────────────────────────────────────────
  const handleSave = () => {
    // 만약 제목이 입력되지 않았다면, 제목 입력 필드로 포커스 이동 및 빨간 테두리 처리
    if (title.trim() === '') {
      setTitleError(true);
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        // 스크롤도 제목 입력 필드로 이동
        titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const username = localStorage.getItem('username') || '익명'; // 회원가입 시 설정한 사용자 이름(예: firstName+lastName)
    const defaultAvatar = '/default_avatar.png'; // 기본 회색 원 이미지 경로
    // 저장 로직 처리 (예: 백엔드 API 호출 등)
    // 저장할 게시글 데이터 구성
    const postData = {
        title,
        author: {
            name: username,               // 실제 사용자 이름으로 변경 필요
            avatar: defaultAvatar // 실제 사용자 아바타 URL로 변경 필요
          },
    // 필요한 다른 필드: author, genre, publisher, summary, review, startDate, endDate, memos 등
    };

    // postId가 있으면 수정(PUT), 없으면 신규 생성(POST)
    const requestMethod = postId ? 'PUT' : 'POST';
    const backendUrl = 'http://localhost:8083'; // 백엔드 서버 주소와 포트
    const requestUrl = postId ? `${backendUrl}/posts/${postId}` : `${backendUrl}/posts`;

    fetch(requestUrl, {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
        })
        .then((res) => {
        if (!res.ok) throw new Error('Save failed');
        return res.json();
        })
        .then((data) => {
        // 저장 완료 후, Book Note 페이지로 이동하거나 토스트 메시지 표시 등
        navigate('/booknote');
        })
        .catch((error) => {
        console.error('Error saving post:', error);
        // 필요에 따라 에러 처리
        });

    // 토스트 메시지 표시
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // 3초 후 토스트 숨김
};

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '60px 20px',
      }}
    >
      {/* ── 상단 영역: 책을 펴낸 날, 독서중, 뒤로가기 ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <img
            src="/openbook_icon.png"
            alt="open book icon"
            style={{ width: '30px', height: '30px' }}
          />
          <label style={{ fontSize: '20px', fontWeight: 'bold' }}>책을 펴낸 날</label>
          <input
            type="date"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />

        {/* 상태 표시 (독서중 / 완독) */}
        <div
            style={{
            backgroundColor: readingStatus === '독서중' ? '#fff' : '#0538ff', 
            color: readingStatus === '독서중' ? '#333' : '#fff',
            border: '1px solid #ccc',
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 'bold',
            cursor: 'default', // 클릭 불가
            }}
        >
            {readingStatus === '독서중' ? '🔥 독서중' : '✅ 완독'}
            </div>
        </div>
        <button
          onClick={handleGoBack}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          뒤로가기
        </button>
      </div>

      {/* ── 제목 입력 영역 (제목 미입력 시 빨간 테두리 처리) ── */}
      <div style={{ marginBottom: '10px' }}>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim() !== '') {
              setTitleError(false);
            }
          }}
          placeholder="책 제목을 입력해주세요."
          style={{
            width: '100%',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'black',
            border: titleError ? '2px solid red' : 'none',
            outline: 'none',
          }}
        />
      </div>
      <hr style={{ marginBottom: '30px' }} />

      {/* ── 글쓰기 폼 영역 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '50px' }}>
        {/* 저자 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '70px', fontWeight: 'bold' }}>저 자</label>
          <input
            type="text"
            placeholder="저자를 입력하세요."
            style={{
              width: '50%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* 장르 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '70px', fontWeight: 'bold' }}>장 르</label>
          <select
            style={{
              width: '50%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <option value="">장르 선택</option>
            <option value="총류">총류</option>
            <option value="철학">철학</option>
            <option value="종교">종교</option>
            <option value="사회과학">사회과학</option>
            <option value="자연과학">자연과학</option>
            <option value="기술과학">기술과학</option>
            <option value="예술">예술</option>
            <option value="언어">언어</option>
            <option value="문학">문학</option>
            <option value="역사">역사</option>
          </select>
        </div>

        {/* 출판사 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <label style={{ width: '70px', fontWeight: 'bold' }}>출판사</label>
          <input
            type="text"
            placeholder="출판사를 입력하세요."
            style={{
              width: '50%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* 한줄요약 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '70px', fontWeight: 'bold' }}>한줄요약</label>
          <textarea
            placeholder="책을 한줄로 요약하세요."
            style={{
              width: '95%',
              height: '50px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>
      </div>

      {/* ── 메모 입력 영역 (다중 메모) ── */}
      {memos.map((m) => (
        <div key={m.id}>
          {/* 책 페이지 입력 + 등록/수정/삭제 버튼 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>P. </label>
              <input
                type="text"
                placeholder="책 페이지"
                value={m.pageNumber}
                onChange={(e) =>
                  handleMemoChange(m.id, 'pageNumber', e.target.value)
                }
                disabled={m.isMemoSaved}
                style={{
                  width: '120px',
                  padding: m.isMemoSaved ? '0px' : '5px',
                  border: m.isMemoSaved ? 'none' : '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: m.isMemoSaved ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                  backgroundColor: m.isMemoSaved ? '#fff' : undefined,
                  fontWeight: m.isMemoSaved ? 'bold' : 'normal',
                }}
              />
            </div>
            <div>
              {!m.isMemoSaved ? (
                <button
                  onClick={() => handleRegisterMemo(m.id)}
                  style={{
                    backgroundColor: '#b1b1b1',
                    color: '#fff',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    padding: '5px 19px',
                    cursor: 'pointer',
                  }}
                >
                  등록
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleEditMemo(m.id)}
                    style={{
                      backgroundColor: '#b1b1b1',
                      color: '#fff',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      padding: '5px 19px',
                      cursor: 'pointer',
                      marginRight: '5px',
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteMemo(m.id)}
                    style={{
                      backgroundColor: '#b1b1b1',
                      color: '#fff',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      padding: '5px 19px',
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 메모 입력창 */}
          <div style={{ marginBottom: '30px' }}>
            <textarea
              ref={(el) => (textAreaRefs.current[m.id] = el)}
              placeholder="기록하고 싶은 내용을 입력하세요."
              value={m.memo}
              onChange={(e) =>
                handleMemoChange(m.id, 'memo', e.target.value)
              }
              disabled={m.isMemoSaved}
              style={{
                width: '100%',
                height: m.isMemoSaved ? 'auto' : '100px',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: m.isMemoSaved ? '#f0f0f0' : '#fff',
                overflow: 'hidden',
                resize: 'none',
              }}
            />
          </div>
        </div>
      ))}

      {/* + 추가하기 버튼 (항상 최하단에 위치) */}
      <div style={{ textAlign: 'left', marginBottom: '40px' }}>
        <button
          onClick={handleAddMemo}
          style={{
            backgroundColor: '#fff',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          + 추가하기
        </button>
      </div>

      {/* ── 리뷰 영역 ── */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
          리뷰
        </label>
        <textarea
          placeholder="리뷰를 작성하세요."
          style={{
            width: '100%',
            height: '100px',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* ── 책을 닫은 날 입력 영역 ── */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            alignItems: 'center',
            marginTop: '30px',
          }}
        >
          <img
            src="/closebook_icon.png"
            alt="close book icon"
            style={{ width: '30px', height: '30px' }}
          />
          <label style={{ fontSize: '20px', fontWeight: 'bold' }}>
            책을 닫은 날
          </label>
          <input
            type="date"
            onChange={handleCloseBookDate}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* 저장하기 버튼 (제목 미입력 시 제목 입력란으로 이동 후 빨간 테두리 적용) */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: 'pointer',
            }}
          >
            저장하기
          </button>
        </div>
      </div>

      {/* ── 모달 영역 ── */}
      {/* (1) "저장이 정상적으로 완료되었습니다." 모달 (저장하기 버튼 클릭 시) */}
      {showToast && (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '4px',
            zIndex: 1000,
        }}>
            <img
              src="/save_icon.png"
              alt="save icon"
              style={{ display: 'block', margin: '0 auto 10px', width: '50px' }}
            />
              저장이 정상적으로 완료되었습니다.
          </div>
      )}

      {/* (2) "뒤로가기" 확인 모달 */}
      {showConfirmBackModal && (
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
          }}
        >
          <div
            style={{
              width: '320px',
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ marginBottom: '20px' }}>
              저장하시겠습니까?
            </p>
            <button
              onClick={confirmGoBack}
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
              onClick={cancelGoBack}
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
      )}

      {/* (3) "완독을 축하합니다!" 모달 (아이콘 이미지를 중앙에 배치) */}
      {showCongratsModal && (
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
          }}
        >
          <div
            style={{
              width: '300px',
              padding: '40px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <img
              src="/success_icon.png"
              alt="success icon"
              style={{ display: 'block', margin: '0 auto 20px', width: '100px' }}
            />
            <p style={{ marginTop: '30px', marginBottom: '30px', fontSize: '20px', fontWeight: 'bold', }}>완독을 축하합니다!</p>
            <button
              onClick={handleCloseCongratsModal}
              style={{
                padding: '8px 60px',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostPage;
