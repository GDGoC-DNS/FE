import React, { useState } from 'react';

const DNSPage = () => {
  // 1. 레코드 리스트 상태 (isEditing 추가)
  const [records, setRecords] = useState([
    { id: 1, type: 'A', host: '@', value: '192.0.2.10', isEditing: false },
  ]);

  // 2. 새 레코드 입력을 위한 상태
  const [newRecord, setNewRecord] = useState({ type: 'A', host: '', value: '' });

  // 3. 수정 중인 값을 임시로 담아둘 상태
  const [editValues, setEditValues] = useState({});

  // --- 핸들러 함수들 ---

  // 수정 모드 진입
  const startEdit = (record) => {
    setRecords(records.map(r => 
      r.id === record.id ? { ...r, isEditing: true } : { ...r, isEditing: false }
    ));
    setEditValues({ ...record }); // 현재 행의 데이터를 수정용 상태에 복사
  };

  // 수정 취소
  const cancelEdit = (id) => {
    setRecords(records.map(r => 
      r.id === id ? { ...r, isEditing: false } : r
    ));
    setEditValues({});
  };

  // 수정 내용 저장 (로컬 상태 반영)
  const saveEdit = (id) => {
    setRecords(records.map(r => 
      r.id === id ? { ...editValues, isEditing: false } : r
    ));
    setEditValues({});
  };

  // 레코드 삭제
  const deleteRecord = (id) => {
    if (window.confirm("이 레코드를 삭제하시겠습니까?")) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  // 새 레코드 추가
  const addRecord = () => {
    if (!newRecord.host || !newRecord.value) {
      alert("Host와 Value를 모두 입력해주세요.");
      return;
    }
    const nextRecord = {
      ...newRecord,
      id: Date.now(),
      isEditing: false
    };
    setRecords([...records, nextRecord]);
    setNewRecord({ type: 'A', host: '', value: '' }); // 입력창 초기화
  };

  return (
    <div className="px-10 pb-10 space-y-8">
      {/* 상단 섹션: 도메인 정보 및 검색 */}
      <section className="bg-white p-7 rounded-[20px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <span className="text-blue-400 text-[12px] font-bold uppercase tracking-widest mb-6 block">DNS</span>
            <h2 className="text-[24px] font-bold text-gray-800 mb-6">레코드</h2>
            <p className="text-gray-400 text-sm">DNS 레코드를 구성하고 호스트 이름의 프록시 상태를 검토합니다.</p>
          </div>
        </div>

        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">선택된 도메인</p>
            <h3 className="text-lg font-bold text-gray-800">test.gdgoc.com</h3>
            <p className="text-sm text-gray-400 mt-2">DNS 레코드를 검토, 추가 및 편집합니다. 편집 내용이 저장되면 적용됩니다.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="레코드 이름을 입력" 
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none w-64 bg-white" 
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">검색</button>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ 레코드 추가</button>
          </div>
        </div>
      </section>

      {/* 메인 섹션: 레코드 관리 테이블 */}
      <section className="bg-white p-7 rounded-[20px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-blue-400 text-[12px] font-bold uppercase tracking-widest block mb-6">DNS 설정</span>
            <h2 className="text-[22px] font-bold text-gray-800">레코드 추가 · 수정 · 삭제</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-left text-gray-800 font-bold block mb-1 uppercase">도메인</span>
            <div className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium bg-white shadow-sm">
              test.gdgoc.com
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-[13px] font-medium border-b border-gray-100">
                <th className="pb-4 w-[15%] uppercase">Type</th>
                <th className="pb-4 w-[25%] uppercase">Host</th>
                <th className="pb-4 w-[40%] uppercase">Value</th>
                <th className="pb-4 text-right uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {records.map((record) => (
                <tr key={record.id} className="border-b border-gray-50 group hover:bg-gray-50/30 transition-colors">
                  {record.isEditing ? (
                    /* --- [수정 모드] --- */
                    <>
                      <td className="py-4">
                        <select 
                          value={editValues.type}
                          onChange={(e) => setEditValues({...editValues, type: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="A">A</option>
                          <option value="CNAME">CNAME</option>
                          <option value="MX">MX</option>
                          <option value="TXT">TXT</option>
                        </select>
                      </td>
                      <td className="py-4 px-2">
                        <input 
                          type="text" 
                          value={editValues.host}
                          onChange={(e) => setEditValues({...editValues, host: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input 
                          type="text" 
                          value={editValues.value}
                          onChange={(e) => setEditValues({...editValues, value: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        />
                      </td>
                      <td className="py-4 text-right space-x-3">
                        <button onClick={() => saveEdit(record.id)} className="text-red-200 group-hover:text-red-400 font-bold text-xs transition-colors">저장</button>
                        <button onClick={() => cancelEdit(record.id)} className="text-red-200 group-hover:text-red-400 font-bold text-xs transition-colors">취소</button>
                        <button onClick={() => deleteRecord(record.id)} className="text-red-200 group-hover:text-red-400 font-bold text-xs transition-colors">삭제</button>
                      </td>
                    </>
                  ) : (
                    /* --- [일반 모드] --- */
                    <>
                      <td className="py-5 font-bold text-gray-700">{record.type}</td>
                      <td className="py-5 text-gray-600">{record.host}</td>
                      <td className="py-5 text-gray-500 font-mono tracking-tight">{record.value}</td>
                      <td className="py-5 text-right space-x-4">
                        <button 
                          onClick={() => startEdit(record)} 
                          className="text-red-200 group-hover:text-red-400 font-bold text-xs transition-colors"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => deleteRecord(record.id)} 
                          className="text-red-200 group-hover:text-red-400 font-bold text-xs transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* --- [새 레코드 추가 입력 행] --- */}
              <tr className="bg-gray-50/30 border-t-2 border-gray-100">
                <td className="py-6">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Type</div>
                  <select 
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  >
                    <option value="A">A</option>
                    <option value="CNAME">CNAME</option>
                    <option value="MX">MX</option>
                    <option value="TXT">TXT</option>
                  </select>
                </td>
                <td className="py-6 px-3">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Host</div>
                  <input 
                    type="text" 
                    placeholder="@ 또는 www" 
                    value={newRecord.host}
                    onChange={(e) => setNewRecord({...newRecord, host: e.target.value})}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all" 
                  />
                </td>
                <td className="py-6 px-3">
                  <div className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Value</div>
                  <input 
                    type="text" 
                    placeholder="192.0.0.0 또는 test.gdgoc.com" 
                    value={newRecord.value}
                    onChange={(e) => setNewRecord({...newRecord, value: e.target.value})}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all font-mono" 
                  />
                </td>
                <td className="py-6 text-right pt-10">
                  <button 
                    onClick={addRecord} 
                    className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 shadow-md shadow-blue-100 transition-all active:scale-95 text-sm"
                  >
                    레코드 추가
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 하단 최종 저장 버튼 */}
        <button className="w-full mt-10 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]">
          DNS 저장
        </button>
      </section>
    </div>
  );
};

export default DNSPage;