import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomBg from '../../image/image 1.png';
import TopLogo from '../../image/image 2.png';

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-6 left-8 z-20">
        <img src={TopLogo} alt="GDG Logo" className="w-15 h-auto cursor-pointer" onClick={() => navigate('/')} />
      </div>

      <main className="w-full max-w-[340px] z-10 -mt-24">
        <h1 className="text-[26px] text-gray-800 font-extralight text-center mb-10 tracking-tight">
          GDGoC.com 회원가입
        </h1>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-800 mb-1">이메일</label>
            <input type="email" className="w-full p-2.5 border border-gray-300 rounded-[4px] focus:outline-none focus:border-blue-400" />
          </div>

          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-gray-800 mb-1">암호</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full p-2.5 border border-gray-300 rounded-[4px] focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <Eye size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center text-gray-400 leading-[1.4] tracking-tighter">
            Cloudflare 대시보드를 사용하려면 <br/> 서비스 약관과 개인 정보의 수집 및 사용에 대한 고지에 동의해야 합니다.
          </p>

          <button type="submit" className="w-full py-2.5 bg-[#0070f3] text-white font-bold rounded-[4px] hover:bg-blue-600 transition-colors mt-2">
            가입
          </button>
        </form>

        <div className="mt-8 text-center text-[12px] text-gray-500">
          <p>계정이 이미 있습니까? <span className="text-black font-bold cursor-pointer hover:underline" onClick={() => navigate('/login')}>로그인</span></p>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 w-full z-0 leading-[0]">
        <img src={BottomBg} alt="Background" className="w-full h-auto min-w-[1200px] object-bottom" />
      </div>
    </div>
  );
}

export default SignupPage;