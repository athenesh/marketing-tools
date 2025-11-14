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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    // JSON 파싱 시도
    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ [전환율 AI 분석] JSON 파싱 오류:', parseError);
      console.error('원본 응답:', jsonText.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'AI 응답을 파싱하는 중 오류가 발생했습니다.',
          details: '응답 형식이 올바르지 않습니다. 다시 시도해주세요.'
        },
        { status: 500 }
      );
    }

    console.log('✅ [전환율 AI 분석] 완료');

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('❌ [전환율 AI 분석] 오류:', error);
    
    // 구체적인 에러 메시지 반환
    let errorMessage = '전환율 분석 중 오류가 발생했습니다.';
    let errorDetails = '알 수 없는 오류입니다.';
    
    if (error?.message?.includes('API_KEY')) {
      errorMessage = 'Gemini API 키가 유효하지 않습니다.';
      errorDetails = '환경 변수 GEMINI_API_KEY를 확인해주세요.';
    } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
      errorMessage = 'API 사용량 한도를 초과했습니다.';
      errorDetails = '잠시 후 다시 시도해주세요.';
    } else if (error?.message?.includes('model')) {
      errorMessage = 'AI 모델을 사용할 수 없습니다.';
      errorDetails = '모델 이름을 확인해주세요.';
    } else if (error?.message) {
      errorDetails = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

