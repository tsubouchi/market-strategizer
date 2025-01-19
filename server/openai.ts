import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export async function analyzeBusinessStrategy(
  analysisType: string,
  content: Record<string, any>
): Promise<string> {
  let prompt = "";
  
  switch (analysisType) {
    case "3C":
      prompt = `Analyze the following 3C analysis data and provide strategic insights:
      Company: ${content.company}
      Customer: ${content.customer}
      Competitors: ${content.competitors}
      
      Provide analysis in JSON format with the following structure:
      {
        "summary": "Brief overview",
        "strengths": ["str1", "str2"],
        "opportunities": ["opp1", "opp2"],
        "recommendations": ["rec1", "rec2"]
      }`;
      break;
      
    case "4P":
      prompt = `Analyze the following 4P marketing mix and provide strategic insights:
      Product: ${content.product}
      Price: ${content.price}
      Place: ${content.place}
      Promotion: ${content.promotion}
      
      Provide analysis in JSON format with the following structure:
      {
        "summary": "Brief overview",
        "marketFit": "Analysis of market fit",
        "pricingStrategy": "Pricing strategy analysis",
        "recommendations": ["rec1", "rec2"]
      }`;
      break;
      
    case "PEST":
      prompt = `Analyze the following PEST analysis data and provide strategic insights:
      Political: ${content.political}
      Economic: ${content.economic}
      Social: ${content.social}
      Technological: ${content.technological}
      
      Provide analysis in JSON format with the following structure:
      {
        "summary": "Brief overview",
        "keyFactors": ["factor1", "factor2"],
        "risks": ["risk1", "risk2"],
        "opportunities": ["opp1", "opp2"]
      }`;
      break;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return response.choices[0].message.content;
}
