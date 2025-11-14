'use client';

import { useState } from 'react';

export default function TargetCPAPage() {
  // 입력 상태
  const [salePrice, setSalePrice] = useState<number>(0); // 판매가
  const [costPrice, setCostPrice] = useState<number>(0); // 원가

  // 계산 결과
  const [targetCPA, setTargetCPA] = useState<number | null>(null); // 목표 CPA
  const [profitMargin, setProfitMargin] = useState<number | null>(null); // 이익률

  console.log('🎯 [목표 CPA] 입력값:', { salePrice, costPrice });

  // 계산 함수
  const calculate = () => {
    console.log('🧮 [목표 CPA] 계산 시작...');

    // 유효성 검사
    if (salePrice <= 0) {
      alert('판매가를 입력해주세요!');
      return;
    }

    if (costPrice < 0) {
      alert('원가는 0 이상이어야 합니다!');
      return;
    }

    if (costPrice >= salePrice) {
      alert('원가는 판매가보다 작아야 합니다!');
      return;
    }

    // 목표 CPA = 판매가 - 원가 (1회 전환당 최대 광고비)
    const cpa = salePrice - costPrice;

    // 이익률 = (순이익 / 판매가) × 100
    const margin = (cpa / salePrice) * 100;

    setTargetCPA(cpa);
    setProfitMargin(margin);

    console.log('✅ [목표 CPA] 계산 완료:', {
      목표CPA: cpa,
      이익률: margin,
    });
  };

  // 초기화 함수
  const reset = () => {
    setSalePrice(0);
    setCostPrice(0);
    setTargetCPA(null);
    setProfitMargin(null);
    console.log('🔄 [목표 CPA] 초기화');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 목표 CPA 계산기
          </h1>
          <p className="text-gray-600">
            판매가와 원가를 기반으로 1회 전환당 최대 광고비를 계산하세요
          </p>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            💡 목표 CPA란?
          </h2>
          <p className="text-gray-600 mb-4">
            목표 CPA(Cost Per Acquisition)는 1회 전환당 지출할 수 있는 최대 광고비를 의미합니다.
            판매가에서 원가를 뺀 순이익만큼만 광고비로 사용할 수 있으므로, 이를 초과하면 손해가 발생합니다.
          </p>
          <div className="bg-blue-50 p-3 rounded text-sm text-gray-600">
            <strong>목표 CPA = 판매가 - 원가</strong>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 정보 입력
          </h2>

          <div className="space-y-6">
            {/* 판매가 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                판매가 (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 고객이 지불하는 최종 가격
                </span>
              </label>
              <input
                type="number"
                value={salePrice || ''}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="예: 100000"
                min="0"
              />
            </div>

            {/* 원가 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                원가 (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 제품 제조/구매 비용, 배송비 등
                </span>
              </label>
              <input
                type="number"
                value={costPrice || ''}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                placeholder="예: 60000"
                min="0"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={calculate}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg text-lg"
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
        {targetCPA !== null && profitMargin !== null && (
          <div className="space-y-6">
            {/* 기본 결과 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-100 rounded-lg shadow-lg p-6 border-2 border-blue-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 계산 결과
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 목표 CPA */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">
                    1회 전환당 최대 광고비
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {targetCPA.toLocaleString()} 원
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    목표 CPA
                  </div>
                </div>

                {/* 이익률 */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">
                    이익률
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    (순이익 / 판매가) × 100
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 분석 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                💡 분석 결과
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    ✅ 광고비 설정 가이드
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    이 상품의 경우, <strong className="text-blue-600">{targetCPA.toLocaleString()}원</strong>을 초과하는 광고비는 손해를 의미합니다.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• <strong>권장 광고비:</strong> {Math.round(targetCPA * 0.7).toLocaleString()}원 (목표 CPA의 70%)</li>
                    <li>• <strong>최대 광고비:</strong> {targetCPA.toLocaleString()}원 (목표 CPA)</li>
                    <li>• <strong>위험 구간:</strong> {targetCPA.toLocaleString()}원 초과</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    📈 수익성 분석
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      현재 이익률은 <strong className="text-green-600">{profitMargin.toFixed(1)}%</strong>입니다.
                    </p>
                    {profitMargin >= 30 ? (
                      <p className="text-green-700 font-semibold">
                        ✅ 높은 수익률로 광고 투자 여유가 있습니다.
                      </p>
                    ) : profitMargin >= 20 ? (
                      <p className="text-blue-700 font-semibold">
                        ⚠️ 적정 수익률입니다. 광고비 관리에 주의하세요.
                      </p>
                    ) : (
                      <p className="text-orange-700 font-semibold">
                        ⚠️ 낮은 수익률입니다. 원가 절감 또는 판매가 조정을 고려하세요.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    🎯 최적화 팁
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 광고비는 목표 CPA의 70% 이하로 설정하여 안전 마진 확보</li>
                    <li>• 전환당 비용이 목표 CPA를 초과하면 즉시 광고 중단 검토</li>
                    <li>• 원가 절감을 통해 목표 CPA 상향 조정 가능</li>
                    <li>• 판매가 조정 시 목표 CPA도 함께 재계산 필요</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 사용 예시 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📚 계산 예시
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>판매가:</strong> {salePrice.toLocaleString()}원
                </p>
                <p>
                  <strong>원가:</strong> {costPrice.toLocaleString()}원
                </p>
                <p>
                  <strong>목표 CPA:</strong> {salePrice.toLocaleString()} - {costPrice.toLocaleString()} = <strong className="text-blue-600">{targetCPA.toLocaleString()}원</strong>
                </p>
                <p className="text-gray-500 mt-2">
                  → 1회 전환당 최대 {targetCPA.toLocaleString()}원까지 광고비를 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

