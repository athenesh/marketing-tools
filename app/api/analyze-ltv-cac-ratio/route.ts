import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ltv, cac } = await request.json();

    if (ltv === undefined || cac === undefined) {
      return NextResponse.json(
        { error: 'LTV와 CAC가 필요합니다.' },
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
    const ratio = ltv / cac;
    const healthStatus = ratio >= 3 ? 'excellent' : ratio >= 2 ? 'good' : ratio >= 1 ? 'fair' : 'poor';

    const prompt = `다음 LTV:CAC 비율 데이터를 분석하고 마케팅 건전성 개선 방안을 제시해주세요.

**현재 데이터:**
- LTV (고객 생애 가치): ${ltv.toLocaleString()}원
- CAC (고객 획득 비용): ${cac.toLocaleString()}원
- LTV:CAC 비율: ${ratio.toFixed(2)}
- 건강도: ${healthStatus}

다음 형식으로 JSON을 반환해주세요:
{
  "summary": "현재 마케팅 건전성에 대한 한 줄 요약",
  "analysis": {
    "ltv": ${ltv},
    "cac": ${cac},
    "ratio": ${ratio},
    "healthStatus": "${healthStatus}",
    "message": "마케팅 건전성 평가 및 상태 설명"
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
  "improvementRoadmap": {
    "targetRatio": 목표_비율_숫자,
    "phases": [
      {
        "phase": "1단계|2단계|3단계",
        "title": "단계별 제목",
        "description": "구체적인 실행 내용",
        "duration": "예상_소요_기간",
        "priority": "high|medium|low",
        "actions": ["실행 항목1", "실행 항목2"]
      }
    ],
    "timeline": "전체_개선_일정"
  },
  "ltvOptimization": {
    "strategies": ["LTV 향상 전략1", "LTV 향상 전략2"],
    "expectedIncrease": 예상_LTV_증가율_숫자
  },
  "cacOptimization": {
    "strategies": ["CAC 절감 전략1", "CAC 절감 전략2"],
    "expectedDecrease": 예상_CAC_감소율_숫자
  }
}

반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.`;

    console.log('🤖 [LTV:CAC 비율 AI 분석] 요청 시작:', { ltv, cac });

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
      console.error('❌ [LTV:CAC 비율 AI 분석] JSON 파싱 오류:', parseError);
      console.error('원본 응답:', jsonText.substring(0, 500));
      return NextResponse.json(
        { 
          error: 'AI 응답을 파싱하는 중 오류가 발생했습니다.',
          details: '응답 형식이 올바르지 않습니다. 다시 시도해주세요.'
        },
        { status: 500 }
      );
    }

    console.log('✅ [LTV:CAC 비율 AI 분석] 완료');

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('❌ [LTV:CAC 비율 AI 분석] 오류:', error);
    
    let errorMessage = 'LTV:CAC 비율 분석 중 오류가 발생했습니다.';
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

