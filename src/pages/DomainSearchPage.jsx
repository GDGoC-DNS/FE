import React, { useState } from 'react';

const DomainSearchPage = () => {
  const [subdomain, setSubdomain] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const handleSearch = () => {
    if (!subdomain.trim()) return;
    const available = subdomain !== 'test1'; // 임시 로직
    setIsAvailable(available);
    setIsSearched(true);
  };

  return (
    <div className="px-10 pb-10">
      <section className="bg-white p-7 rounded-[20px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-blue-400 text-[12px] font-bold uppercase tracking-widest mb-6 block">도메인 검색</span>
            <h2 className="text-[24px] font-bold text-gray-800">사용 가능한 도메인을 찾아보세요</h2>
          </div>
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 font-bold text-[14px]">
            gdgoc.com
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-3">서브도메인</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="subdomain"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[16px]"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[16px]">
                  .gdgoc.com
                </span>
              </div>
              <button
                onClick={handleSearch}
                className="bg-[#3B82F6] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
              >
                가용성 확인
              </button>
            </div>
          </div>

          {isSearched && (
            <div className={`mt-8 p-6 rounded-2xl border-2 transition-all ${
              isAvailable ? 'bg-blue-50 border-blue-200 border-dashed' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`text-[16px] ${isAvailable ? 'text-gray-700' : 'text-gray-400'}`}>
                  <span className="font-bold">{subdomain}.gdgoc.com</span>
                  {isAvailable ? ' 사용 가능합니다!' : ' 은 이미 등록된 도메인 입니다'}
                </p>
                {isAvailable && (
                  <button className="bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm">
                    지금 등록
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DomainSearchPage;