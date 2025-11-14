import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productDescription } = await request.json();

    if (!productDescription || typeof productDescription !== 'string') {
      return NextResponse.json(
        { error: '상품 설명이 필요합니다.' },
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

    const prompt = `다음 상품 설명을 바탕으로 광고 성과 계산에 필요한 정보를 추출해주세요.

상품 설명: ${productDescription}

다음 정보를 JSON 형식으로 반환해주세요:
- name: 상품명 (한글, 간결하게)
- salePrice: 판매가 (원 단위, 숫자만)
- profitPerUnit: 개당 순이익 (원 단위, 숫자만, 판매가에서 원가를 뺀 값)
- adCost: 광고비 (원 단위, 숫자만, 합리적인 추정치)
- conversions: 전환수 (건수, 숫자만, 합리적인 추정치)

상품 설명에서 명확하지 않은 정보는 합리적으로 추정해주세요.
반환 형식은 반드시 유효한 JSON이어야 하며, 다른 설명 없이 JSON만 반환해주세요.

예시:
{
  "name": "프리미엄 무선 이어폰",
  "salePrice": 150000,
  "profitPerUnit": 50000,
  "adCost": 500000,
  "conversions": 100
}`;

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

    const productData = JSON.parse(jsonText);

    // 데이터 검증 및 정리
    const validatedData = {
      name: productData.name || '상품',
      salePrice: Number(productData.salePrice) || 0,
      profitPerUnit: Number(productData.profitPerUnit) || 0,
      adCost: Number(productData.adCost) || 0,
      conversions: Number(productData.conversions) || 0,
    };

    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('AI 추정 오류:', error);
    return NextResponse.json(
      { error: '상품 정보 추정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

