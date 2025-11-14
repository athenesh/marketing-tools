'use client';

import { useState } from 'react';

// 상품 데이터 타입 정의
interface Product {
  id: number;
  name: string;
  salePrice: number; // 판매가
  profitPerUnit: number; // 개당 순이익
  adCost: number; // 광고비
  conversions: number; // 전환수
  // 계산 결과
  revenue?: number; // 매출
  roas?: number; // ROAS
  roi?: number; // ROI
  netProfit?: number; // 순이익
}

export default function AdPerformancePage() {
  // 상품 목록 상태 관리
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: '상품 1',
      salePrice: 0,
      profitPerUnit: 0,
      adCost: 0,
      conversions: 0,
    },
  ]);

  // 계산 완료 여부 상태
  const [isCalculated, setIsCalculated] = useState(false);

  // 순이익이 가장 높은 상품의 ID
  const [highestProfitId, setHighestProfitId] = useState<number | null>(null);

  // AI 자동 입력 관련 상태
  const [productDescription, setProductDescription] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiTargetProductId, setAiTargetProductId] = useState<number | null>(null);

  // AI 분석 관련 상태
  const [analyzingProductId, setAnalyzingProductId] = useState<number | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<number, any>>({});
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<number | null>(null);

  console.log('🚀 [광고 성과] 현재 상품 목록:', products);
  console.log('💰 [광고 성과] 순이익 최고 상품 ID:', highestProfitId);

  // 새로운 행 추가 함수
  const addRow = () => {
    const newProduct: Product = {
      id: products.length + 1,
      name: `상품 ${products.length + 1}`,
      salePrice: 0,
      profitPerUnit: 0,
      adCost: 0,
      conversions: 0,
    };
    setProducts([...products, newProduct]);
    setIsCalculated(false);
    console.log('➕ [광고 성과] 새 행 추가:', newProduct);
  };

  // 입력 값 변경 함수
  const handleInputChange = (
    id: number,
    field: keyof Product,
    value: string
  ) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            [field]: field === 'name' ? value : parseFloat(value) || 0,
          };
        }
        return product;
      })
    );
    setIsCalculated(false);
  };

  // 행 삭제 함수
  const deleteRow = (id: number) => {
    if (products.length === 1) {
      alert('최소 1개의 상품이 필요합니다.');
      return;
    }
    setProducts(products.filter((product) => product.id !== id));
    setIsCalculated(false);
    console.log('🗑️ [광고 성과] 행 삭제 - ID:', id);
  };

  // AI 자동 입력 함수
  const handleAiEstimate = async (productId?: number) => {
    const targetId = productId || products[0]?.id;
    if (!targetId) {
      alert('상품이 없습니다.');
      return;
    }

    const description = productDescription.trim();
    if (!description) {
      alert('상품 설명을 입력해주세요.');
      return;
    }

    setIsAiLoading(true);
    setAiTargetProductId(targetId);

    try {
      const response = await fetch('/api/estimate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productDescription: description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 추정 실패');
      }

      const estimatedData = await response.json();

      // 추정된 데이터를 해당 상품에 적용
      setProducts(
        products.map((product) => {
          if (product.id === targetId) {
            return {
              ...product,
              name: estimatedData.name || product.name,
              salePrice: estimatedData.salePrice || 0,
              profitPerUnit: estimatedData.profitPerUnit || 0,
              adCost: estimatedData.adCost || 0,
              conversions: estimatedData.conversions || 0,
            };
          }
          return product;
        })
      );

      setIsCalculated(false);
      setProductDescription(''); // 입력 필드 초기화
      alert('AI가 상품 정보를 자동으로 입력했습니다!');
    } catch (error) {
      console.error('AI 추정 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '상품 정보 추정 중 오류가 발생했습니다.'
      );
    } finally {
      setIsAiLoading(false);
      setAiTargetProductId(null);
    }
  };

  // AI 상품 분석 함수
  const handleAnalyzeProduct = async (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      alert('상품을 찾을 수 없습니다.');
      return;
    }

    // 최소한의 데이터가 있는지 확인
    if (product.salePrice === 0 && product.profitPerUnit === 0 && product.adCost === 0 && product.conversions === 0) {
      alert('분석할 상품 정보를 먼저 입력해주세요.');
      return;
    }

    setAnalyzingProductId(productId);

    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 분석 실패');
      }

      const analysis = await response.json();
      setAnalysisResults({
        ...analysisResults,
        [productId]: analysis,
      });
      setExpandedAnalysisId(productId);
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert(
        error instanceof Error
          ? error.message
          : '상품 분석 중 오류가 발생했습니다.'
      );
    } finally {
      setAnalyzingProductId(null);
    }
  };

  // 계산하기 함수
  const calculateResults = () => {
    console.log('🧮 [광고 성과] 계산 시작...');

    let maxProfit = -Infinity;
    let maxProfitId = null;

    // 각 상품의 결과 계산
    const calculatedProducts = products.map((product) => {
      // 매출 = 판매가 × 전환수
      const revenue = product.salePrice * product.conversions;

      // ROAS = 매출 ÷ 광고비 (광고비가 0이면 0으로 처리)
      const roas = product.adCost > 0 ? revenue / product.adCost : 0;

      // 순이익 = (개당 순이익 × 전환수) - 광고비
      const netProfit =
        product.profitPerUnit * product.conversions - product.adCost;

      // ROI = (순이익 ÷ 광고비) × 100 (광고비가 0이면 0으로 처리)
      const roi = product.adCost > 0 ? (netProfit / product.adCost) * 100 : 0;

      console.log(`📊 [광고 성과] ${product.name} 계산 결과:`, {
        매출: revenue,
        ROAS: roas,
        ROI: roi,
        순이익: netProfit,
      });

      // 최고 순이익 추적
      if (netProfit > maxProfit) {
        maxProfit = netProfit;
        maxProfitId = product.id;
      }

      return {
        ...product,
        revenue,
        roas,
        roi,
        netProfit,
      };
    });

    setProducts(calculatedProducts);
    setHighestProfitId(maxProfitId);
    setIsCalculated(true);

    const bestProduct = calculatedProducts.find((p) => p.id === maxProfitId);
    console.log('✅ [광고 성과] 계산 완료! 최고 순이익 상품 ID:', maxProfitId);
    console.log('🏆 [광고 성과] 최고 성과:', {
      상품명: bestProduct?.name,
      순이익: bestProduct?.netProfit,
      ROI: bestProduct?.roi,
      ROAS: bestProduct?.roas,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 광고 성과 계산기
          </h1>
          <p className="text-gray-600">
            상품의 판매 정보를 입력하고 최적의 광고 성과를 확인하세요
          </p>
        </div>

        {/* AI 자동 입력 카드 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 mb-6 border-2 border-purple-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🤖 AI 자동 입력
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            상품 설명을 입력하면 AI가 판매가, 순이익, 광고비, 전환수를 자동으로 추정합니다.
          </p>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAiLoading) {
                  handleAiEstimate();
                }
              }}
              placeholder="예: 프리미엄 무선 이어폰, 판매가 15만원, 원가 10만원, 월 광고비 50만원, 월 판매량 100개"
              className="flex-1 min-w-[300px] px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              disabled={isAiLoading}
            />
            <button
              onClick={() => handleAiEstimate()}
              disabled={isAiLoading || !productDescription.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAiLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  AI 분석 중...
                </>
              ) : (
                <>
                  ✨ AI 자동 입력
                </>
              )}
            </button>
          </div>
        </div>

        {/* 설명 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            💡 계산 공식
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-blue-50 p-3 rounded">
              <strong>매출:</strong> 판매가 × 전환수
            </div>
            <div className="bg-green-50 p-3 rounded">
              <strong>ROAS:</strong> (매출 ÷ 광고비) × 100%
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong>순이익:</strong> (개당 순이익 × 전환수) - 광고비
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <strong>ROI:</strong> (순이익 ÷ 광고비) × 100%
            </div>
          </div>
        </div>

        {/* 테이블 컨테이너 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    상품명
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    판매가 (원)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    개당 순이익 (원)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    광고비 (원)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    전환수
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    매출 (원)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    ROAS
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    ROI
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    순이익 (원)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    분석
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  // 최고 순이익 상품인지 확인
                  const isHighest =
                    isCalculated && product.id === highestProfitId;

                  return (
                    <tr
                      key={product.id}
                      className={`border-b transition-all ${
                        isHighest
                          ? 'bg-yellow-100 border-yellow-300 border-2'
                          : index % 2 === 0
                          ? 'bg-gray-50'
                          : 'bg-white'
                      } hover:bg-indigo-50`}
                    >
                      {/* 상품명 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) =>
                              handleInputChange(
                                product.id,
                                'name',
                                e.target.value
                              )
                            }
                            className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="상품명"
                          />
                          {isAiLoading && aiTargetProductId === product.id && (
                            <span className="text-purple-600 animate-pulse text-xs">
                              AI 분석 중...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 판매가 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={product.salePrice || ''}
                          onChange={(e) =>
                            handleInputChange(
                              product.id,
                              'salePrice',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                          min="0"
                        />
                      </td>

                      {/* 개당 순이익 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={product.profitPerUnit || ''}
                          onChange={(e) =>
                            handleInputChange(
                              product.id,
                              'profitPerUnit',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                          min="0"
                        />
                      </td>

                      {/* 광고비 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={product.adCost || ''}
                          onChange={(e) =>
                            handleInputChange(
                              product.id,
                              'adCost',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                          min="0"
                        />
                      </td>

                      {/* 전환수 */}
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={product.conversions || ''}
                          onChange={(e) =>
                            handleInputChange(
                              product.id,
                              'conversions',
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                          min="0"
                        />
                      </td>

                      {/* 매출 */}
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {product.revenue !== undefined
                          ? product.revenue.toLocaleString()
                          : '-'}
                      </td>

                      {/* ROAS */}
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {product.roas !== undefined
                          ? `${(product.roas * 100).toFixed(0)}%`
                          : '-'}
                      </td>

                      {/* ROI */}
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {product.roi !== undefined
                          ? `${product.roi.toFixed(1)}%`
                          : '-'}
                      </td>

                      {/* 순이익 */}
                      <td
                        className={`px-4 py-3 font-bold ${
                          isHighest
                            ? 'text-green-600 text-lg'
                            : 'text-gray-700'
                        }`}
                      >
                        {product.netProfit !== undefined ? (
                          <div className="flex items-center gap-2">
                            {product.netProfit.toLocaleString()}
                            {isHighest && <span className="text-xl">🏆</span>}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* 분석 버튼 */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleAnalyzeProduct(product.id)}
                          disabled={analyzingProductId === product.id}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          title="AI 분석"
                        >
                          {analyzingProductId === product.id ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              분석 중
                            </>
                          ) : (
                            <>
                              🔍 분석
                            </>
                          )}
                        </button>
                      </td>

                      {/* 삭제 버튼 */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteRow(product.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                    {expandedAnalysisId === product.id && analysisResults[product.id] && (
                      <tr>
                        <td colSpan={11} className="px-4 py-4 bg-gray-50">
                          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                🔍 AI 분석 결과: {product.name}
                              </h3>
                              <button
                                onClick={() => setExpandedAnalysisId(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                              >
                                ✕
                              </button>
                            </div>

                            {(() => {
                              const analysis = analysisResults[product.id];
                              return (
                                <div className="space-y-4">
                                  {/* 요약 */}
                                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                    <h4 className="font-semibold text-gray-800 mb-2">📊 요약</h4>
                                    <p className="text-gray-700">{analysis.summary}</p>
                                  </div>

                                  {/* 강점과 약점 */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 강점 */}
                                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        ✅ 강점
                                      </h4>
                                      <ul className="space-y-1">
                                        {analysis.strengths?.map((strength: string, idx: number) => (
                                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span>•</span>
                                            <span>{strength}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* 약점 */}
                                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        ⚠️ 개선 필요
                                      </h4>
                                      <ul className="space-y-1">
                                        {analysis.weaknesses?.map((weakness: string, idx: number) => (
                                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span>•</span>
                                            <span>{weakness}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  {/* 개선 제안 */}
                                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        💡 개선 제안
                                      </h4>
                                      <div className="space-y-3">
                                        {analysis.recommendations.map((rec: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className="bg-white rounded p-3 border border-purple-200"
                                          >
                                            <div className="flex items-start gap-2 mb-1">
                                              <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                                  rec.priority === 'high'
                                                    ? 'bg-red-100 text-red-700'
                                                    : rec.priority === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}
                                              >
                                                {rec.priority === 'high'
                                                  ? '높음'
                                                  : rec.priority === 'medium'
                                                  ? '보통'
                                                  : '낮음'}
                                              </span>
                                              <h5 className="font-semibold text-gray-800">{rec.title}</h5>
                                            </div>
                                            <p className="text-sm text-gray-600 ml-12">{rec.description}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 최적화 제안 */}
                                  {analysis.optimization && (
                                    <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        🎯 최적화 제안
                                      </h4>
                                      <div className="bg-white rounded p-4 space-y-2">
                                        <p className="text-sm text-gray-700 mb-3">{analysis.optimization.reason}</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                          <div>
                                            <div className="text-xs text-gray-600 mb-1">추천 광고비</div>
                                            <div className="font-bold text-indigo-600">
                                              {analysis.optimization.suggestedAdCost?.toLocaleString()}원
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-600 mb-1">추천 전환수</div>
                                            <div className="font-bold text-indigo-600">
                                              {analysis.optimization.suggestedConversions?.toLocaleString()}건
                                            </div>
                                          </div>
                                          <div>
                                            <div className="text-xs text-gray-600 mb-1">예상 순이익</div>
                                            <div className="font-bold text-green-600">
                                              {analysis.optimization.expectedProfit?.toLocaleString()}원
                                            </div>
                                          </div>
                                          <div>
                                            <button
                                              onClick={() => {
                                                if (analysis.optimization.suggestedAdCost && analysis.optimization.suggestedConversions) {
                                                  handleInputChange(
                                                    product.id,
                                                    'adCost',
                                                    analysis.optimization.suggestedAdCost.toString()
                                                  );
                                                  handleInputChange(
                                                    product.id,
                                                    'conversions',
                                                    analysis.optimization.suggestedConversions.toString()
                                                  );
                                                  alert('최적화 제안이 적용되었습니다!');
                                                }
                                              }}
                                              className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-semibold"
                                            >
                                              적용하기
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 버튼 영역 */}
          <div className="bg-gray-50 px-6 py-4 flex gap-4 justify-between flex-wrap">
            <button
              onClick={addRow}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              ➕ 행 추가
            </button>

            <button
              onClick={calculateResults}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              🧮 계산하기
            </button>
          </div>
        </div>

        {/* 결과 해석 */}
        {isCalculated && highestProfitId && (
          <div className="mt-6 space-y-4">
            {/* 최고 성과 요약 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg shadow-lg p-6 border-2 border-green-400">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🏆 결과 해석
              </h3>
              
              {(() => {
                const bestProduct = products.find((p) => p.id === highestProfitId);
                if (!bestProduct) return null;

                return (
                  <div className="space-y-4">
                    {/* 핵심 요약 */}
                    <div className="bg-white rounded-lg p-5 shadow-md border-l-4 border-green-500">
                      <p className="text-lg text-gray-800 leading-relaxed">
                        <strong className="text-green-600 text-xl">{bestProduct.name}</strong>이(가){' '}
                        <strong className="text-green-600 text-xl">
                          {bestProduct.netProfit?.toLocaleString()}원
                        </strong>의 순이익
                        <strong className="text-blue-600">
                          (ROI: {bestProduct.roi?.toFixed(1)}%)
                        </strong>
                        으로 가장 성과가 좋습니다.
                      </p>
                    </div>

                    {/* 상세 분석 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="text-sm text-gray-600 mb-1">총 매출</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {bestProduct.revenue?.toLocaleString()}원
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="text-sm text-gray-600 mb-1">ROAS</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {bestProduct.roas !== undefined
                            ? `${(bestProduct.roas * 100).toFixed(0)}%`
                            : '-'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          광고비 1원당 매출
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="text-sm text-gray-600 mb-1">광고비 대비 효율</div>
                        <div className="text-2xl font-bold text-green-600">
                          {bestProduct.adCost > 0
                            ? `${((bestProduct.netProfit! / bestProduct.adCost) * 100).toFixed(0)}%`
                            : '-'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          순이익 / 광고비
                        </div>
                      </div>
                    </div>

                    {/* 투자 분석 */}
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        💡 투자 분석
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>
                          • 광고비 <strong>{bestProduct.adCost.toLocaleString()}원</strong> 투자로{' '}
                          <strong className="text-green-600">
                            {bestProduct.netProfit?.toLocaleString()}원
                          </strong>의 순이익 창출
                        </li>
                        <li>
                          • 전환당 평균 순이익:{' '}
                          <strong className="text-blue-600">
                            {bestProduct.conversions > 0
                              ? Math.round(bestProduct.netProfit! / bestProduct.conversions).toLocaleString()
                              : 0}
                            원
                          </strong>
                        </li>
                        {bestProduct.roi !== undefined && bestProduct.roi > 0 && (
                          <li>
                            • ROI {bestProduct.roi.toFixed(1)}%는{' '}
                            {bestProduct.roi >= 100
                              ? '매우 우수한'
                              : bestProduct.roi >= 50
                              ? '우수한'
                              : bestProduct.roi >= 0
                              ? '양호한'
                              : '개선이 필요한'}{' '}
                            수준입니다
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* 다른 상품과 비교 */}
                    {products.length > 1 && (
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          📊 상품 비교
                        </h4>
                        <div className="text-sm text-gray-700 space-y-1">
                          {products
                            .filter((p) => p.id !== highestProfitId)
                            .sort((a, b) => (b.netProfit || 0) - (a.netProfit || 0))
                            .slice(0, 2)
                            .map((product) => {
                              const diff = (bestProduct.netProfit || 0) - (product.netProfit || 0);
                              return (
                                <li key={product.id}>
                                  • <strong>{product.name}</strong>보다{' '}
                                  <strong className="text-green-600">
                                    {diff.toLocaleString()}원
                                  </strong>{' '}
                                  더 많은 순이익
                                  {product.roi !== undefined && bestProduct.roi !== undefined && (
                                    <span className="text-gray-600">
                                      {' '}
                                      (ROI: {product.roi.toFixed(1)}% vs{' '}
                                      {bestProduct.roi.toFixed(1)}%)
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* 권장 사항 */}
                    <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        🎯 권장 사항
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>
                          • <strong>{bestProduct.name}</strong>에 마케팅 예산을 집중 투자하세요
                        </li>
                        {bestProduct.roas !== undefined && bestProduct.roas >= 3 && (
                          <li>• ROAS가 높으므로 광고 규모 확대를 고려해보세요</li>
                        )}
                        {bestProduct.roi !== undefined && bestProduct.roi < 50 && (
                          <li>• ROI 개선을 위해 광고비 최적화가 필요합니다</li>
                        )}
                        <li>• 성공 요인을 분석하여 다른 상품에도 적용하세요</li>
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

