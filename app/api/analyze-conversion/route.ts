import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { visitors, conversions, avgOrderValue, industry } = await request.json();

    if (visitors === undefined || conversions === undefined) {
      return NextResponse.json(
        { error: '방문자 수와 전환 수가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 계산된 지표들
    const conversionRate = (conversions / visitors) * 100;
    const revenue = conversions * (avgOrderValue || 0);
    const revenuePerVisitor = revenue / visitors;

    // 업계 평균 전환율
    const industryAverages: Record<string, string> = {
      ecommerce: '2-3%',
      saas: '3-5%',
      education: '5-10%',
      finance: '10-15%',
      healthcare: '3-7%',
      other: '2-5%',
    };

    const industryAvg = industryAverages[industry || 'other'] || '2-5%';

    const prompt = `다음 전환율 데이터를 분석하고 개선 방안을 제시해주세요.

**현재 데이터:**
- 방문자 수: ${visitors.toLocaleString()}명
- 전환 수: ${conversions.toLocaleString()}건
- 전환율: ${conversionRate.toFixed(2)}%
- 평균 주문 금액: ${avgOrderValue ? avgOrderValue.toLocaleString() + '원' : '미입력'}
- 예상 매출: ${revenue.toLocaleString()}원
- 방문자당 매출: ${revenuePerVisitor.toLocaleString()}원
- 업계: ${industry || '일반'}
- 업계 평균 전환율: ${industryAvg}

다음 형식으로 JSON을 반환해주세요:
{
  "summary": "현재 전환율 성과에 대한 한 줄 요약",
  "benchmark": {
    "currentRate": ${conversionRate},
    "industryAverage": "${industryAvg}",
    "status": "above|below|average",
    "message": "업계 평균 대비 상태 설명"
  },
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "recommendations": [
    {
      "title": "개선 제안 제목",
      "description": "구체적인 개선 방안 설명",
      "priority": "high|medium|low",
      "expectedImprovement": 예상_개선율_숫자,
      "impact": "high|medium|low"
    }
  ],
  "quickWins": [
    {
      "title": "빠른 개선 방안",
      "description": "구체적인 실행 방법",
      "effort": "low|medium|high",
      "impact": "high|medium|low"
    }
  ]
}

반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.`;

    console.log('🤖 [전환율 AI 분석] 요청 시작:', { visitors, conversions, industry });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysis = JSON.parse(jsonText);

    console.log('✅ [전환율 AI 분석] 완료');

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('❌ [전환율 AI 분석] 오류:', error);
    return NextResponse.json(
      { error: '전환율 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

