import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { salePrice, costPrice } = await request.json();

    if (salePrice === undefined || costPrice === undefined) {
      return NextResponse.json(
        { error: '판매가와 원가가 필요합니다.' },
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
    const targetCPA = salePrice - costPrice;
    const profitMargin = (targetCPA / salePrice) * 100;

    const prompt = `다음 목표 CPA 데이터를 분석하고 광고 전략을 제시해주세요.

**현재 데이터:**
- 판매가: ${salePrice.toLocaleString()}원
- 원가: ${costPrice.toLocaleString()}원
- 목표 CPA: ${targetCPA.toLocaleString()}원
- 이익률: ${profitMargin.toFixed(2)}%

다음 형식으로 JSON을 반환해주세요:
{
  "summary": "현재 목표 CPA 상태에 대한 한 줄 요약",
  "analysis": {
    "targetCPA": ${targetCPA},
    "profitMargin": ${profitMargin},
    "status": "excellent|good|fair|poor",
    "message": "목표 CPA 달성 가능성 평가"
  },
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "recommendations": [
    {
      "title": "개선 제안 제목",
      "description": "구체적인 개선 방안 설명",
      "priority": "high|medium|low",
      "expectedImpact": "예상 효과 설명",
      "actionItems": ["실행 항목1", "실행 항목2"]
    }
  ],
  "advertisingStrategy": {
    "budgetAllocation": {
      "suggestedDailyBudget": 추천_일일_예산_숫자,
      "suggestedMonthlyBudget": 추천_월간_예산_숫자,
      "reason": "예산 배분 이유"
    },
    "channels": [
      {
        "name": "채널명",
        "description": "채널 설명",
        "suitability": "high|medium|low",
        "expectedCPA": 예상_CPA_숫자
      }
    ],
    "optimizationTips": ["최적화 팁1", "최적화 팁2"]
  },
  "pricingStrategy": {
    "currentPrice": ${salePrice},
    "suggestedPrice": 추천_판매가_숫자,
    "reason": "가격 조정 이유",
    "expectedCPA": 예상_CPA_숫자
  }
}

반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.`;

    console.log('🤖 [목표 CPA AI 분석] 요청 시작:', { salePrice, costPrice });

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
      console.error('❌ [목표 CPA AI 분석] JSON 파싱 오류:', parseError);
      console.error('원본 응답:', jsonText.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'AI 응답을 파싱하는 중 오류가 발생했습니다.',
          details: '응답 형식이 올바르지 않습니다. 다시 시도해주세요.'
        },
        { status: 500 }
      );
    }

    console.log('✅ [목표 CPA AI 분석] 완료');

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('❌ [목표 CPA AI 분석] 오류:', error);
    
    let errorMessage = '목표 CPA 분석 중 오류가 발생했습니다.';
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

