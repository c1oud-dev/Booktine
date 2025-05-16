import axios from 'axios';


// (선택) 전역으로 withCredentials 설정
axios.defaults.withCredentials = true;

// 회원가입
export const signup = (email: string, nickname: string, password: string) => {
  return axios.post(
    `/api/auth/signup`,                // ← 올바른 엔드포인트
    { email, nickname, password },
    { withCredentials: true }          // ← 쿠키 인증 포함
  );
};

// 로그인
export const login = (email: string, password: string) => {
  return axios.post(
    `/api/auth/login`,                 // ← 올바른 엔드포인트
    { email, password },
    { withCredentials: true }          // ← 쿠키 인증 포함
  );
};


