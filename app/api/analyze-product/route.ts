import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { product } = await request.json();

    if (!product) {
      return NextResponse.json(
        { error: '상품 정보가 필요합니다.' },
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
    const revenue = product.salePrice * product.conversions;
    const roas = product.adCost > 0 ? revenue / product.adCost : 0;
    const netProfit = product.profitPerUnit * product.conversions - product.adCost;
    const roi = product.adCost > 0 ? (netProfit / product.adCost) * 100 : 0;

    const prompt = `다음 상품의 광고 성과 데이터를 분석하고 개선 방안을 제시해주세요.

**상품 정보:**
- 상품명: ${product.name}
- 판매가: ${product.salePrice.toLocaleString()}원
- 개당 순이익: ${product.profitPerUnit.toLocaleString()}원
- 광고비: ${product.adCost.toLocaleString()}원
- 전환수: ${product.conversions}건

**계산된 지표:**
- 매출: ${revenue.toLocaleString()}원
- ROAS: ${(roas * 100).toFixed(1)}%
- ROI: ${roi.toFixed(1)}%
- 순이익: ${netProfit.toLocaleString()}원

다음 형식으로 JSON을 반환해주세요:
{
  "summary": "현재 성과에 대한 한 줄 요약",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "recommendations": [
    {
      "title": "개선 제안 제목",
      "description": "구체적인 개선 방안 설명",
      "priority": "high|medium|low"
    }
  ],
  "optimization": {
    "suggestedAdCost": 추천_광고비_숫자,
    "suggestedConversions": 추천_전환수_숫자,
    "expectedProfit": 예상_순이익_숫자,
    "reason": "최적화 이유 설명"
  }
}

반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.`;

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

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('AI 분석 오류:', error);
    return NextResponse.json(
      { error: '상품 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

