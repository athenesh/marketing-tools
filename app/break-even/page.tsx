'use client';

import { useState } from 'react';

export default function BreakEvenPage() {
  // 입력 상태
  const [fixedCost, setFixedCost] = useState<number>(0); // 고정비
  const [variableCost, setVariableCost] = useState<number>(0); // 변동비(개당)
  const [sellingPrice, setSellingPrice] = useState<number>(0); // 판매가

  // 계산 결과
  const [breakEvenUnits, setBreakEvenUnits] = useState<number | null>(null); // 손익분기점 수량
  const [breakEvenRevenue, setBreakEvenRevenue] = useState<number | null>(null); // 손익분기점 매출

  console.log('💰 [손익분기점] 입력값:', { fixedCost, variableCost, sellingPrice });

  // 계산 함수
  const calculate = () => {
    console.log('🧮 [손익분기점] 계산 시작...');

    // 유효성 검사
    if (sellingPrice <= variableCost) {
      alert('판매가는 변동비보다 커야 합니다!');
      return;
    }

    if (fixedCost < 0 || variableCost < 0 || sellingPrice <= 0) {
      alert('올바른 값을 입력해주세요!');
      return;
    }

    // 손익분기점 수량 = 고정비 ÷ (판매가 - 변동비)
    const units = fixedCost / (sellingPrice - variableCost);
    
    // 손익분기점 매출 = 손익분기점 수량 × 판매가
    const revenue = units * sellingPrice;

    setBreakEvenUnits(units);
    setBreakEvenRevenue(revenue);

    console.log('✅ [손익분기점] 계산 완료:', {
      손익분기점수량: units,
      손익분기점매출: revenue,
    });
  };

  // 초기화 함수
  const reset = () => {
    setFixedCost(0);
    setVariableCost(0);
    setSellingPrice(0);
    setBreakEvenUnits(null);
    setBreakEvenRevenue(null);
    console.log('🔄 [손익분기점] 초기화');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            💰 손익분기점 계산기
          </h1>
          <p className="text-gray-600">
            총 고정비, 제품 1개당 변동비, 1개당 판매가를 입력하여 본전 달성 목표 수량을 계산하세요
          </p>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            💡 손익분기점(BEP)이란?
          </h2>
          <p className="text-gray-600 mb-4">
            손익분기점은 수익과 비용이 정확히 일치하는 지점으로, 
            이익도 손실도 발생하지 않는 판매량 또는 매출액을 의미합니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-green-50 p-3 rounded">
              <strong>BEP 수량:</strong> 고정비 ÷ (판매가 - 변동비)
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <strong>BEP 매출:</strong> BEP 수량 × 판매가
            </div>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 정보 입력
          </h2>

          <div className="space-y-6">
            {/* 고정비 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                총 고정비 (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 월세, 인건비, 감가상각비 등 (월 단위)
                </span>
              </label>
              <input
                type="number"
                value={fixedCost || ''}
                onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="예: 5000000"
                min="0"
              />
            </div>

            {/* 변동비 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                제품 1개당 변동비 (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 원가, 원자재비, 포장비 등
                </span>
              </label>
              <input
                type="number"
                value={variableCost || ''}
                onChange={(e) => setVariableCost(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="예: 7000"
                min="0"
              />
            </div>

            {/* 판매가 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                1개당 판매가 (원)
              </label>
              <input
                type="number"
                value={sellingPrice || ''}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="예: 15000"
                min="0"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={calculate}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg text-lg"
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
        {breakEvenUnits !== null && breakEvenRevenue !== null && (
          <div className="space-y-6">
            {/* 핵심 결과 - 명확한 목표 수량 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg shadow-lg p-8 border-2 border-green-300">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  손익분기점 목표 수량
                </h2>
                <p className="text-xl text-gray-700 font-semibold">
                  손익분기점을 넘기려면{' '}
                  <span className="text-green-600 text-3xl">
                    매월 {Math.ceil(breakEvenUnits).toLocaleString()}개의 제품
                  </span>
                  을 판매해야 합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* 손익분기점 수량 */}
                <div className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="text-sm text-gray-600 mb-2">최소 판매 수량</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.ceil(breakEvenUnits).toLocaleString()} 개
                  </div>
                  <div className="text-xs text-gray-500">
                    본전(수익 0원) 달성을 위한 최소 수량
                  </div>
                </div>

                {/* 손익분기점 매출 */}
                <div className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="text-sm text-gray-600 mb-2">최소 매출 목표</div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.ceil(breakEvenRevenue).toLocaleString()} 원
                  </div>
                  <div className="text-xs text-gray-500">
                    월 매출 목표액
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 분석 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                💡 상세 분석
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 공헌이익 */}
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-semibold text-gray-800 mb-2">개당 공헌이익</h4>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(sellingPrice - variableCost).toLocaleString()}원
                  </div>
                  <p className="text-xs text-gray-600">
                    판매가 {sellingPrice.toLocaleString()}원 - 변동비 {variableCost.toLocaleString()}원
                  </p>
                </div>

                {/* 공헌이익률 */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-gray-800 mb-2">공헌이익률</h4>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(((sellingPrice - variableCost) / sellingPrice) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600">
                    판매가 대비 공헌이익 비율
                  </p>
                </div>
              </div>

              {/* 목표 달성 가이드 */}
              <div className="mt-6 bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                <h4 className="font-semibold text-gray-800 mb-3">📊 목표 달성 가이드</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>
                    • <strong>본전 달성:</strong> 매월 최소 {Math.ceil(breakEvenUnits).toLocaleString()}개 판매 필요
                  </li>
                  <li>
                    • <strong>이익 발생:</strong> {Math.ceil(breakEvenUnits).toLocaleString()}개 초과 판매 시 이익 발생 시작
                  </li>
                  <li>
                    • <strong>일일 목표:</strong> 하루 평균 약 {Math.ceil(breakEvenUnits / 30).toLocaleString()}개 판매 필요
                  </li>
                  <li>
                    • <strong>주간 목표:</strong> 주당 약 {Math.ceil(breakEvenUnits / 4).toLocaleString()}개 판매 필요
                  </li>
                </ul>
              </div>
            </div>

            {/* 가격 전략 제안 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🎯 가격 전략 수립 가이드
              </h3>
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <h4 className="font-semibold text-gray-800 mb-2">현재 수익성 평가</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    현재 설정으로는 매월 <strong>{Math.ceil(breakEvenUnits).toLocaleString()}개</strong>를 판매해야 본전을 맞출 수 있습니다.
                  </p>
                  {breakEvenUnits <= 100 ? (
                    <p className="text-sm text-green-700 font-semibold">
                      ✅ 달성 가능한 목표입니다. 현실적인 판매 목표로 설정하세요.
                    </p>
                  ) : breakEvenUnits <= 500 ? (
                    <p className="text-sm text-yellow-700 font-semibold">
                      ⚠️ 중간 난이도의 목표입니다. 마케팅 전략 수립이 필요합니다.
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 font-semibold">
                      🚨 높은 목표입니다. 가격 조정 또는 비용 절감을 고려하세요.
                    </p>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-semibold text-gray-800 mb-3">최적화 제안 및 개선율</h4>
                  <div className="space-y-3">
                    {/* 판매가 상향 개선율 */}
                    <div className="bg-white rounded p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">판매가 상향</span>
                        <span className="text-xs text-gray-500">10% 상향 시</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">공헌이익 증가로 목표 수량 감소</p>
                          <div className="text-sm font-semibold text-purple-600">
                            목표 수량: {(() => {
                              const newUnits = fixedCost / ((sellingPrice * 1.1) - variableCost);
                              const improvement = ((breakEvenUnits - newUnits) / breakEvenUnits) * 100;
                              return (
                                <>
                                  {Math.ceil(newUnits).toLocaleString()}개
                                  <span className="text-green-600 ml-2">
                                    ({improvement.toFixed(1)}% 개선)
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 변동비 절감 개선율 */}
                    <div className="bg-white rounded p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">변동비 절감</span>
                        <span className="text-xs text-gray-500">10% 절감 시</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">원가 최적화로 목표 수량 감소</p>
                          <div className="text-sm font-semibold text-purple-600">
                            목표 수량: {(() => {
                              const newUnits = fixedCost / (sellingPrice - (variableCost * 0.9));
                              const improvement = ((breakEvenUnits - newUnits) / breakEvenUnits) * 100;
                              return (
                                <>
                                  {Math.ceil(newUnits).toLocaleString()}개
                                  <span className="text-green-600 ml-2">
                                    ({improvement.toFixed(1)}% 개선)
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 고정비 절감 개선율 */}
                    <div className="bg-white rounded p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">고정비 절감</span>
                        <span className="text-xs text-gray-500">10% 절감 시</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">운영비 최적화로 목표 수량 감소</p>
                          <div className="text-sm font-semibold text-purple-600">
                            목표 수량: {(() => {
                              const newUnits = (fixedCost * 0.9) / (sellingPrice - variableCost);
                              const improvement = ((breakEvenUnits - newUnits) / breakEvenUnits) * 100;
                              return (
                                <>
                                  {Math.ceil(newUnits).toLocaleString()}개
                                  <span className="text-green-600 ml-2">
                                    ({improvement.toFixed(1)}% 개선)
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded p-2 mt-2">
                      <p className="text-xs text-gray-600">
                        💡 각 항목을 10% 개선할 경우의 목표 수량 감소율을 계산했습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 사용 예시 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📚 사용 예시
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>카페 창업:</strong> 월 고정비(임대료+인건비) 500만원, 
              커피 한잔 원가 1,000원, 판매가 4,500원
            </p>
            <p className="text-gray-500">
              → BEP: 1,429잔 (하루 약 48잔)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

