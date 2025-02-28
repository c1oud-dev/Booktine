// main.js: 페이지 로딩 후 이벤트 등록 예시
document.addEventListener("DOMContentLoaded", function() {
  const loginBtn = document.querySelector('.login-btn');

  // 로그인 버튼 클릭 시 예시 동작: 로그인 페이지로 이동
  loginBtn.addEventListener('click', function() {
    window.location.href = "/login";
  });

  // 필요에 따라 추가 스크립트를 작성할 수 있습니다.
});
