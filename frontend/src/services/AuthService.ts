import axios from 'axios';


// (선택) 전역으로 withCredentials 설정
axios.defaults.withCredentials = true;

export const fetchCurrentUser = async (): Promise<{ email: string; nickname: string } | null> => {
  try {
    const res = await axios.get('/api/auth/me', { withCredentials: true });
    return res.data;            // 로그인 O → 사용자 객체
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null;              // 로그인 X → null
    }
    throw err;                  // 다른 오류는 상위로 전달
  }
};

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


