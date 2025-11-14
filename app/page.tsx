import Link from 'next/link';

export default function Home() {
  // 비즈니스 수익성 진단 도구 세트 (3단계)
  const diagnosticTools = [
    {
      name: '목표 CPA 계산기',
      description: '판매가와 원가를 기반으로 1회 전환당 최대 광고비를 계산하세요',
      icon: '🎯',
      link: '/target-cpa',
      color: 'from-blue-500 to-cyan-600',
      step: '1단계',
    },
    {
      name: 'LTV 계산기',
      description: '주문액과 구매 빈도로 고객 생애 가치를 계산하세요',
      icon: '👥',
      link: '/ltv',
      color: 'from-orange-500 to-red-600',
      step: '2단계',
    },
    {
      name: 'LTV:CAC 비율 계산기',
      description: 'LTV와 CAC를 입력받아 마케팅 건전성을 최종 판정하세요',
      icon: '📊',
      link: '/ltv-cac-ratio',
      color: 'from-purple-500 to-pink-600',
      step: '3단계',
    },
  ];

  // 기타 마케팅 도구 목록
  const tools = [
    {
      name: '광고 성과 계산기',
      description: 'ROAS, ROI, 순이익을 계산하고 최적의 광고 성과를 찾아보세요',
      icon: '📊',
      link: '/ad-performance',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: '손익분기점 계산기',
      description: '제품의 손익분기점(BEP)을 계산하여 필요한 판매량을 확인하세요',
      icon: '💰',
      link: '/break-even',
      color: 'from-green-500 to-emerald-600',
    },
    {
      name: '전환율 계산기',
      description: '방문자 대비 전환율과 예상 매출을 계산해보세요',
      icon: '📈',
      link: '/conversion-rate',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  console.log('🏠 홈페이지 로드 - 총 도구 개수:', tools.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            마케팅 성과를 극대화하세요 🚀
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            데이터 기반 의사결정을 위한 필수 마케팅 계산 도구 모음
            <br />
            무료로 사용하고 최적의 마케팅 전략을 수립하세요
          </p>
        </div>

        {/* 비즈니스 수익성 진단 도구 세트 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              🎯 비즈니스 수익성 진단 도구 세트
            </h3>
            <p className="text-lg text-gray-600">
              3단계로 비즈니스 수익성을 체계적으로 진단하세요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {diagnosticTools.map((tool, index) => (
              <Link
                key={tool.link}
                href={tool.link}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full border-2 border-transparent hover:border-indigo-300 relative">
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {tool.step}
                  </div>
                  <div
                    className={`bg-gradient-to-r ${tool.color} p-6 text-white`}
                  >
                    <div className="text-5xl mb-2">{tool.icon}</div>
                    <h3 className="text-2xl font-bold">{tool.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-lg mb-4">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                      <span>시작하기</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
            <h4 className="font-bold text-gray-800 mb-3 text-center">
              📋 3단계 진단 프로세스
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold text-indigo-600 mb-2">1단계: 목표 CPA</div>
                <p className="text-gray-600">
                  판매가와 원가를 입력하여 1회 전환당 최대 광고비를 계산합니다.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold text-orange-600 mb-2">2단계: LTV 계산</div>
                <p className="text-gray-600">
                  주문액과 구매 빈도로 고객 생애 가치를 계산합니다.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="font-semibold text-purple-600 mb-2">3단계: 비율 판정</div>
                <p className="text-gray-600">
                  LTV와 CAC를 비교하여 마케팅 건전성을 최종 판정합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 기타 도구 카드 그리드 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              🔧 기타 마케팅 도구
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.link}
              href={tool.link}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full border-2 border-transparent hover:border-indigo-300">
                <div
                  className={`bg-gradient-to-r ${tool.color} p-6 text-white`}
                >
                  <div className="text-5xl mb-2">{tool.icon}</div>
                  <h3 className="text-2xl font-bold">{tool.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-lg mb-4">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    <span>시작하기</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>

        {/* 특징 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            ✨ 왜 우리 도구를 사용해야 할까요?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-lg mb-2">빠르고 간편</h4>
              <p className="text-gray-600">
                복잡한 계산을 몇 번의 클릭으로 완료
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-lg mb-2">정확한 분석</h4>
              <p className="text-gray-600">
                검증된 공식으로 신뢰할 수 있는 결과
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">💡</div>
              <h4 className="font-bold text-lg mb-2">의사결정 지원</h4>
              <p className="text-gray-600">
                데이터 기반 마케팅 전략 수립
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 마케팅 도구 모음. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
