import { useState, type FormEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquareText, X } from 'lucide-react';
import { panelSpring } from '@/lib/motion';
import { createInquiry } from '@/api/inquiryApi';
import { useAuth } from '@/auth/AuthContext';

export default function AppFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const submitInquiry = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitMessage('');

    if (!isAuthenticated) {
      setSubmitMessage('로그인 후 문의/제안을 보낼 수 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await createInquiry({ subject, message });
      setSubject('');
      setMessage('');
      setSubmitMessage('문의/제안이 관리자에게 전달되었습니다.');
    } catch {
      setSubmitMessage('문의/제안을 전송하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <footer className="border-t border-border/80 bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link to="/" className="text-lg font-black tracking-tight text-foreground">
              Booktine
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              더 선명한 독서 습관을 위한 기록 공간
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hover:text-foreground"
            >
              서비스 소개
            </button>
            <Link to="/books" className="hover:text-foreground">
              독서노트
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmitMessage('');
                setIsInquiryOpen(true);
              }}
              className="hover:text-foreground"
            >
              문의/제안
            </button>
            <Link to="/progress" className="hover:text-foreground">
              진도 관리
            </Link>
            <Link to="/mypage" className="hover:text-foreground">
              마이페이지
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Booktine</p>
        </div>
      </footer>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={panelSpring}
              className="relative mx-4 w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-card"
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Booktine 소개
            </h2>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              더 선명한 독서 습관을 위한 기록 공간
            </p>

            <ul className="mt-6 space-y-4">
              <li className="rounded-2xl border border-border bg-background p-4">
                <p className="font-black text-foreground">📚 독서 노트 & 메모</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  읽은 책마다 감상과 메모를 기록하고 언제든 꺼내볼 수 있어요.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-background p-4">
                <p className="font-black text-foreground">🎯 목표 설정 & 진도 관리</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  월간·연간 독서 목표를 세우고 달성 현황을 한눈에 확인하세요.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-background p-4">
                <p className="font-black text-foreground">✨ 도서 추천</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Aladin API 기반으로 장르별 베스트셀러와 맞춤 도서를 추천해드려요.
                </p>
              </li>
            </ul>

            <Link
              to="/signup"
              onClick={() => setIsModalOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              지금 시작하기
            </Link>
          </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isInquiryOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
            onClick={() => setIsInquiryOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={panelSpring}
              className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-card"
              onClick={(e: MouseEvent) => e.stopPropagation()}
              onSubmit={submitInquiry}
            >
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">문의/제안 보내기</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                서비스 이용 중 불편한 점이나 제안을 관리자에게 전달해 주세요.
              </p>

              <label className="mt-6 block text-sm font-bold text-foreground">
                제목
                <input
                  className="mt-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="문의 제목"
                  maxLength={100}
                  required
                />
              </label>
              <label className="mt-4 block text-sm font-bold text-foreground">
                내용
                <textarea
                  className="mt-2 min-h-32 resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="관리자에게 전달할 내용을 입력해 주세요."
                  maxLength={3000}
                  required
                />
              </label>

              {submitMessage ? <p className="mt-4 text-sm font-bold text-muted-foreground">{submitMessage}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-50"
              >
                {submitting ? '전송 중...' : '문의/제안 전송'}
              </button>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}