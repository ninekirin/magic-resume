import { NextRequest, NextResponse } from "next/server";
import { InterviewFormData } from "@/app/app/dashboard/interviews/types";
import { AIModelType } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { useAIConfigStore } from "@/store/useAIConfigStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, apiKey, model, content, modelType } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "请提供有效的文本内容" },
        { status: 400 }
      );
    }

    const modelConfig = AI_MODEL_CONFIGS[modelType as AIModelType];
    if (!modelConfig) {
      throw new Error("Invalid model type");
    }

    const response = await fetch(modelConfig.url, {
      method: "POST",
      headers: modelConfig.headers(apiKey),
      body: JSON.stringify({
        model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: `你是一个专业的面试信息提取助手。请从以下文本中提取面试相关的信息，并以JSON格式返回。

              需要提取的信息包括：
              1. 公司名称 (companyName)
              2. 职位名称 (position)
              3. 面试日期，格式为YYYY-MM-DD (date)
              4. 开始时间，格式为HH:MM (startTime)
              5. 面试时长，可能的值为："30分钟", "1小时", "1.5小时", "2小时", "2.5小时", "3小时" (duration)
              6. 面试地点 (location)
              7. 备注信息 (notes)

              请按照以下JSON格式返回结果：
              {
                "companyName": "公司名称",
                "position": "职位名称",
                "date": "YYYY-MM-DD",
                "startTime": "HH:MM",
                "duration": "面试时长",
                "location": "面试地点",
                "notes": "备注信息"
              }

              如果无法从文本中提取某项信息，则该字段返回空字符串。请确保返回的JSON格式正确且可以被解析。`
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const aiResult = await response.json();

    console.log(aiResult, "aiResult");

    let parsedData: Partial<InterviewFormData> = {};

    try {
      if (
        aiResult.choices &&
        aiResult.choices[0] &&
        aiResult.choices[0].message
      ) {
        const content = aiResult.choices[0].message.content;
        const extractedData = JSON.parse(content);

        parsedData = {
          companyName: extractedData.companyName || "",
          position: extractedData.position || "",
          date: extractedData.date || "",
          startTime: extractedData.startTime || "",
          duration: extractedData.duration || "1小时",
          location: extractedData.location || "",
          notes: extractedData.notes || "",
          status: "待面试",
          color: "#3b82f6"
        };
      }
    } catch (parseError) {
      console.error("解析 AI 返回结果时出错:", parseError);
      parsedData = {
        status: "待面试",
        color: "#3b82f6"
      };
    }

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("解析面试文本时出错:", error);
    return NextResponse.json({ error: "解析面试文本时出错" }, { status: 500 });
  }
}
