import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ApiError,
  createDnsRecord,
  deleteDnsRecord,
  getDnsRecords,
  updateDnsRecord,
} from '../lib/api';

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'];

const createEmptyRecordForm = () => ({
  type: 'A',
  host: '',
  value: '',
  ttl: '3600',
  priority: '',
  proxied: false,
});

const toRecordForm = (record) => ({
  type: record.type || 'A',
  host: record.host || '',
  value: record.value || '',
  ttl: String(record.ttl ?? 3600),
  priority: record.priority == null ? '' : String(record.priority),
  proxied: Boolean(record.proxied),
});

const validateDnsRecordForm = (record) => {
  if (!record.value.trim()) {
    return 'Value를 입력해주세요.';
  }

  const ttl = Number(record.ttl);

  if (!Number.isInteger(ttl) || ttl < 1 || ttl > 86400 || (ttl !== 1 && ttl < 60)) {
    return 'TTL은 1(auto) 또는 60~86400 범위여야 합니다.';
  }

  if (record.type === 'MX') {
    const priority = Number(record.priority);

    if (!Number.isInteger(priority) || priority < 0) {
      return 'MX 레코드는 priority를 입력해주세요.';
    }
  }

  return '';
};

const toDnsPayload = (record) => ({
  type: record.type,
  host: record.host.trim(),
  value: record.value.trim(),
  ttl: Number(record.ttl),
  priority: record.type === 'MX' ? Number(record.priority) : null,
  proxied: Boolean(record.proxied),
});

const formatHost = (host) => (host ? host : '@');

const fetchDnsRecords = async (domainId, signal) => {
  const response = await getDnsRecords(domainId, { signal });
  return Array.isArray(response) ? response : [];
};

const getPreviewRecordName = (host, domainName) => {
  const normalizedHost = host.trim();

  if (!domainName || !normalizedHost || normalizedHost === '@') {
    return domainName || '도메인 선택 필요';
  }

  return normalizedHost.endsWith(`.${domainName}`) || normalizedHost === domainName
    ? normalizedHost
    : `${normalizedHost}.${domainName}`;
};

const DNSPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { domains, loading: dashboardLoading } = useOutletContext();
  const [selectedDomainId, setSelectedDomainId] = useState(() =>
    location.state?.domainId ? String(location.state.domainId) : '',
  );
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newRecord, setNewRecord] = useState(createEmptyRecordForm);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(createEmptyRecordForm);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const selectedDomain = domains.find((domain) => String(domain.id) === selectedDomainId) || null;

  useEffect(() => {
    if (!domains.length) {
      if (selectedDomainId) {
        setSelectedDomainId('');
      }
      return;
    }

    const hasSelectedDomain = domains.some((domain) => String(domain.id) === selectedDomainId);

    if (!selectedDomainId || !hasSelectedDomain) {
      setSelectedDomainId(String(domains[0].id));
    }
  }, [domains, selectedDomainId]);

  useEffect(() => {
    if (!selectedDomainId) {
      setRecords([]);
      setRecordsError('');
      setSuccessMessage('');
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setRecordsLoading(true);
      setRecordsError('');
      setSuccessMessage('');

      try {
        const nextRecords = await fetchDnsRecords(selectedDomainId, controller.signal);
        setRecords(nextRecords);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          navigate('/login', { replace: true });
          return;
        }

        setRecordsError(
          error instanceof Error && error.message
            ? error.message
            : 'DNS 레코드를 불러오지 못했습니다.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setRecordsLoading(false);
        }
      }
    };

    run();

    return () => controller.abort();
  }, [navigate, selectedDomainId]);

  const refreshRecords = async () => {
    if (!selectedDomainId) {
      return;
    }

    setRecordsLoading(true);
    setRecordsError('');
    setSuccessMessage('');

    try {
      const nextRecords = await fetchDnsRecords(selectedDomainId);
      setRecords(nextRecords);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      setRecordsError(
        error instanceof Error && error.message
          ? error.message
          : 'DNS 레코드를 불러오지 못했습니다.',
      );
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleRecordTypeChange = (setter, nextType) => {
    setter((current) => ({
      ...current,
      type: nextType,
      priority: nextType === 'MX' ? current.priority : '',
    }));
  };

  const handleCreateRecord = async () => {
    if (!selectedDomainId) {
      setRecordsError('먼저 도메인을 선택해주세요.');
      return;
    }

    const validationError = validateDnsRecordForm(newRecord);

    if (validationError) {
      setRecordsError(validationError);
      setSuccessMessage('');
      return;
    }

    setCreating(true);
    setRecordsError('');
    setSuccessMessage('');

    try {
      await createDnsRecord(selectedDomainId, toDnsPayload(newRecord));
      const nextRecords = await fetchDnsRecords(selectedDomainId);
      setRecords(nextRecords);
      setNewRecord(createEmptyRecordForm());
      setSuccessMessage('DNS 레코드를 생성했습니다.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      setRecordsError(
        error instanceof Error && error.message
          ? error.message
          : 'DNS 레코드를 생성하지 못했습니다.',
      );
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setEditValues(toRecordForm(record));
    setRecordsError('');
    setSuccessMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues(createEmptyRecordForm());
  };

  const saveEdit = async (recordId) => {
    if (!selectedDomainId) {
      return;
    }

    const validationError = validateDnsRecordForm(editValues);

    if (validationError) {
      setRecordsError(validationError);
      setSuccessMessage('');
      return;
    }

    setSavingId(recordId);
    setRecordsError('');
    setSuccessMessage('');

    try {
      await updateDnsRecord(selectedDomainId, recordId, toDnsPayload(editValues));
      const nextRecords = await fetchDnsRecords(selectedDomainId);
      setRecords(nextRecords);
      setEditingId(null);
      setEditValues(createEmptyRecordForm());
      setSuccessMessage('DNS 레코드를 수정했습니다.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      setRecordsError(
        error instanceof Error && error.message
          ? error.message
          : 'DNS 레코드를 수정하지 못했습니다.',
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!selectedDomainId) {
      return;
    }

    const confirmed = window.confirm('이 DNS 레코드를 삭제하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setDeletingId(recordId);
    setRecordsError('');
    setSuccessMessage('');

    try {
      await deleteDnsRecord(selectedDomainId, recordId);
      const nextRecords = await fetchDnsRecords(selectedDomainId);
      setRecords(nextRecords);

      if (editingId === recordId) {
        setEditingId(null);
        setEditValues(createEmptyRecordForm());
      }

      setSuccessMessage('DNS 레코드를 삭제했습니다.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login', { replace: true });
        return;
      }

      setRecordsError(
        error instanceof Error && error.message
          ? error.message
          : 'DNS 레코드를 삭제하지 못했습니다.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-10 pb-10 space-y-8">
      <section className="bg-white p-7 rounded-[20px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6 gap-6">
          <div className="space-y-1">
            <span className="text-blue-400 text-[12px] font-bold uppercase tracking-widest block">DNS</span>
            <h2 className="text-[24px] font-bold text-gray-800">레코드</h2>
            <p className="text-gray-400 text-sm">DNS 레코드를 조회하고 추가, 수정, 삭제할 수 있습니다.</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-left text-gray-800 font-bold block mb-1 uppercase">도메인</span>
            <select
              value={selectedDomainId}
              onChange={(event) => setSelectedDomainId(event.target.value)}
              disabled={!domains.length}
              className="min-w-[240px] px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {domains.length ? (
                domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domainName}
                  </option>
                ))
              ) : (
                <option value="">도메인 없음</option>
              )}
            </select>
          </div>
        </div>

        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          {dashboardLoading ? (
            <p className="text-sm text-gray-400">도메인 정보를 불러오는 중...</p>
          ) : selectedDomain ? (
            <>
              <p className="text-xs text-gray-400 mb-1">선택된 도메인</p>
              <h3 className="text-lg font-bold text-gray-800">{selectedDomain.domainName}</h3>
              <p className="text-sm text-gray-400 mt-2">
                host가 비어 있거나 @이면 apex 레코드이며, TTL은 1(auto) 또는 60~86400 이어야 합니다.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">선택된 도메인</p>
                <h3 className="text-lg font-bold text-gray-800">등록된 도메인이 없습니다.</h3>
                <p className="text-sm text-gray-400 mt-2">
                  도메인을 먼저 등록한 뒤 DNS 레코드를 관리할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard/search')}
                className="rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-bold text-white hover:bg-blue-600"
              >
                도메인 등록하러 가기
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white p-7 rounded-[20px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-blue-400 text-[12px] font-bold uppercase tracking-widest block mb-6">DNS 설정</span>
            <h2 className="text-[22px] font-bold text-gray-800">레코드 추가 · 수정 · 삭제</h2>
          </div>
          {selectedDomain ? (
            <button
              onClick={refreshRecords}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              새로고침
            </button>
          ) : null}
        </div>

        {recordsError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {recordsError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-700">
            {successMessage}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="text-left text-gray-400 text-[13px] font-medium border-b border-gray-100">
                <th className="pb-4 uppercase">Type</th>
                <th className="pb-4 uppercase">Host</th>
                <th className="pb-4 uppercase">Record</th>
                <th className="pb-4 uppercase">Value</th>
                <th className="pb-4 uppercase">TTL</th>
                <th className="pb-4 uppercase">Priority</th>
                <th className="pb-4 uppercase">Proxy</th>
                <th className="pb-4 text-right uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {recordsLoading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400">
                    DNS 레코드를 불러오는 중...
                  </td>
                </tr>
              ) : records.length ? (
                records.map((record) => {
                  const isEditing = editingId === record.id;

                  return (
                    <tr key={record.id} className="border-b border-gray-50 align-top hover:bg-gray-50/30 transition-colors">
                      {isEditing ? (
                        <>
                          <td className="py-4 pr-2">
                            <select
                              value={editValues.type}
                              onChange={(event) => handleRecordTypeChange(setEditValues, event.target.value)}
                              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {DNS_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-2">
                            <input
                              type="text"
                              value={editValues.host}
                              onChange={(event) =>
                                setEditValues((current) => ({ ...current, host: event.target.value }))
                              }
                              className="w-full rounded-lg border border-gray-200 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-4 px-2 text-gray-500">{record.recordName}</td>
                          <td className="py-4 px-2">
                            <input
                              type="text"
                              value={editValues.value}
                              onChange={(event) =>
                                setEditValues((current) => ({ ...current, value: event.target.value }))
                              }
                              className="w-full rounded-lg border border-gray-200 p-2 font-mono outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-4 px-2">
                            <input
                              type="number"
                              min="1"
                              max="86400"
                              value={editValues.ttl}
                              onChange={(event) =>
                                setEditValues((current) => ({ ...current, ttl: event.target.value }))
                              }
                              className="w-28 rounded-lg border border-gray-200 p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-4 px-2">
                            <input
                              type="number"
                              min="0"
                              value={editValues.priority}
                              disabled={editValues.type !== 'MX'}
                              onChange={(event) =>
                                setEditValues((current) => ({ ...current, priority: event.target.value }))
                              }
                              className="w-24 rounded-lg border border-gray-200 p-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="py-4 px-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={editValues.proxied}
                                onChange={(event) =>
                                  setEditValues((current) => ({
                                    ...current,
                                    proxied: event.target.checked,
                                  }))
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              Proxy
                            </label>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => saveEdit(record.id)}
                                disabled={savingId === record.id}
                                className="text-xs font-bold text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {savingId === record.id ? '저장 중...' : '저장'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-xs font-bold text-gray-500"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                disabled={deletingId === record.id}
                                className="text-xs font-bold text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === record.id ? '삭제 중...' : '삭제'}
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-5 font-bold text-gray-700">{record.type}</td>
                          <td className="py-5 text-gray-600">{formatHost(record.host)}</td>
                          <td className="py-5 text-gray-500">{record.recordName}</td>
                          <td className="py-5 text-gray-500 font-mono tracking-tight">{record.value}</td>
                          <td className="py-5 text-gray-500">{record.ttl}</td>
                          <td className="py-5 text-gray-500">{record.priority == null ? '-' : record.priority}</td>
                          <td className="py-5 text-gray-500">{record.proxied ? 'ON' : 'OFF'}</td>
                          <td className="py-5 text-right">
                            <div className="flex justify-end gap-4">
                              <button
                                onClick={() => startEdit(record)}
                                className="text-xs font-bold text-blue-600"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                disabled={deletingId === record.id}
                                className="text-xs font-bold text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === record.id ? '삭제 중...' : '삭제'}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400">
                    등록된 DNS 레코드가 없습니다.
                  </td>
                </tr>
              )}

              <tr className="bg-gray-50/30 border-t-2 border-gray-100 align-top">
                <td className="py-6 pr-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Type</div>
                  <select
                    value={newRecord.type}
                    onChange={(event) => handleRecordTypeChange(setNewRecord, event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {DNS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-6 px-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Host</div>
                  <input
                    type="text"
                    placeholder="@ 또는 www"
                    value={newRecord.host}
                    onChange={(event) =>
                      setNewRecord((current) => ({ ...current, host: event.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="py-6 px-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Record</div>
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-3 text-sm text-gray-400">
                    {selectedDomain
                      ? getPreviewRecordName(newRecord.host, selectedDomain.domainName)
                      : '도메인 선택 필요'}
                  </div>
                </td>
                <td className="py-6 px-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Value</div>
                  <input
                    type="text"
                    placeholder="192.0.2.10 또는 mail.example.com"
                    value={newRecord.value}
                    onChange={(event) =>
                      setNewRecord((current) => ({ ...current, value: event.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="py-6 px-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">TTL</div>
                  <input
                    type="number"
                    min="1"
                    max="86400"
                    value={newRecord.ttl}
                    onChange={(event) =>
                      setNewRecord((current) => ({ ...current, ttl: event.target.value }))
                    }
                    className="w-28 rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="py-6 px-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Priority</div>
                  <input
                    type="number"
                    min="0"
                    value={newRecord.priority}
                    disabled={newRecord.type !== 'MX'}
                    onChange={(event) =>
                      setNewRecord((current) => ({ ...current, priority: event.target.value }))
                    }
                    className="w-24 rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                  />
                </td>
                <td className="py-6 px-2">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Proxy</div>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={newRecord.proxied}
                      onChange={(event) =>
                        setNewRecord((current) => ({
                          ...current,
                          proxied: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Proxy
                  </label>
                </td>
                <td className="py-6 pl-3">
                  <button
                    onClick={handleCreateRecord}
                    disabled={!selectedDomain || creating}
                    className="w-full rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {creating ? '추가 중...' : '레코드 추가'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DNSPage;
