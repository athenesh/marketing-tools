'use client';

import { useState } from 'react';

export default function LTVCACRatioPage() {
  // 입력 상태
  const [ltv, setLtv] = useState<number>(0); // 고객 생애 가치
  const [cac, setCac] = useState<number>(0); // 고객 획득 비용

  // 계산 결과
  const [ratio, setRatio] = useState<number | null>(null); // LTV:CAC 비율
  const [healthStatus, setHealthStatus] = useState<{
    text: string;
    color: string;
    bg: string;
    description: string;
  } | null>(null);

  console.log('📊 [LTV:CAC] 입력값:', { ltv, cac });

  // 계산 함수
  const calculate = () => {
    console.log('🧮 [LTV:CAC] 계산 시작...');

    // 유효성 검사
    if (ltv <= 0) {
      alert('LTV를 입력해주세요!');
      return;
    }

    if (cac <= 0) {
      alert('CAC를 입력해주세요!');
      return;
    }

    // LTV:CAC 비율 계산
    const calculatedRatio = ltv / cac;

    // 건강도 평가
    let status;
    if (calculatedRatio >= 3) {
      status = {
        text: '건강함',
        color: 'text-green-600',
        bg: 'bg-green-50',
        description: '매우 우수한 상태입니다. 지속 가능한 성장이 가능합니다.',
      };
    } else if (calculatedRatio >= 2) {
      status = {
        text: '양호함',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        description: '양호한 상태입니다. 추가 최적화 여지가 있습니다.',
      };
    } else if (calculatedRatio >= 1) {
      status = {
        text: '주의 필요',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        description: '주의가 필요한 상태입니다. CAC 절감 또는 LTV 향상이 필요합니다.',
      };
    } else {
      status = {
        text: '위험함',
        color: 'text-red-600',
        bg: 'bg-red-50',
        description: '위험한 상태입니다. 즉시 개선 조치가 필요합니다.',
      };
    }

    setRatio(calculatedRatio);
    setHealthStatus(status);

    console.log('✅ [LTV:CAC] 계산 완료:', {
      비율: calculatedRatio,
      상태: status.text,
    });
  };

  // 초기화 함수
  const reset = () => {
    setLtv(0);
    setCac(0);
    setRatio(null);
    setHealthStatus(null);
    console.log('🔄 [LTV:CAC] 초기화');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 LTV:CAC 비율 계산기
          </h1>
          <p className="text-gray-600">
            LTV와 CAC를 입력받아 마케팅 건전성을 최종 판정하세요
          </p>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            💡 LTV:CAC 비율이란?
          </h2>
          <p className="text-gray-600 mb-4">
            LTV:CAC 비율은 고객 생애 가치(LTV)와 고객 획득 비용(CAC)의 비율로,
            마케팅 투자의 건강도를 측정하는 핵심 지표입니다.
            이 비율이 높을수록 수익성이 좋고 지속 가능한 비즈니스 모델을 의미합니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-purple-50 p-3 rounded">
              <strong>LTV:</strong> 고객 생애 가치 (고객이 평생 동안 창출하는 총 가치)
            </div>
            <div className="bg-pink-50 p-3 rounded">
              <strong>CAC:</strong> 고객 획득 비용 (한 명의 고객을 획득하는 데 드는 비용)
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded mt-3 text-sm text-gray-600">
            <strong>비율 = LTV ÷ CAC</strong>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 정보 입력
          </h2>

          <div className="space-y-6">
            {/* LTV */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                고객 생애 가치 (LTV) (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 고객이 평생 동안 창출하는 총 가치
                </span>
              </label>
              <input
                type="number"
                value={ltv || ''}
                onChange={(e) => setLtv(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                placeholder="예: 300000"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 LTV 계산기가 필요하신가요? <a href="/ltv" className="text-purple-600 hover:underline">LTV 계산기로 이동</a>
              </p>
            </div>

            {/* CAC */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                고객 획득 비용 (CAC) (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 한 명의 고객을 획득하는 데 드는 총 비용
                </span>
              </label>
              <input
                type="number"
                value={cac || ''}
                onChange={(e) => setCac(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                placeholder="예: 100000"
                min="0"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={calculate}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-md hover:shadow-lg text-lg"
            >
              🧮 계산하기
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              🔄 초기화
            </button>
          </div>
        </div>

        {/* 결과 표시 */}
        {ratio !== null && healthStatus && (
          <div className="space-y-6">
            {/* 기본 결과 */}
            <div className={`rounded-lg shadow-lg p-6 border-2 ${healthStatus.bg} border-${healthStatus.color.replace('text-', '')}`}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 마케팅 건전성 판정
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* 비율 */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">
                    LTV:CAC 비율
                  </div>
                  <div className={`text-4xl font-bold ${healthStatus.color}`}>
                    {ratio.toFixed(2)}:1
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    LTV가 CAC의 {ratio.toFixed(2)}배
                  </div>
                </div>

                {/* 건강도 */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">
                    마케팅 건전성
                  </div>
                  <div className={`text-3xl font-bold ${healthStatus.color}`}>
                    {healthStatus.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {healthStatus.description}
                  </div>
                </div>
              </div>

              {/* 상세 설명 */}
              <div className="bg-white rounded-lg p-4 mt-4">
                <p className="text-gray-700">
                  {healthStatus.description}
                </p>
              </div>
            </div>

            {/* 비율 기준 가이드 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📈 비율 기준 가이드
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <h4 className="font-semibold text-gray-800">3:1 이상 - 건강함</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    매우 우수한 상태입니다. 지속 가능한 성장이 가능하며, 마케팅 예산 확대를 고려할 수 있습니다.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="font-semibold text-gray-800">2:1 ~ 3:1 - 양호함</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    양호한 상태입니다. 추가 최적화를 통해 비율을 개선할 여지가 있습니다.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="font-semibold text-gray-800">1:1 ~ 2:1 - 주의 필요</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    주의가 필요한 상태입니다. CAC 절감 또는 LTV 향상 전략이 필요합니다.
                  </p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚨</span>
                    <h4 className="font-semibold text-gray-800">1:1 미만 - 위험함</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    위험한 상태입니다. 즉시 개선 조치가 필요하며, 마케팅 비용을 재검토해야 합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 개선 방안 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🎯 개선 방안
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    LTV 향상 방법
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 평균 주문 금액 증가</li>
                    <li>• 구매 빈도 향상</li>
                    <li>• 고객 생애 기간 연장</li>
                    <li>• 이익률 개선</li>
                  </ul>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    CAC 절감 방법
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 광고 효율성 개선</li>
                    <li>• 전환율 최적화</li>
                    <li>• 추천 프로그램 활용</li>
                    <li>• 오가닉 트래픽 증가</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 계산 상세 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📚 계산 상세
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>LTV:</strong> {ltv.toLocaleString()}원
                </p>
                <p>
                  <strong>CAC:</strong> {cac.toLocaleString()}원
                </p>
                <p>
                  <strong>비율:</strong> {ltv.toLocaleString()} ÷ {cac.toLocaleString()} = <strong className="text-purple-600">{ratio.toFixed(2)}:1</strong>
                </p>
                <p className="text-gray-500 mt-2">
                  → LTV가 CAC의 <strong>{ratio.toFixed(2)}배</strong>이므로, 마케팅 건전성은 <strong className={healthStatus.color}>{healthStatus.text}</strong>입니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

