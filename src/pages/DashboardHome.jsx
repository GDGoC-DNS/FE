import React from 'react';

// DashboardPage에서 context로 넘겨준 데이터를 받아와서 사용
import { useOutletContext, useNavigate } from 'react-router-dom';

function DashboardHome() {
  const { userData, domains, loading } = useOutletContext();
  const navigate = useNavigate();

  return (
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

      {/* 메인 카드 (GDGoC DNS) */}
      <div className="w-full bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center space-x-3 mb-3">
            <span className="bg-[#EEF2F6] text-[#475569] px-5 py-3 rounded-full text-[15px] font-extrabold">
              GDGoC DNS
            </span>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => navigate('/dashboard/search')} className="bg-[#3B82F6] text-white px-4 py-3 rounded-lg text-[14px] font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100">
              도메인 검색하기
            </button>
          </div>
        </div>
      </div>

      {/* 도메인 리스트 테이블 */}
      <div className="mt-5 w-full bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="border-t border-gray-100">
          {loading ? (
            <div className="p-10 text-center text-gray-400">데이터를 불러오는 중...</div>
          ) : domains && domains.length > 0 ? (
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
                    <td className="py-5 px-6 text-[14px] font-medium text-gray-700">{domain.url}</td>
                    <td className="py-5 px-6">
                      <span className="text-[14px] text-gray-600 font-medium">{domain.status}</span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
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
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-[15px] font-medium mb-1">등록된 도메인이 없습니다.</p>
              <p className="text-[13px]">서브도메인을 등록하여 서비스를 시작해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default DashboardHome;