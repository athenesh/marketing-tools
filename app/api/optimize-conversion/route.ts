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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const conversionRate = (conversions / visitors) * 100;
    const revenue = conversions * (avgOrderValue || 0);

    const prompt = `다음 비즈니스 정보를 바탕으로 맞춤형 전환율 최적화 전략을 제시해주세요.

**비즈니스 정보:**
- 업계: ${industry || '일반'}
- 비즈니스 유형: ${businessType || '일반'}
- 방문자 수: ${visitors.toLocaleString()}명
- 전환 수: ${conversions.toLocaleString()}건
- 현재 전환율: ${conversionRate.toFixed(2)}%
- 평균 주문 금액: ${avgOrderValue ? avgOrderValue.toLocaleString() + '원' : '미입력'}

다음 형식으로 JSON을 반환해주세요:
{
  "strategy": {
    "overview": "전체 최적화 전략 개요",
    "targetRate": 목표_전환율_숫자,
    "timeline": "예상_달성_기간",
    "expectedRevenue": 예상_매출_증가액_숫자
  },
  "roadmap": [
    {
      "phase": "1단계|2단계|3단계",
      "title": "단계별 제목",
      "description": "구체적인 실행 내용",
      "duration": "예상_소요_기간",
      "priority": "high|medium|low",
      "actions": ["실행 항목1", "실행 항목2", "실행 항목3"]
    }
  ],
  "industrySpecific": [
    {
      "title": "업계별 맞춤 전략",
      "description": "구체적인 설명",
      "reason": "이 전략이 효과적인 이유"
    }
  ],
  "metrics": {
    "currentRate": ${conversionRate},
    "targetRate": 목표_전환율_숫자,
    "improvement": 개선_퍼센트_숫자,
    "additionalConversions": 추가_전환수_숫자,
    "additionalRevenue": 추가_매출_숫자
  }
}

반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.`;

    console.log('🤖 [전환율 최적화] 요청 시작:', { industry, businessType });

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

    // JSON 파싱 시도
    let optimization;
    try {
      optimization = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ [전환율 최적화] JSON 파싱 오류:', parseError);
      console.error('원본 응답:', jsonText.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'AI 응답을 파싱하는 중 오류가 발생했습니다.',
          details: '응답 형식이 올바르지 않습니다. 다시 시도해주세요.'
        },
        { status: 500 }
      );
    }

    console.log('✅ [전환율 최적화] 완료');

    return NextResponse.json(optimization);
  } catch (error: any) {
    console.error('❌ [전환율 최적화] 오류:', error);
    
    let errorMessage = '전환율 최적화 전략 생성 중 오류가 발생했습니다.';
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

