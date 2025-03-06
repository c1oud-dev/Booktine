import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();

  // "뒤로가기" 버튼 클릭 시 BookNote 페이지로 이동
  const handleGoBack = () => {
    navigate('/booknote');
  };

  // "저장하기" 버튼 클릭 시 처리
  const handleSave = () => {
    alert('저장하기 버튼 클릭!');
    // 실제 구현 시: 폼 데이터 유효성 검사, 백엔드 API 호출 등
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',       // 가운데 정렬
        padding: '60px 20px',
      }}
    >
        {/* 상단 영역: "책을 펴낸 날", "독서중" 버튼, 뒤로가기 버튼 */}
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
                style={{width: '30px', height: '30px'}}
            />
            <label style={{ fontSize: '20px', fontWeight: 'bold' }}>책을 펴낸 날</label>
            <input
                type="date"
                style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
            />
            <button
            style={{
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
            }}
            >
            독서중
            </button>
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

        {/* "책 제목을 입력해주세요." 안내 문구 */}
        <div style={{ marginBottom: '10px' }}>
        <input
            type="text"
            placeholder="책 제목을 입력해주세요."
            style={{
            width: '100%',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'black',
            border: 'none',
            outline: 'none',
            }}
        />
        </div>
        <hr style={{ marginBottom: '30px' }} />

        {/* 글쓰기 폼 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '50px' }}>
        {/* 저자 */}
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '10px'}}>
            <label style={{ width: '70px', fontWeight: 'bold' }}>저 자</label>
            <input
                type="text"
                placeholder="저자를 입력하세요."
                style={{
                    width: '50%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
                />
        </div>

        {/* 장르 */}
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '10px'}}>
            <label style={{ width: '70px', fontWeight: 'bold' }}>장 르</label>
            <select
                style={{
                width: '50%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
            >
                <option value="">장르 선택</option>
                <option value="소설">총류</option>
                <option value="자기계발">철학</option>
                <option value="에세이">종교</option>
                <option value="에세이">사회과학</option>
                <option value="에세이">자연과학</option>
                <option value="에세이">기술과학</option>
                <option value="에세이">예술</option>
                <option value="에세이">언어</option>
                <option value="에세이">문학</option>
                <option value="에세이">역사</option>
                {/* 필요에 따라 추가 */}
            </select>
        </div>

        {/* 출판사 */}
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '10px', marginBottom: '40px'}}>
            <label style={{ width: '70px', fontWeight: 'bold' }}>출판사</label>
            <input
                type="text"
                placeholder="출판사를 입력하세요."
                style={{
                width: '50%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
            />
        </div>

        {/* 한줄요약 */}
        <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', gap: '10px'}}>
            <label style={{ width: '70px', fontWeight: 'bold' }}>한줄요약</label>
            <textarea
                placeholder="책을 한줄로 요약하세요."
                style={{
                    width: '95%',
                    height: '50px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
            />
        </div>
    </div>

        {/* p. + 페이지 수 + 메모 입력 */}
        <div style={{ marginBottom: '20px' }}>
            {/* 책 페이지 입력 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>P. </label>
                <input
                type="number"
                placeholder="책 페이지"
                style={{
                    width: '120px',
                    padding: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
            />
        </div>
        
        {/* 메모 입력창 */}
        <div style={{ marginBottom: '10px' }}>
            <textarea
                placeholder="기록하고 싶은 내용을 입력하세요."
                style={{
                    width: '100%',
                    height: '100px',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
                }}
            />
        </div>

        {/* 추가하기 버튼 */}
        <div style={{ textAlign: 'left' }}>
            <button
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
    </div>

        {/* 리뷰 */}
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
            }}
          />
        </div>

        {/* 책을 닫은 날 + 날짜 */}
        <div>
        <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',  // 오른쪽 배치 
            gap: '10px', 
            alignItems: 'center',
            marginTop: '30px'
            }}>
            <img
                src="/closebook_icon.png"
                alt="close book icon"
                style={{width: '30px', height: '30px'}}
            />
          <label style={{ fontSize: '20px', fontWeight: 'bold' }}>
            책을 닫은 날
          </label>
          <input
            type="date"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 그림자 처리
            }}
          />
        </div>

        {/* 저장하기 버튼 */}
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
    </div>
  );
};

export default CreatePostPage;
