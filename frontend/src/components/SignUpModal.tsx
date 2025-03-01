// SignUpModal.tsx (간단 예시)
import { useState } from "react";

export default function SignUpModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null; // isOpen이 false면 표시 X

  const allFieldsFilled = firstName && lastName && email && password;

  const handleSignUp = () => {
    if (!allFieldsFilled) return;
    // TODO: 백엔드 API 연동 (회원가입 로직)
    alert("회원가입 완료!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-96 relative">
        <button
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={handleSignUp}
          disabled={!allFieldsFilled}
          className={
            allFieldsFilled
              ? "bg-black text-white w-full py-2 mt-2"
              : "bg-gray-300 text-gray-600 w-full py-2 mt-2 cursor-not-allowed"
          }
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
