'use client';

import { useState, useEffect } from 'react';

interface EmailLog {
  email: string;
  status: 'success' | 'failed';
  error?: string;
  provider: string;
  sentAt: string;
}

interface LogsData {
  total: number;
  success: number;
  failed: number;
  logs: EmailLog[];
}

export default function MonitorPage() {
  const [logs, setLogs] = useState<LogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setError(null);
        const response = await fetch('/api/monitor');
        if (!response.ok) {
          throw new Error('데이터 조회 실패');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
        console.error('로그 조회 중 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>오류 발생: {error}</p>
        </div>
      </div>
    );
  }

  if (!logs || !logs.logs || logs.logs.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>아직 발송된 이메일이 없습니다.</p>
        </div>
      </div>
    );
  }

  const calculatePercentage = (value: number) => {
    if (logs.total === 0) return '0.0';
    return ((value / logs.total) * 100).toFixed(1);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">뉴스레터 발송 모니터링</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 p-4 rounded">
          <h2>성공</h2>
          <p className="text-2xl">{logs.success}</p>
          <p className="text-sm text-gray-600">
            {calculatePercentage(logs.success)}%
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h2>실패</h2>
          <p className="text-2xl">{logs.failed}</p>
          <p className="text-sm text-gray-600">
            {calculatePercentage(logs.failed)}%
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h2>총 발송</h2>
          <p className="text-2xl">{logs.total}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2">이메일</th>
              <th className="border p-2">상태</th>
              <th className="border p-2">제공자</th>
              <th className="border p-2">발송시간</th>
              <th className="border p-2">에러</th>
            </tr>
          </thead>
          <tbody>
            {logs.logs.map((log: EmailLog) => (
              <tr key={`${log.email}-${log.sentAt}`} className="hover:bg-gray-50">
                <td className="border p-2">{log.email}</td>
                <td className={`border p-2 ${
                  log.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {log.status === 'success' ? '성공' : '실패'}
                </td>
                <td className="border p-2">{log.provider}</td>
                <td className="border p-2">
                  {new Date(log.sentAt).toLocaleString('ko-KR')}
                </td>
                <td className="border p-2">{log.error || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 