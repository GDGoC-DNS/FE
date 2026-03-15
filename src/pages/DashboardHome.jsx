import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { deleteDomain } from '../lib/api';

function DashboardHome() {
  const { userData, domains, loading, refreshDomains } = useOutletContext();
  const navigate = useNavigate();
  const [deletingDomainId, setDeletingDomainId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleDeleteDomain = async (domain) => {
    const confirmed = window.confirm(
      `${domain.domainName} 도메인과 연결된 DNS 레코드를 모두 삭제합니다. 계속하시겠습니까?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingDomainId(domain.id);
    setActionError('');

    try {
      await deleteDomain(domain.id);
      await refreshDomains();
      window.alert('도메인이 성공적으로 삭제되었습니다.');
    } catch (error) {
      setActionError(
        error instanceof Error && error.message
          ? error.message
          : '도메인을 삭제하지 못했습니다.',
      );
    } finally {
      setDeletingDomainId(null);
    }
  };

  return (
    <main className="p-3 mx-10 bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
      {/* ACCOUNT 라벨 & 타이틀 */}
      <div className="mt-3 mb-4 px-4">
        <h4 className="text-[12px] text-blue-400 font-bold tracking-widest uppercase mb-1">
          Account
        </h4>
        <h3 className="text-[24px] mt-7 font-bold text-gray-800">
          {loading ? 'Loading...' : userData.email ? `${userData.email}'s Account` : 'Account'}
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
            <button onClick={() => navigate('/dashboard/dns')} className="bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-md text-[14px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
              DNS 설정
            </button>
          </div>
        </div>
      </div>

      {/* 도메인 리스트 테이블 */}
      <div className="mt-5 w-full bg-white border border-gray-100 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="border-t border-gray-100">
          {actionError ? (
            <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm text-red-600">
              {actionError}
            </div>
          ) : null}

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
                    <td className="py-5 px-6 text-[14px] font-medium text-gray-700">{domain.domainName}</td>
                    <td className="py-5 px-6">
                      <span className="text-[14px] text-gray-600 font-medium">{domain.status}</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate('/dashboard/dns', { state: { domainId: domain.id } })}
                          className="min-w-[108px] whitespace-nowrap rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          DNS 설정
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(domain)}
                          disabled={deletingDomainId === domain.id}
                          className="min-w-[108px] whitespace-nowrap rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingDomainId === domain.id ? '삭제 중...' : '도메인 삭제'}
                        </button>
                      </div>
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
