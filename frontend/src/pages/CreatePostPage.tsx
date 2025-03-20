import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Memo {
  id: number;
  pageNumber: string;
  memo: string;
  isMemoSaved: boolean;
}

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: postId } = useParams(); // URL 파라미터로부터 id (수정 모드 여부)

  // 기존 로직 그대로
  const [showToast, setShowToast] = useState(false);
  const [showConfirmBackModal, setShowConfirmBackModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readingStatus, setReadingStatus] = useState<'독서중' | '완독'>('독서중');

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [memos, setMemos] = useState<Memo[]>([
    { id: Date.now(), pageNumber: '', memo: '', isMemoSaved: false },
  ]);

  const textAreaRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [inputAuthor, setInputAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publisher, setPublisher] = useState('');
  const [summary, setSummary] = useState('');
  const [review, setReview] = useState('');

  // 추가: 사진 추가하기 (파일 업로드) 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  // (1) 글 수정 모드: 기존 게시글 불러오기
  useEffect(() => {
    if (!postId) return; // 새 글쓰기면 postId 없음
    fetch(`http://localhost:8083/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error('게시글 불러오기 실패');
        return res.json();
      })
      .then((data) => {
        setTitle(data.title);
        setStartDate(data.startDate);
        setReadingStatus(data.readingStatus);
        setInputAuthor(data.inputAuthor);
        setGenre(data.genre);
        setPublisher(data.publisher);
        setSummary(data.summary);
        setReview(data.review);
        setEndDate(data.endDate); // 책을 닫은 날짜도 세팅

        // memos
        if (data.memos) {
          setMemos(
            data.memos.map((m: any) => ({
              id: m.id,
              pageNumber: m.pageNumber,
              memo: m.memo,
              isMemoSaved: true,
            }))
          );
        }
      })
      .catch((err) => console.error('Error fetching post:', err));
  }, [postId]);

  // (2) 뒤로가기 로직
  const handleGoBack = () => {
    if (isSaved) {
      navigate('/booknote');
    } else {
      setShowConfirmBackModal(true);
    }
  };
  const confirmGoBack = () => {
    setShowConfirmBackModal(false);
    handleSave(undefined, true);
  };
  const cancelGoBack = () => {
    setShowConfirmBackModal(false);
  };

  // (3) 책을 닫은 날 → 완독
  const handleCloseBookDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setReadingStatus('완독');
      setShowCongratsModal(true);
    }
  };
  const handleCloseCongratsModal = () => {
    setShowCongratsModal(false);
  };

  // (4) 메모 로직
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  };
  const handleAddMemo = () => {
    const newMemo: Memo = {
      id: Date.now(),
      pageNumber: '',
      memo: '',
      isMemoSaved: false,
    };
    setMemos([...memos, newMemo]);
  };
  const handleRegisterMemo = (id: number) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isMemoSaved: true } : m))
    );
    setTimeout(() => {
      const el = textAreaRefs.current[id];
      if (el) autoResize(el);
    }, 0);
  };
  const handleEditMemo = (id: number) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isMemoSaved: false } : m))
    );
  };
  const handleDeleteMemo = (id: number) => {
    setMemos(memos.filter((m) => m.id !== id));
  };
  const handleMemoChange = (id: number, field: 'pageNumber' | 'memo', value: string) => {
    setMemos(memos.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  // (5) 사진 추가하기
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedImage(e.target.files[0]);
      // 필요 시 미리보기 로직 추가
    }
  };

  // (6) 저장하기
  const handleSave = (
    e?: React.MouseEvent<HTMLButtonElement>,
    navigateAfterSave = false
  ) => {
    if (e) e.preventDefault();
    if (title.trim() === '') {
      setTitleError(true);
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
      alert('로그인이 필요합니다.');
      return;
    }
    const defaultAvatar = '/default_avatar.png';

    const postData = {
      title,
      startDate,
      readingStatus,
      author: { name: username, avatar: defaultAvatar },
      inputAuthor,
      genre,
      publisher,
      summary,
      review,
      endDate,
      memos,
      // uploadedImage 등 파일 업로드는 백엔드 API에 맞춰 추가 구현 필요
    };

    const requestMethod = postId ? 'PUT' : 'POST';
    const requestUrl = postId
      ? `http://localhost:8083/posts/${postId}`
      : 'http://localhost:8083/posts';

    fetch(requestUrl, {
      method: requestMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Save failed');
        return res.json();
      })
      .then(() => {
        setIsSaved(true);
        window.dispatchEvent(new Event('postsUpdated'));
        if (navigateAfterSave) {
          navigate('/booknote');
        }
      })
      .catch((error) => console.error('Error saving post:', error));

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div
      style={{
        backgroundColor: '#F7F5F5',
        minHeight: '100vh',
        paddingBottom: '120px', // 아래 고정 버튼영역 확보
      }}
    >
      {/* 상단 영역: 제목 입력 + 사진 추가하기 버튼 */}
      <div
        style={{
          height: '250px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#999', // 원하는 배경색(예시), 또는 #ccc
          color: '#fff',
          marginTop: '60px'
        }}
      >
        {/* 제목 입력 */}
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
          placeholder="제목을 입력하세요."
          className="title-input"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '15px',
            width: '60%',
            borderBottom: titleError ? '2px solid red' : '2px solid #fff',
          }}
        />
        {/* 사진 추가하기 버튼 */}
        <button
          onClick={handleUploadClick}
          style={{
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          사진 추가하기
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* 컨텐츠 래퍼 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Book Information */}
        <div style={{ marginBottom: '70px' }}>
          <h2 style={{ fontSize: '25px', fontWeight: 'bold', marginBottom: '25px' }}>
            Book Information
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr', // 왼쪽/오른쪽
              gap: '20px',
            }}
          >
            {/* 왼쪽: 책을 펴낸 날, 저자, 장르, 출판사 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 책을 펴낸 날 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ width: '100px', fontWeight: 'bold' }}>책을 펴낸 날</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
              {/* 저자 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={inputAuthor}
                  onChange={(e) => setInputAuthor(e.target.value)}
                  placeholder="저자를 입력하세요."
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
              {/* 장르 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="출판사를 입력하세요."
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>
            </div>
            {/* 오른쪽: Summary */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '8px' }}>Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="책을 간단히 요약하세요."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ccc',
                  resize: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Memo */}
        <div style={{ marginBottom: '70px' }}>
          <div
            style={{
              display: 'flex',
              gap: '15px', 
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>Memo</h2>
            <button
              onClick={handleAddMemo}
              style={{
                fontSize: '14px',
                backgroundColor: '#979797',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              메모 추가하기
            </button>
          </div>

          {/* 메모 목록 렌더링 */}
          {memos.map((m) => (
            <div key={m.id}>
              {/* (A) 버튼 영역: 메모 박스 바깥, 상단에 위치 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end', // 오른쪽 정렬
                  gap: '15px',
                  marginBottom: '8px',       // 메모 박스와의 간격
                  
                }}
              >
                {/* 메모가 아직 등록되지 않은 상태라면: 삭제 + 등록 버튼 */}
                {!m.isMemoSaved ? (
                  <>
                    <button onClick={() => handleDeleteMemo(m.id)}
                      style={{
                        backgroundColor: '#fff',
                        color: '#333',
                        border: '1px solid #999',
                        borderRadius: '10px',
                        padding: '5px 20px',
                        cursor: 'pointer',
                      }}
                      >삭제</button>
                    <button onClick={() => handleRegisterMemo(m.id)}
                      style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '5px 20px',
                        cursor: 'pointer',
                      }}
                      >등록</button>
                  </>
                ) : (
                  /* 이미 등록된 상태라면: 삭제 + 수정 버튼 */
                  <>
                    <button onClick={() => handleDeleteMemo(m.id)}
                      style={{
                        backgroundColor: '#fff',
                        color: '#333',
                        border: '1px solid #999',
                        borderRadius: '10px',
                        padding: '5px 20px',
                        cursor: 'pointer',
                      }}>삭제</button>
                    <button onClick={() => handleEditMemo(m.id)}
                      style={{
                        backgroundColor: '#999',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '5px 20px',
                        cursor: 'pointer',
                      }}>수정</button>
                  </>
                )}
              </div>

              {/* (B) 메모 박스 본문 */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#fff',
                  boxShadow: '4px 4px 4px rgba(0,0,0,0.25)',
                  marginBottom: '20px',
                  padding: '20px',
                }}
              >
                {/* 왼쪽 상단 책갈피 아이콘 자리 */}
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

                {/* 메모 내용 textarea */}
                <textarea
                  ref={(el) => (textAreaRefs.current[m.id] = el)}
                  value={m.memo}
                  onChange={(e) => handleMemoChange(m.id, 'memo', e.target.value)}
                  disabled={m.isMemoSaved}
                  placeholder="책의 내용을 입력하세요."
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

                {/* 페이지 입력 (오른쪽 하단) */}
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
                  <span>p.</span>
                  <input
                    type="text"
                    value={m.pageNumber}
                    onChange={(e) => handleMemoChange(m.id, 'pageNumber', e.target.value)}
                    disabled={m.isMemoSaved}
                    style={{
                      width: '50px',
                      border: 'none',
                      borderBottom: '1px solid #ccc',
                      backgroundColor: m.isMemoSaved ? '#f9f9f9' : '#fff',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

          

        {/* Review */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Review</h2>
          <div
            style={{
              backgroundColor: '#fff',
              boxShadow: '4px 4px 4px rgba(0,0,0,0.25)',
              padding: '20px',
            }}
          >
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="리뷰를 작성하세요."
              style={{
                width: '100%',
                minHeight: '100px',
                border: 'none',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* 책을 닫은 날 */}
        <div style={{ textAlign: 'right', marginTop: '50px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>책을 닫은 날</label>
          <div
            style={{
              display: 'inline-block',
              position: 'relative',
            }}
          >
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleCloseBookDate(e);
              }}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            />
            {/* 오른쪽에 화살표 아이콘 넣고 싶으면 background-image나 pseudo-element 활용 */}
          </div>
        </div>
      </div>

      {/* 모달/토스트 영역들 (기존 로직 그대로) */}
      {showToast && (
        <div
          style={{
            fontWeight: 'bold',
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fff',
            border: '1px solid #979797',
            color: '#000',
            padding: '12px 24px',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          저장이 정상적으로 완료되었습니다.
        </div>
      )}
      {showConfirmBackModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
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
              글이 저장되지 않았습니다.<br />저장하시겠습니까?
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
      {showCongratsModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
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
            <p
              style={{
                marginTop: '30px',
                marginBottom: '30px',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              완독을 축하합니다!
            </p>
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

      {/* 하단 고정 버튼 영역 (뒤로가기 / 저장하기) */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#C4C4C4',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '10px 20px',
          zIndex: 999,
        }}
      >
        <button
          onClick={handleGoBack}
          style={{
            backgroundColor: '#fff',
            color: '#4C4C4C',
            border: '1px solid #D6D6D6',
            borderRadius: '20px',
            padding: '5px 16px',
            marginRight: '15px',
            cursor: 'pointer',
          }}
        >
          뒤로가기
        </button>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '20px',
            padding: '5px 16px',
            cursor: 'pointer',
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default CreatePostPage;
