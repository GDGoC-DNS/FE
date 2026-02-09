import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import TopLogo from '../../image/image 2.png'; // 경로 확인해줘!

const mockFetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: { name: "121", email: "121@example.com" },
        /* 예시 도메인 */
        domains: [
          { id: 1, url: "example.gdgoc.com", status: "활성" },
          { id: 2, url: "demo-project.gdgoc.com", status: "대기" },
          { id: 3, url: "api-server.gdgoc.com", status: "활성" }
        ]
      });
    }, 500);
  });
};

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await mockFetchDashboardData();
      setUserData(data.user);
      setDomains(data.domains || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const getMenuClass = (path) => {
    const isSelected = location.pathname === path;
    return isSelected
      ? "bg-[#1A1F2B] text-white px-4 py-3 rounded-md font-bold text-[14px] cursor-pointer transition-all"
      : "text-gray-500 px-4 py-3 hover:bg-gray-100 rounded-md text-[14px] font-medium cursor-pointer transition-colors";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-800">
      {/* 사이드바 */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col z-20 fixed h-full">
        <div className="pt-8 px-6 mb-10 flex items-center gap-3">
          <img src={TopLogo} alt="Logo" className="w-8 h-auto cursor-pointer" onClick={() => navigate('/dashboard')} />
          <span className="flex-1 text-[14px] text-right text-gray-400 font-medium">gdgoc.com</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <div onClick={() => navigate('/dashboard')} className={getMenuClass('/dashboard')}>대시보드</div>
          <div onClick={() => navigate('/dashboard/search')} className={getMenuClass('/dashboard/search')}>도메인 검색/등록</div>
          <div onClick={() => navigate('/dashboard/dns')} className={getMenuClass('/dashboard/dns')}>DNS 설정</div>
        </nav>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col ml-[240px]">
        <header className="h-[120px] flex items-center justify-between px-10">
          <div>
            <span className="text-[14px] text-[#3B82F6] font-bold mb-1">무료 GDG 서브도메인 등록센터</span>
            <h2 className="text-[22px] font-bold text-gray-900">gdgoc.com 서브도메인 등록센터</h2>
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="text-right mr-4 px-2">
              <div className="text-[14px] font-bold">{loading ? "..." : userData.name}</div>
              <div className="text-[11px] text-gray-400">{loading ? "..." : userData.email}</div>
            </div>
            <button className="text-[12px] font-medium text-gray-500 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50" onClick={() => navigate('/login')}>로그아웃</button>
          </div>
        </header>

        <main className="flex-1">
          {/* 여기에 자식 컴포넌트(DomainSearchPage 등)가 렌더링됨 */}
          <Outlet context={{ userData, domains, loading }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;