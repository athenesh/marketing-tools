'use client';

import { useState } from 'react';

// AI 분석 결과 타입
interface LTVAnalysisResult {
  summary: string;
  analysis: {
    clv: number;
    ltv: number;
    netLtv: number;
    ltvCacRatio: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    message: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImprovement: string;
    actionItems: string[];
  }>;
  ltvImprovement: {
    strategies: Array<{
      title: string;
      description: string;
      expectedIncrease: number;
      impact: 'high' | 'medium' | 'low';
    }>;
  };
  cacOptimization: {
    currentCac: number;
    suggestedCac: number;
    strategies: string[];
    reason: string;
  };
}

export default function LTVPage() {
  // 입력 상태
  const [avgOrderValue, setAvgOrderValue] = useState<number>(0); // 평균 주문 금액
  const [purchaseFrequency, setPurchaseFrequency] = useState<number>(0); // 연간 구매 빈도
  const [customerLifespan, setCustomerLifespan] = useState<number>(0); // 고객 생애 기간(년)
  const [profitMargin, setProfitMargin] = useState<number>(20); // 이익률(%)
  const [acquisitionCost, setAcquisitionCost] = useState<number>(0); // 고객 획득 비용

  // 계산 결과
  const [ltv, setLtv] = useState<number | null>(null); // 고객 생애 가치
  const [clv, setClv] = useState<number | null>(null); // 고객 생애 가치 (총 매출)
  const [netLtv, setNetLtv] = useState<number | null>(null); // 순 LTV
  const [ltvCacRatio, setLtvCacRatio] = useState<number | null>(null); // LTV/CAC 비율

  // AI 분석 상태
  const [analysisResult, setAnalysisResult] = useState<LTVAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  console.log('👥 [LTV] 입력값:', {
    avgOrderValue,
    purchaseFrequency,
    customerLifespan,
    profitMargin,
    acquisitionCost,
  });

  // 계산 함수
  const calculate = () => {
    console.log('🧮 [LTV] 계산 시작...');

    // 유효성 검사
    if (avgOrderValue <= 0 || purchaseFrequency <= 0 || customerLifespan <= 0) {
      alert('모든 값은 0보다 커야 합니다!');
      return;
    }

    if (profitMargin < 0 || profitMargin > 100) {
      alert('이익률은 0~100% 사이여야 합니다!');
      return;
    }

    // CLV (Customer Lifetime Value - 총 매출) = 평균 주문 금액 × 연간 구매 빈도 × 고객 생애 기간
    const customerLifetimeValue = avgOrderValue * purchaseFrequency * customerLifespan;

    // LTV (이익 기준) = CLV × 이익률
    const lifetimeValue = customerLifetimeValue * (profitMargin / 100);

    // 순 LTV = LTV - 고객 획득 비용
    const netLifetimeValue = lifetimeValue - acquisitionCost;

    // LTV/CAC 비율
    const ratio = acquisitionCost > 0 ? lifetimeValue / acquisitionCost : 0;

    setClv(customerLifetimeValue);
    setLtv(lifetimeValue);
    setNetLtv(netLifetimeValue);
    setLtvCacRatio(ratio);

    console.log('✅ [LTV] 계산 완료:', {
      총매출: customerLifetimeValue,
      LTV: lifetimeValue,
      순LTV: netLifetimeValue,
      비율: ratio,
    });
  };

  // 초기화 함수
  const reset = () => {
    setAvgOrderValue(0);
    setPurchaseFrequency(0);
    setCustomerLifespan(0);
    setProfitMargin(20);
    setAcquisitionCost(0);
    setLtv(null);
    setClv(null);
    setNetLtv(null);
    setLtvCacRatio(null);
    setAnalysisResult(null);
    console.log('🔄 [LTV] 초기화');
  };

  // AI 분석 함수
  const handleAnalyze = async () => {
    if (ltv === null) {
      alert('먼저 LTV를 계산해주세요!');
      return;
    }

    setLoadingAnalysis(true);

    try {
      console.log('🤖 [LTV AI 분석] 시작...');
      const response = await fetch('/api/analyze-ltv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avgOrderValue,
          purchaseFrequency,
          customerLifespan,
          profitMargin,
          acquisitionCost,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || '분석 실패');
      }

      const data = await response.json();
      setAnalysisResult(data);
      console.log('✅ [LTV AI 분석] 완료:', data);
    } catch (error: any) {
      console.error('❌ [LTV AI 분석] 오류:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'fair':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // LTV/CAC 비율 평가
  const evaluateLtvCacRatio = (ratio: number) => {
    if (ratio >= 3) return { text: '우수', color: 'text-green-600', bg: 'bg-green-50' };
    if (ratio >= 1) return { text: '양호', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { text: '개선 필요', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            👥 LTV 계산기
          </h1>
          <p className="text-gray-600">
            고객 생애 가치를 계산하고 마케팅 ROI를 최적화하세요
          </p>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            💡 LTV(Lifetime Value)란?
          </h2>
          <p className="text-gray-600 mb-4">
            고객이 우리 비즈니스와의 관계 동안 창출하는 총 가치를 의미합니다. 
            LTV를 이해하면 적정 마케팅 비용을 산정하고 고객 유지 전략을 수립할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-orange-50 p-3 rounded">
              <strong>CLV:</strong> 평균 주문액 × 구매빈도 × 생애기간
            </div>
            <div className="bg-red-50 p-3 rounded">
              <strong>LTV:</strong> CLV × 이익률
            </div>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 정보 입력
          </h2>

          <div className="space-y-6">
            {/* 평균 주문 금액 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                평균 주문 금액 (원)
              </label>
              <input
                type="number"
                value={avgOrderValue || ''}
                onChange={(e) => setAvgOrderValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                placeholder="예: 50000"
                min="0"
              />
            </div>

            {/* 연간 구매 빈도 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                연간 구매 빈도 (회)
                <span className="text-gray-500 font-normal ml-2">
                  - 고객이 1년에 몇 번 구매하나요?
                </span>
              </label>
              <input
                type="number"
                value={purchaseFrequency || ''}
                onChange={(e) => setPurchaseFrequency(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                placeholder="예: 4"
                min="0"
                step="0.1"
              />
            </div>

            {/* 고객 생애 기간 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                고객 생애 기간 (년)
                <span className="text-gray-500 font-normal ml-2">
                  - 고객이 얼마나 오래 거래하나요?
                </span>
              </label>
              <input
                type="number"
                value={customerLifespan || ''}
                onChange={(e) => setCustomerLifespan(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                placeholder="예: 3"
                min="0"
                step="0.1"
              />
            </div>

            {/* 이익률 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이익률 (%)
                <span className="text-gray-500 font-normal ml-2">
                  - 매출 대비 순이익 비율
                </span>
              </label>
              <input
                type="number"
                value={profitMargin || ''}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                placeholder="예: 20"
                min="0"
                max="100"
              />
            </div>

            {/* 고객 획득 비용 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                고객 획득 비용 (CAC) (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 선택사항
                </span>
              </label>
              <input
                type="number"
                value={acquisitionCost || ''}
                onChange={(e) => setAcquisitionCost(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                placeholder="예: 30000"
                min="0"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={calculate}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md hover:shadow-lg text-lg"
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
        {ltv !== null && clv !== null && (
          <div className="space-y-6">
            {/* 기본 결과 */}
            <div className="bg-gradient-to-r from-orange-50 to-red-100 rounded-lg shadow-lg p-6 border-2 border-orange-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 계산 결과
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CLV (총 매출) */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">
                    고객 생애 가치 (총 매출)
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {clv.toLocaleString()} 원
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    매출 기준 CLV
                  </div>
                </div>

                {/* LTV (이익) */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">
                    고객 생애 가치 (순이익)
                  </div>
                  <div className="text-3xl font-bold text-orange-600">
                    {ltv.toLocaleString()} 원
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    이익 기준 LTV
                  </div>
                </div>

                {/* 순 LTV */}
                {acquisitionCost > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="text-sm text-gray-600 mb-2">순 LTV</div>
                    <div className={`text-3xl font-bold ${netLtv! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {netLtv!.toLocaleString()} 원
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      LTV - 고객 획득 비용
                    </div>
                  </div>
                )}

                {/* LTV/CAC 비율 */}
                {ltvCacRatio !== null && ltvCacRatio > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="text-sm text-gray-600 mb-2">LTV/CAC 비율</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {ltvCacRatio.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {evaluateLtvCacRatio(ltvCacRatio).text}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LTV/CAC 비율 분석 */}
            {ltvCacRatio !== null && ltvCacRatio > 0 && (
              <div className={`rounded-lg p-6 border-l-4 ${evaluateLtvCacRatio(ltvCacRatio).bg}`}>
                <h3 className="font-semibold text-gray-800 mb-3">
                  📈 LTV/CAC 비율 분석
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${evaluateLtvCacRatio(ltvCacRatio).color}`}>
                      현재 비율: {ltvCacRatio.toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      ({evaluateLtvCacRatio(ltvCacRatio).text})
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p>• <strong>3 이상:</strong> 우수 - 지속 가능한 성장 가능</p>
                    <p>• <strong>1~3:</strong> 양호 - 개선 여지 있음</p>
                    <p>• <strong>1 미만:</strong> 개선 필요 - 비용 효율성 점검 필요</p>
                  </div>
                </div>
              </div>
            )}

            {/* 추가 인사이트 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                💡 인사이트
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-2">
                    연간 고객 가치
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(avgOrderValue * purchaseFrequency).toLocaleString()}원
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="font-semibold text-gray-800 mb-2">
                    적정 고객 획득 비용
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ~ {(ltv * 0.33).toLocaleString()}원
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (LTV의 약 1/3)
                  </div>
                </div>
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
                  AI가 LTV를 분석하고 개선 방안을 제시합니다
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
                      <div className="text-sm text-gray-600">LTV</div>
                      <div className="text-xl font-bold text-orange-600">
                        {analysisResult.analysis.ltv.toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">순 LTV</div>
                      <div className="text-xl font-bold text-green-600">
                        {analysisResult.analysis.netLtv.toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">LTV/CAC 비율</div>
                      <div className="text-xl font-bold text-purple-600">
                        {analysisResult.analysis.ltvCacRatio.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">상태</div>
                      <div className={`text-xl font-bold px-3 py-1 rounded ${getStatusColor(analysisResult.analysis.status)}`}>
                        {analysisResult.analysis.status === 'excellent' ? '우수' : analysisResult.analysis.status === 'good' ? '양호' : analysisResult.analysis.status === 'fair' ? '보통' : '개선필요'}
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
                        <p className="text-xs text-gray-600 mb-2">예상 효과: {rec.expectedImprovement}</p>
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

                {/* LTV 향상 전략 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">🚀 LTV 향상 전략</h4>
                  <div className="space-y-3">
                    {analysisResult.ltvImprovement.strategies.map((strategy, idx) => (
                      <div key={idx} className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <h5 className="font-bold text-indigo-800 mb-2">{strategy.title}</h5>
                        <p className="text-sm text-indigo-700 mb-2">{strategy.description}</p>
                        <div className="text-xs text-indigo-600">
                          예상 증가율: +{strategy.expectedIncrease.toFixed(1)}% | 
                          영향도: {strategy.impact === 'high' ? '높음' : strategy.impact === 'medium' ? '중간' : '낮음'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CAC 최적화 */}
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-800 mb-3">💰 CAC 최적화 제안</h4>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-600">현재 CAC</div>
                      <div className="text-lg font-bold text-gray-700">
                        {analysisResult.cacOptimization.currentCac.toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">제안 CAC</div>
                      <div className="text-lg font-bold text-purple-600">
                        {analysisResult.cacOptimization.suggestedCac.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-purple-700 mb-2">{analysisResult.cacOptimization.reason}</p>
                  <div>
                    <div className="text-xs font-semibold text-purple-600 mb-1">CAC 절감 방안:</div>
                    <ul className="space-y-1">
                      {analysisResult.cacOptimization.strategies.map((strategy, idx) => (
                        <li key={idx} className="text-xs text-purple-700 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* LTV 개선 팁 */}
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
              <h3 className="font-semibold text-gray-800 mb-3">
                🚀 LTV 개선 방법
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>평균 주문 금액 증가:</strong> 업셀링, 크로스셀링</li>
                <li>• <strong>구매 빈도 증가:</strong> 리마케팅, 구독 모델</li>
                <li>• <strong>고객 생애 기간 연장:</strong> 고객 만족도 향상, 로열티 프로그램</li>
                <li>• <strong>이익률 개선:</strong> 원가 최적화, 프리미엄 상품</li>
                <li>• <strong>CAC 감소:</strong> 추천 프로그램, 오가닉 마케팅</li>
              </ul>
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
              <strong>구독 서비스:</strong> 월 구독료 9,900원, 연 12회 결제, 
              평균 2년 사용, 이익률 70%, CAC 20,000원
            </p>
            <p className="text-gray-500">
              → LTV: 166,320원, 순 LTV: 146,320원, LTV/CAC: 8.3 (우수)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

