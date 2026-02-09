import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopLogo from '../../image/image 2.png';

// 나중에 백엔드 API와 교체될 가짜 데이터 함수
const mockFetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          name: "121",
          email: "121@example.com"
        },
        // 백엔드에서 받아올 도메인 리스트 구조 예시
        domains: [
        ]
      });
    }, 500); // 0.5초 로딩 시뮬레이션
  });
};

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // 상태 관리 (백엔드 연동 대비)
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [domains, setDomains] = useState([]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 여기서 나중에 fetch('api/dashboard') 처럼 호출하면 됨
        const data = await mockFetchDashboardData();
        setUserData(data.user);
        setDomains(data.domains);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-800">
      
      {/* 좌측 사이드바 */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col z-20 fixed h-full">
        <div className="pt-8 px-6 mb-10 flex items-center gap-3">
          <img 
            src={TopLogo} 
            alt="GDG Logo" 
            className="w-8 h-auto cursor-pointer" 
            onClick={() => navigate('/')}
          />
          <span className="flex-1 text-[14px] text-right text-gray-400 font-medium mt-1">
            gdgoc.com
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="bg-[#1A1F2B] text-white px-4 py-3 rounded-md font-bold text-[14px] cursor-pointer">
            대시보드
          </div>
          <div className="text-gray-500 px-4 py-3 hover:bg-gray-100 rounded-md text-[14px] font-medium cursor-pointer transition-colors">
            도메인 검색/등록
          </div>
          <div className="text-gray-500 px-4 py-3 hover:bg-gray-100 rounded-md text-[14px] font-medium cursor-pointer transition-colors">
            DNS 설정
          </div>
        </nav>
      </aside>

      {/* 메인 콘텐츠 영역 (사이드바 너비만큼 왼쪽 여백) */}
      <div className="flex-1 flex flex-col ml-[240px]">
        
        {/* 상단 헤더 */}
        <header className="h-[120px] border-gray-200 flex items-center justify-between px-10">
          <div className="flex flex-col justify-center">
            <span className="text-[14px] text-[#3B82F6] font-bold mb-1">무료 GDG 서브도메인 등록센터</span>
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">gdgoc.com 서브도메인 등록센터</h2>
          </div>
          
          {/* 계정 상태 카드 */}
          <div className="flex items-center border border-gray-200 rounded-lg p-4 pr-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="text-right mr-4 px-2">
              <div className="text-[14px] text-left font-bold text-gray-900 leading-tight">
                {loading ? "..." : userData.name}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">
                {loading ? "..." : userData.email}
              </div>
            </div>
            <button 
              className="text-[12px] font-medium text-gray-500 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/login')}
            >
              로그아웃
            </button>
          </div>
        </header>

        {/* 메인 내용 */}
        <main className="p-3 mx-10 bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          
          {/* ACCOUNT 라벨 & 타이틀 */}
          <div className="mt-3 mb-4 px-4">
            <h4 className="text-[12px] text-blue-400 font-bold tracking-widest uppercase mb-1">
              Account
            </h4>
            <h3 className="text-[24px] mt-7 font-bold text-gray-800">
              {loading ? "Loading..." : `${userData.email}’s Account`}
            </h3>
          </div>

          {/* 메인 카드 (흰색 박스) */}
          <div className="w-full bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            
            {/* 카드 상단 컨트롤 영역 */}
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-center space-x-3 mb-3">
                <span className="bg-[#EEF2F6] text-[#475569] px-5 py-3 rounded-full text-[15px] font-extrabold">
                  GDGoC DNS
                </span>
              </div>
              <div className="flex space-x-3">
                <button className="bg-[#3B82F6] text-white px-4 py-3 rounded-lg text-[14px] font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100">
                  도메인 검색하기
                </button>
                <button className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-md text-[14px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  DNS 설정
                </button>
              </div>
            </div>
          </div>

            {/* 도메인 리스트 테이블 영역 */}
          <div className="mt-5 w-full bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="border-t border-gray-100">
              {loading ? (
                <div className="p-10 text-center text-gray-400">데이터를 불러오는 중...</div>
              ) : domains.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-6 text-[13px] font-medium text-gray-400 w-3/4">도메인</th>
                      <th className="py-4 px-6 text-[13px] font-medium text-gray-400">상태</th>
                      <th className="py-4 px-6 text-[13px] font-medium text-gray-400 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((domain) => (
                      <tr key={domain.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-5 px-6 text-[14px] font-medium text-gray-700">
                          {domain.url}
                        </td>
                        <td className="py-5 px-6">
                          <span className="text-[14px] text-gray-600 font-medium">
                            {domain.status}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <button className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="5" cy="12" r="2" fill="currentColor"/>
                              <circle cx="12" cy="12" r="2" fill="currentColor"/>
                              <circle cx="19" cy="12" r="2" fill="currentColor"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* 도메인이 없을 때 */
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <p className="text-[15px] font-medium mb-1">등록된 도메인이 없습니다.</p>
                  <p className="text-[13px]">서브도메인을 등록하여 서비스를 시작해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;