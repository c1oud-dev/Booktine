// Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'relative',
        width: '1200px',       // 고정 폭
        minWidth: '1200px',    // 고정 최소 폭
        margin: '0 auto',      // 중앙 정렬 (브라우저가 1200px보다 작으면 스크롤 발생)
        backgroundColor: '#fff',
        color: '#333',
        padding: '15px',
        textAlign: 'center',
        fontSize: '13px',
        boxSizing: 'border-box',
      }}
    >
      <span>© 2025 Booktine.</span>
      <span style={{ margin: '0 10px' }}>All rights reserved.</span>
      <span>Email: gksmf4165@naver.com</span>
    </footer>
  );
};

export default Footer;
