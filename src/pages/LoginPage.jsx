import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomBg from '../../image/image 1.png';
import TopLogo from '../../image/image 2.png';
import { login } from '../lib/api';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleMouseDown = () => setShowPassword(true);
  const handleMouseUp = () => setShowPassword(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('로그인 요청 중 오류가 발생했습니다.');
      if (err instanceof Error && err.message) {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* 1. 좌상단 로고 */}
      <div className="absolute top-6 left-8 z-20">
        <img src={TopLogo} alt="GDG Logo" className="w-15 h-auto cursor-pointer" />
      </div>

      {/* 2. 중앙 로그인 섹션 */}
      <main className="w-full max-w-[340px] z-10 -mt-24">
        <h1 className="text-[26px] text-gray-800 font-extralight text-center mb-10 tracking-tight">
          GDGoC.com 에 로그인
        </h1>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-800 mb-1">이메일</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-[4px] focus:outline-none focus:border-blue-400 transition-all"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-800 mb-1">암호</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-[4px] focus:outline-none focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                <Eye size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <p className="text-[9.5px] text-center text-gray-400 leading-[1.4] tracking-tighter">
            계속하여 GDGoC.com의 약관, 개인정보 취급방침 및 쿠키 정책에 동의하게 됩니다.
          </p>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#0070f3] text-white font-bold rounded-[4px] hover:bg-blue-600 transition-colors mt-2 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-8 space-y-1.5 text-center text-[12px] text-gray-500">
          <p>계정이 없습니까? <span className="text-black font-bold cursor-pointer hover:underline" onClick={() => navigate('/signup')}>가입</span></p>
          <p className="cursor-pointer font-bold text-gray-800 mb-1 hover:underline">암호를 잊으셨습니까?</p>
          <p className="cursor-pointer font-bold text-gray-800 mb-1 hover:underline">이메일을 잊으셨습니까?</p>
        </div>
      </main>

      {/* 3. 하단 배경 이미지 */}
      <div className="absolute bottom-0 left-0 w-full z-0 leading-[0]">
        <img src={BottomBg} alt="Background" className="w-full h-auto min-w-[1200px] object-bottom" />
      </div>
    </div>
  );
}

export default LoginPage;
