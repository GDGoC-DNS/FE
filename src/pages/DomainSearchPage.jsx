import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { checkDomainOwnership, registerDomain } from '../lib/api';

const ROOT_DOMAIN = 'gdgoc.com';

const toFullDomainName = (value) => {
  const normalized = value.trim().toLowerCase().replace(/\.+$/, '');

  if (!normalized) {
    return '';
  }

  return normalized.endsWith(`.${ROOT_DOMAIN}`)
    ? normalized
    : `${normalized}.${ROOT_DOMAIN}`;
};

const toSubdomainInputValue = (domainName) =>
  domainName.endsWith(`.${ROOT_DOMAIN}`)
    ? domainName.slice(0, -(`.${ROOT_DOMAIN}`.length))
    : domainName;

const DomainSearchPage = () => {
  const navigate = useNavigate();
  const { domains, refreshDomains } = useOutletContext();
  const [subdomain, setSubdomain] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fullDomainName = toFullDomainName(subdomain);
  const resolvedDomainName = lookupResult?.domainName || fullDomainName;
  const isMyDomain = domains.some((domain) => domain.domainName === resolvedDomainName);
  const isAvailable = lookupResult ? !lookupResult.owned : null;

  const handleSearch = async () => {
    if (!fullDomainName) {
      setErrorMessage('등록할 서브도메인을 입력해주세요.');
      setLookupResult(null);
      setSuccessMessage('');
      return;
    }

    setSearching(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await checkDomainOwnership(fullDomainName);
      setLookupResult(result);
    } catch (error) {
      setLookupResult(null);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '도메인 등록 여부를 확인하지 못했습니다.',
      );
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!lookupResult || lookupResult.owned) {
      return;
    }

    setRegistering(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const registeredDomain = await registerDomain({
        domainName: lookupResult.domainName,
      });

      await refreshDomains();
      setLookupResult({
        domainName: registeredDomain.domainName,
        owned: true,
      });
      setSubdomain(toSubdomainInputValue(registeredDomain.domainName));
      setSuccessMessage('도메인을 등록했습니다. 이제 DNS 레코드를 추가할 수 있습니다.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '도메인을 등록하지 못했습니다.',
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="px-10 pb-10">
      <section className="bg-white p-7 rounded-[20px] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-start mb-8 gap-6">
          <div>
            <span className="text-blue-400 text-[12px] font-bold uppercase tracking-widest mb-6 block">도메인 검색</span>
            <h2 className="text-[24px] font-bold text-gray-800">사용 가능한 도메인을 찾아보세요</h2>
            <p className="mt-3 text-sm text-gray-400">
              입력한 서브도메인은 자동으로 <span className="font-semibold text-gray-500">.{ROOT_DOMAIN}</span> 에 연결됩니다.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 font-bold text-[14px]">
            {ROOT_DOMAIN}
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
                  onChange={(event) => {
                    setSubdomain(event.target.value);
                    setLookupResult(null);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="subdomain"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-[16px]"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[16px]">
                  .{ROOT_DOMAIN}
                </span>
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-[#3B82F6] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-100 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {searching ? '확인 중...' : '가용성 확인'}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700">
              {successMessage}
            </div>
          ) : null}

          {lookupResult ? (
            <div
              className={`mt-8 p-6 rounded-2xl border-2 transition-all ${
                isAvailable ? 'bg-blue-50 border-blue-200 border-dashed' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className={`text-[16px] ${isAvailable ? 'text-gray-700' : 'text-gray-500'}`}>
                  <span className="font-bold">{lookupResult.domainName}</span>
                  {isAvailable
                    ? ' 사용 가능합니다.'
                    : isMyDomain
                      ? ' 은 현재 내 계정에 등록된 도메인입니다.'
                      : ' 은 이미 등록된 도메인입니다.'}
                </p>

                <div className="flex gap-3">
                  {isAvailable ? (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {registering ? '등록 중...' : '지금 등록'}
                    </button>
                  ) : null}

                  {isMyDomain ? (
                    <button
                      onClick={() => {
                        const domain = domains.find(
                          (item) => item.domainName === lookupResult.domainName,
                        );

                        navigate('/dashboard/dns', {
                          state: { domainId: domain?.id },
                        });
                      }}
                      className="border border-gray-200 bg-white px-5 py-2.5 rounded-xl text-[13px] font-bold text-gray-700"
                    >
                      DNS 설정으로 이동
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default DomainSearchPage;
