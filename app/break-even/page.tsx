'use client';

import { useState } from 'react';

// AI 분석 결과 타입
interface BreakEvenAnalysisResult {
  summary: string;
  analysis: {
    breakEvenUnits: number;
    breakEvenRevenue: number;
    contributionMargin: number;
    contributionMarginRatio: number;
    riskLevel: 'high' | 'medium' | 'low';
    message: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
    actionItems: string[];
  }>;
  costOptimization: {
    fixedCostReduction: {
      suggestions: string[];
      potentialSavings: number;
    };
    variableCostReduction: {
      suggestions: string[];
      potentialSavings: number;
    };
  };
  pricingStrategy: {
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    expectedUnits: number;
  };
}

export default function BreakEvenPage() {
  // 입력 상태
  const [fixedCost, setFixedCost] = useState<number>(0); // 고정비
  const [variableCost, setVariableCost] = useState<number>(0); // 변동비(개당)
  const [sellingPrice, setSellingPrice] = useState<number>(0); // 판매가

  // 계산 결과
  const [breakEvenUnits, setBreakEvenUnits] = useState<number | null>(null); // 손익분기점 수량
  const [breakEvenRevenue, setBreakEvenRevenue] = useState<number | null>(null); // 손익분기점 매출

  // AI 분석 상태
  const [analysisResult, setAnalysisResult] = useState<BreakEvenAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

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
    setAnalysisResult(null);
    console.log('🔄 [손익분기점] 초기화');
  };

  // AI 분석 함수
  const handleAnalyze = async () => {
    if (breakEvenUnits === null || breakEvenRevenue === null) {
      alert('먼저 손익분기점을 계산해주세요!');
      return;
    }

    setLoadingAnalysis(true);

    try {
      console.log('🤖 [손익분기점 AI 분석] 시작...');
      const response = await fetch('/api/analyze-break-even', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixedCost,
          variableCost,
          sellingPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || '분석 실패');
      }

      const data = await response.json();
      setAnalysisResult(data);
      console.log('✅ [손익분기점 AI 분석] 완료:', data);
    } catch (error: any) {
      console.error('❌ [손익분기점 AI 분석] 오류:', error);
      alert(error?.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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

            {/* AI 분석 버튼 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={loadingAnalysis}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loadingAnalysis ? '🤖 AI 분석 중...' : '🤖 AI 분석하기'}
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  AI가 손익분기점을 분석하고 개선 방안을 제시합니다
                </p>
              </div>
            </div>

            {/* AI 분석 결과 */}
            {analysisResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🤖 AI 분석 결과
                </h3>

                {/* 요약 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 font-medium">{analysisResult.summary}</p>
                </div>

                {/* 분석 상세 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 상세 분석</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">손익분기점 수량</div>
                      <div className="text-xl font-bold text-green-600">
                        {Math.ceil(analysisResult.analysis.breakEvenUnits).toLocaleString()}개
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">공헌이익률</div>
                      <div className="text-xl font-bold text-blue-600">
                        {analysisResult.analysis.contributionMarginRatio.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">위험도</div>
                      <div className={`text-xl font-bold px-3 py-1 rounded ${getRiskColor(analysisResult.analysis.riskLevel)}`}>
                        {analysisResult.analysis.riskLevel === 'high' ? '높음' : analysisResult.analysis.riskLevel === 'medium' ? '중간' : '낮음'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">공헌이익</div>
                      <div className="text-xl font-bold text-purple-600">
                        {analysisResult.analysis.contributionMargin.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{analysisResult.analysis.message}</p>
                </div>

                {/* 강점/약점 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">✅ 강점</h4>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">⚠️ 개선 필요</h4>
                    <ul className="space-y-2">
                      {analysisResult.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 개선 방안 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">💡 개선 방안</h4>
                  <div className="space-y-4">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`border-2 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold">{rec.title}</h5>
                          <span className="text-xs px-2 py-1 rounded bg-white/50">
                            {rec.priority === 'high' ? '높음' : rec.priority === 'medium' ? '중간' : '낮음'}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{rec.description}</p>
                        <p className="text-xs text-gray-600 mb-2">예상 효과: {rec.expectedImpact}</p>
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">실행 항목:</div>
                          <ul className="space-y-1">
                            {rec.actionItems.map((action, actionIdx) => (
                              <li key={actionIdx} className="text-xs text-gray-700 flex items-start">
                                <span className="mr-2">✓</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 비용 최적화 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">💰 비용 최적화</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <h5 className="font-bold text-purple-800 mb-2">고정비 절감</h5>
                      <p className="text-xs text-gray-600 mb-2">예상 절감액: {analysisResult.costOptimization.fixedCostReduction.potentialSavings.toLocaleString()}원</p>
                      <ul className="space-y-1">
                        {analysisResult.costOptimization.fixedCostReduction.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-xs text-purple-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <h5 className="font-bold text-orange-800 mb-2">변동비 절감</h5>
                      <p className="text-xs text-gray-600 mb-2">예상 절감액: {analysisResult.costOptimization.variableCostReduction.potentialSavings.toLocaleString()}원</p>
                      <ul className="space-y-1">
                        {analysisResult.costOptimization.variableCostReduction.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-xs text-orange-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 가격 전략 */}
                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <h4 className="font-bold text-indigo-800 mb-3">🎯 가격 전략 제안</h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-600">현재 가격</div>
                      <div className="text-lg font-bold text-gray-700">
                        {analysisResult.pricingStrategy.currentPrice.toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">제안 가격</div>
                      <div className="text-lg font-bold text-indigo-600">
                        {analysisResult.pricingStrategy.suggestedPrice.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-indigo-700 mb-2">{analysisResult.pricingStrategy.reason}</p>
                  <p className="text-xs text-indigo-600">
                    예상 판매량: {analysisResult.pricingStrategy.expectedUnits.toLocaleString()}개
                  </p>
                </div>
              </div>
            )}

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

