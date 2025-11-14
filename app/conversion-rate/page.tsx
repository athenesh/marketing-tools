'use client';

import { useState } from 'react';

// AI 분석 결과 타입
interface AnalysisResult {
  summary: string;
  benchmark: {
    currentRate: number;
    industryAverage: string;
    status: 'above' | 'below' | 'average';
    message: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImprovement: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  quickWins: Array<{
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface OptimizationResult {
  strategy: {
    overview: string;
    targetRate: number;
    timeline: string;
    expectedRevenue: number;
  };
  roadmap: Array<{
    phase: string;
    title: string;
    description: string;
    duration: string;
    priority: 'high' | 'medium' | 'low';
    actions: string[];
  }>;
  industrySpecific: Array<{
    title: string;
    description: string;
    reason: string;
  }>;
  metrics: {
    currentRate: number;
    targetRate: number;
    improvement: number;
    additionalConversions: number;
    additionalRevenue: number;
  };
}

interface ABTestResult {
  hypothesis: string;
  tests: Array<{
    id: string;
    title: string;
    hypothesis: string;
    variantA: { name: string; description: string };
    variantB: { name: string; description: string };
    metric: string;
    priority: 'high' | 'medium' | 'low';
    expectedImprovement: number;
    effort: 'low' | 'medium' | 'high';
    duration: string;
    page: string;
  }>;
  testPlan: {
    recommendedOrder: string[];
    timeline: string;
    notes: string;
  };
}

export default function ConversionRatePage() {
  // 입력 상태
  const [visitors, setVisitors] = useState<number>(0);
  const [conversions, setConversions] = useState<number>(0);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(0);
  const [industry, setIndustry] = useState<string>('other');
  const [businessType, setBusinessType] = useState<string>('general');

  // 계산 결과
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [revenuePerVisitor, setRevenuePerVisitor] = useState<number | null>(null);

  // AI 분석 상태
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [abTestResult, setAbTestResult] = useState<ABTestResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingOptimization, setLoadingOptimization] = useState(false);
  const [loadingABTests, setLoadingABTests] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'optimization' | 'abtests' | null>(null);

  console.log('📈 [전환율] 입력값:', { visitors, conversions, avgOrderValue, industry });

  // 계산 함수
  const calculate = () => {
    console.log('🧮 [전환율] 계산 시작...');

    if (visitors <= 0) {
      alert('방문자 수는 0보다 커야 합니다!');
      return;
    }

    if (conversions > visitors) {
      alert('전환 수는 방문자 수보다 클 수 없습니다!');
      return;
    }

    const rate = (conversions / visitors) * 100;
    const totalRevenue = conversions * avgOrderValue;
    const revenuePerV = totalRevenue / visitors;

    setConversionRate(rate);
    setRevenue(totalRevenue);
    setRevenuePerVisitor(revenuePerV);

    console.log('✅ [전환율] 계산 완료:', {
      전환율: rate,
      예상매출: totalRevenue,
      방문자당매출: revenuePerV,
    });
  };

  // 초기화 함수
  const reset = () => {
    setVisitors(0);
    setConversions(0);
    setAvgOrderValue(0);
    setConversionRate(null);
    setRevenue(null);
    setRevenuePerVisitor(null);
    setAnalysisResult(null);
    setOptimizationResult(null);
    setAbTestResult(null);
    setActiveTab(null);
    console.log('🔄 [전환율] 초기화');
  };

  // AI 분석 함수
  const handleAnalyze = async () => {
    if (conversionRate === null) {
      alert('먼저 전환율을 계산해주세요!');
      return;
    }

    setLoadingAnalysis(true);
    setActiveTab('analysis');

    try {
      console.log('🤖 [전환율 AI 분석] 시작...');
      const response = await fetch('/api/analyze-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitors,
          conversions,
          avgOrderValue,
          industry,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || '분석 실패');
      }

      const data = await response.json();
      setAnalysisResult(data);
      console.log('✅ [전환율 AI 분석] 완료:', data);
    } catch (error: any) {
      console.error('❌ [전환율 AI 분석] 오류:', error);
      alert(error?.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // 최적화 전략 함수
  const handleOptimize = async () => {
    if (conversionRate === null) {
      alert('먼저 전환율을 계산해주세요!');
      return;
    }

    setLoadingOptimization(true);
    setActiveTab('optimization');

    try {
      console.log('🤖 [전환율 최적화] 시작...');
      const response = await fetch('/api/optimize-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitors,
          conversions,
          avgOrderValue,
          industry,
          businessType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || '최적화 실패');
      }

      const data = await response.json();
      setOptimizationResult(data);
      console.log('✅ [전환율 최적화] 완료:', data);
    } catch (error: any) {
      console.error('❌ [전환율 최적화] 오류:', error);
      alert(error?.message || '최적화 전략 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingOptimization(false);
    }
  };

  // A/B 테스트 생성 함수
  const handleGenerateABTests = async () => {
    if (conversionRate === null) {
      alert('먼저 전환율을 계산해주세요!');
      return;
    }

    setLoadingABTests(true);
    setActiveTab('abtests');

    try {
      console.log('🤖 [A/B 테스트 생성] 시작...');
      const response = await fetch('/api/generate-ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitors,
          conversions,
          avgOrderValue,
          industry,
          businessType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'A/B 테스트 생성 실패');
      }

      const data = await response.json();
      setAbTestResult(data);
      console.log('✅ [A/B 테스트 생성] 완료:', data);
    } catch (error: any) {
      console.error('❌ [A/B 테스트 생성] 오류:', error);
      alert(error?.message || 'A/B 테스트 아이디어 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingABTests(false);
    }
  };

  // 시뮬레이션 계산
  const simulateImprovement = (increasePercent: number) => {
    if (conversionRate === null) return null;

    const newRate = conversionRate * (1 + increasePercent / 100);
    const newConversions = (visitors * newRate) / 100;
    const newRevenue = newConversions * avgOrderValue;
    const additionalRevenue = newRevenue - (revenue || 0);

    return {
      newRate,
      newConversions,
      newRevenue,
      additionalRevenue,
    };
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📈 전환율 계산기
          </h1>
          <p className="text-gray-600">
            방문자 대비 전환율을 계산하고 AI로 개선 방안을 찾아보세요
          </p>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            💡 전환율(Conversion Rate)이란?
          </h2>
          <p className="text-gray-600 mb-4">
            웹사이트 방문자 중 실제 구매나 회원가입 등 원하는 행동을 완료한
            비율을 나타내는 핵심 지표입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-purple-50 p-3 rounded">
              <strong>전환율:</strong> (전환 수 ÷ 방문자 수) × 100%
            </div>
            <div className="bg-pink-50 p-3 rounded">
              <strong>예상 매출:</strong> 전환 수 × 평균 주문 금액
            </div>
          </div>
        </div>

        {/* 입력 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📝 정보 입력
          </h2>

          <div className="space-y-6">
            {/* 방문자 수 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                방문자 수 (명)
              </label>
              <input
                type="number"
                value={visitors || ''}
                onChange={(e) => setVisitors(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                placeholder="예: 10000"
                min="0"
              />
            </div>

            {/* 전환 수 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                전환 수 (건)
                <span className="text-gray-500 font-normal ml-2">
                  - 구매, 회원가입, 문의 등
                </span>
              </label>
              <input
                type="number"
                value={conversions || ''}
                onChange={(e) => setConversions(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                placeholder="예: 250"
                min="0"
              />
            </div>

            {/* 평균 주문 금액 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                평균 주문 금액 (원)
                <span className="text-gray-500 font-normal ml-2">
                  - 선택사항
                </span>
              </label>
              <input
                type="number"
                value={avgOrderValue || ''}
                onChange={(e) => setAvgOrderValue(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                placeholder="예: 50000"
                min="0"
              />
            </div>

            {/* 업계 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                업계 선택
                <span className="text-gray-500 font-normal ml-2">
                  - AI 분석에 사용됩니다
                </span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              >
                <option value="ecommerce">이커머스</option>
                <option value="saas">SaaS</option>
                <option value="education">교육</option>
                <option value="finance">금융</option>
                <option value="healthcare">의료/헬스케어</option>
                <option value="other">기타</option>
              </select>
            </div>

            {/* 비즈니스 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비즈니스 유형
                <span className="text-gray-500 font-normal ml-2">
                  - 선택사항
                </span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              >
                <option value="general">일반</option>
                <option value="b2c">B2C</option>
                <option value="b2b">B2B</option>
                <option value="marketplace">마켓플레이스</option>
                <option value="subscription">구독 서비스</option>
              </select>
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
        {conversionRate !== null && (
          <div className="space-y-6">
            {/* 기본 결과 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-lg shadow-lg p-6 border-2 border-purple-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 계산 결과
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 전환율 */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">전환율</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {conversionRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {conversions}명 / {visitors}명
                  </div>
                </div>

                {/* 예상 매출 */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">예상 매출</div>
                  <div className="text-2xl font-bold text-green-600">
                    {revenue?.toLocaleString()} 원
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    총 전환 매출
                  </div>
                </div>

                {/* 방문자당 매출 */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="text-sm text-gray-600 mb-2">방문자당 매출</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {revenuePerVisitor?.toLocaleString()} 원
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    평균 수익
                  </div>
                </div>
              </div>

              {/* AI 기능 버튼들 */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={loadingAnalysis}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAnalysis ? '🤖 분석 중...' : '🤖 AI 분석하기'}
                </button>
                <button
                  onClick={handleOptimize}
                  disabled={loadingOptimization}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingOptimization ? '⚡ 최적화 중...' : '⚡ 최적화 전략'}
                </button>
                <button
                  onClick={handleGenerateABTests}
                  disabled={loadingABTests}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingABTests ? '🧪 생성 중...' : '🧪 A/B 테스트 아이디어'}
                </button>
              </div>
            </div>

            {/* AI 분석 결과 */}
            {activeTab === 'analysis' && analysisResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🤖 AI 분석 결과
                </h3>

                {/* 요약 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
                  <p className="text-gray-700 font-medium">{analysisResult.summary}</p>
                </div>

                {/* 벤치마크 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 업계 비교</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">현재 전환율</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.benchmark.currentRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">업계 평균</div>
                      <div className="text-2xl font-bold text-gray-600">
                        {analysisResult.benchmark.industryAverage}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {analysisResult.benchmark.message}
                  </p>
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
                        <div className="text-xs text-gray-600">
                          예상 개선: +{rec.expectedImprovement.toFixed(1)}% | 
                          영향도: {rec.impact === 'high' ? '높음' : rec.impact === 'medium' ? '중간' : '낮음'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 빠른 개선 방안 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">⚡ 빠른 개선 방안</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.quickWins.map((win, idx) => (
                      <div key={idx} className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                        <h5 className="font-bold text-yellow-800 mb-2">{win.title}</h5>
                        <p className="text-sm text-yellow-700 mb-2">{win.description}</p>
                        <div className="text-xs text-yellow-600">
                          노력: {win.effort === 'low' ? '낮음' : win.effort === 'medium' ? '중간' : '높음'} | 
                          영향: {win.impact === 'high' ? '높음' : win.impact === 'medium' ? '중간' : '낮음'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 최적화 전략 결과 */}
            {activeTab === 'optimization' && optimizationResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ⚡ 최적화 전략
                </h3>

                {/* 전략 개요 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border-2 border-green-300">
                  <h4 className="font-bold text-gray-800 mb-3">📋 전략 개요</h4>
                  <p className="text-gray-700 mb-4">{optimizationResult.strategy.overview}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">목표 전환율</div>
                      <div className="text-xl font-bold text-green-600">
                        {optimizationResult.strategy.targetRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">예상 기간</div>
                      <div className="text-xl font-bold text-gray-700">
                        {optimizationResult.strategy.timeline}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">추가 매출</div>
                      <div className="text-xl font-bold text-blue-600">
                        +{optimizationResult.strategy.expectedRevenue.toLocaleString()}원
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">개선율</div>
                      <div className="text-xl font-bold text-purple-600">
                        +{optimizationResult.metrics.improvement.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 로드맵 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">🗺️ 실행 로드맵</h4>
                  <div className="space-y-4">
                    {optimizationResult.roadmap.map((phase, idx) => (
                      <div key={idx} className="border-2 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-bold text-lg">{phase.phase}: {phase.title}</h5>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(phase.priority)}`}>
                            {phase.priority === 'high' ? '높음' : phase.priority === 'medium' ? '중간' : '낮음'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{phase.description}</p>
                        <div className="text-xs text-gray-600 mb-3">
                          예상 소요 기간: {phase.duration}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">실행 항목:</div>
                          <ul className="space-y-1">
                            {phase.actions.map((action, actionIdx) => (
                              <li key={actionIdx} className="text-sm text-gray-700 flex items-start">
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

                {/* 업계별 맞춤 전략 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">🎯 업계별 맞춤 전략</h4>
                  <div className="space-y-3">
                    {optimizationResult.industrySpecific.map((strategy, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <h5 className="font-bold text-blue-800 mb-2">{strategy.title}</h5>
                        <p className="text-sm text-blue-700 mb-2">{strategy.description}</p>
                        <p className="text-xs text-blue-600">💡 {strategy.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* A/B 테스트 결과 */}
            {activeTab === 'abtests' && abTestResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🧪 A/B 테스트 아이디어
                </h3>

                {/* 전체 가설 */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6 border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-800 mb-2">💡 전체 테스트 가설</h4>
                  <p className="text-purple-700">{abTestResult.hypothesis}</p>
                </div>

                {/* 테스트 목록 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">📋 테스트 목록</h4>
                  <div className="space-y-6">
                    {abTestResult.tests.map((test, idx) => (
                      <div key={test.id} className="border-2 rounded-lg p-5 bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="font-bold text-lg mb-2">{test.title}</h5>
                            <p className="text-sm text-gray-600">{test.hypothesis}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(test.priority)}`}>
                            {test.priority === 'high' ? '높음' : test.priority === 'medium' ? '중간' : '낮음'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white rounded p-3 border-2 border-gray-200">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              {test.variantA.name}
                            </div>
                            <div className="text-sm text-gray-700">{test.variantA.description}</div>
                          </div>
                          <div className="bg-blue-50 rounded p-3 border-2 border-blue-300">
                            <div className="text-xs font-semibold text-blue-600 mb-1">
                              {test.variantB.name}
                            </div>
                            <div className="text-sm text-blue-700">{test.variantB.description}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-600">측정 지표</div>
                            <div className="font-semibold">{test.metric}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">예상 개선</div>
                            <div className="font-semibold text-green-600">
                              +{test.expectedImprovement.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">노력</div>
                            <div className="font-semibold">
                              {test.effort === 'low' ? '낮음' : test.effort === 'medium' ? '중간' : '높음'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">테스트 기간</div>
                            <div className="font-semibold">{test.duration}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          📍 테스트 영역: {test.page}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 테스트 계획 */}
                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300">
                  <h4 className="font-semibold text-yellow-800 mb-3">📅 테스트 계획</h4>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-yellow-700 mb-2">권장 실행 순서:</div>
                    <div className="flex flex-wrap gap-2">
                      {abTestResult.testPlan.recommendedOrder.map((testId, idx) => (
                        <span
                          key={testId}
                          className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold"
                        >
                          {idx + 1}. {abTestResult.tests.find((t) => t.id === testId)?.title || testId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-yellow-700 mb-2">
                    <strong>전체 일정:</strong> {abTestResult.testPlan.timeline}
                  </div>
                  <div className="text-xs text-yellow-600">
                    <strong>주의사항:</strong> {abTestResult.testPlan.notes}
                  </div>
                </div>
              </div>
            )}

            {/* 개선 시뮬레이션 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                🚀 전환율 개선 시뮬레이션
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                전환율을 개선하면 어떤 효과가 있을까요?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[10, 20, 50].map((percent) => {
                  const sim = simulateImprovement(percent);
                  if (!sim) return null;

                  return (
                    <div
                      key={percent}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200"
                    >
                      <div className="text-center mb-3">
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                          +{percent}% 개선
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">새 전환율:</span>
                          <span className="font-bold text-blue-600 ml-2">
                            {sim.newRate.toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">새 전환 수:</span>
                          <span className="font-bold text-green-600 ml-2">
                            {Math.round(sim.newConversions)}건
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">추가 매출:</span>
                          <span className="font-bold text-orange-600 ml-2">
                            +{Math.round(sim.additionalRevenue).toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 업계 평균 비교 */}
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
              <h3 className="font-semibold text-gray-800 mb-3">
                📊 업계 평균 전환율
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-600">이커머스</div>
                  <div className="font-bold text-purple-600">2-3%</div>
                </div>
                <div>
                  <div className="text-gray-600">SaaS</div>
                  <div className="font-bold text-purple-600">3-5%</div>
                </div>
                <div>
                  <div className="text-gray-600">교육</div>
                  <div className="font-bold text-purple-600">5-10%</div>
                </div>
                <div>
                  <div className="text-gray-600">금융</div>
                  <div className="font-bold text-purple-600">10-15%</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                ※ 업계 및 상품에 따라 차이가 있을 수 있습니다
              </p>
            </div>
          </div>
        )}

        {/* 사용 팁 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            💡 전환율 개선 팁
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 웹사이트 로딩 속도 최적화</li>
            <li>• 명확한 CTA(Call To Action) 버튼 배치</li>
            <li>• 간소화된 구매 프로세스</li>
            <li>• 신뢰를 주는 리뷰 및 증명 요소</li>
            <li>• 모바일 최적화</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
