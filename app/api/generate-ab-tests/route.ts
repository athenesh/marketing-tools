import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { visitors, conversions, avgOrderValue, industry, businessType } = await request.json();

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

    const conversionRate = (conversions / visitors) * 100;

    const prompt = `다음 비즈니스 정보를 바탕으로 A/B 테스트 아이디어를 생성해주세요.

**비즈니스 정보:**
- 업계: ${industry || '일반'}
- 비즈니스 유형: ${businessType || '일반'}
- 방문자 수: ${visitors.toLocaleString()}명
- 전환 수: ${conversions.toLocaleString()}건
- 현재 전환율: ${conversionRate.toFixed(2)}%
- 평균 주문 금액: ${avgOrderValue ? avgOrderValue.toLocaleString() + '원' : '미입력'}

다음 형식으로 JSON을 반환해주세요:
{
  "hypothesis": "전체 테스트 가설",
  "tests": [
    {
      "id": "test-1",
      "title": "테스트 제목",
      "hypothesis": "이 테스트의 가설",
      "variantA": {
        "name": "현재 버전 (Control)",
        "description": "현재 상태 설명"
      },
      "variantB": {
        "name": "개선 버전 (Variant)",
        "description": "테스트할 개선 사항 설명"
      },
      "metric": "측정할_지표",
      "priority": "high|medium|low",
      "expectedImprovement": 예상_개선율_숫자,
      "effort": "low|medium|high",
      "duration": "권장_테스트_기간",
      "page": "테스트할_페이지_또는_영역"
    }
  ],
  "testPlan": {
    "recommendedOrder": ["test-1", "test-2", "test-3"],
    "timeline": "전체_테스트_일정",
    "notes": "테스트 실행 시 주의사항"
  }
}

반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.`;

    console.log('🤖 [A/B 테스트 생성] 요청 시작');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSON 추출
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const abTests = JSON.parse(jsonText);

    console.log('✅ [A/B 테스트 생성] 완료');

    return NextResponse.json(abTests);
  } catch (error) {
    console.error('❌ [A/B 테스트 생성] 오류:', error);
    return NextResponse.json(
      { error: 'A/B 테스트 아이디어 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

