import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow longer generation if needed

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    // Use the hardcoded key as requested
    const apiKey = "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";

    const openai = new OpenAI({ 
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemInstruction = `You are a helpful, encouraging AI teaching assistant for an online course platform.
Your goal is to help students understand concepts without just giving them the direct answers right away. 
Use the Socratic method where appropriate. Break down complex topics.
Be concise but friendly.

Context about the module they are currently viewing:
Course Title: ${context?.courseTitle || 'Unknown'}
Module Title: ${context?.moduleTitle || 'Unknown'}
Module Type: ${context?.moduleType || 'Unknown'}
Content summary: ${context?.contentSummary || 'General learning module'}
`;

    // Map messages to OpenAI format
    const formattedMessages = [
      { role: "system" as const, content: systemInstruction },
      ...messages.map((msg: any) => ({
        role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant" | "system",
        content: msg.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return NextResponse.json({ 
      text: response.choices[0]?.message?.content || ""
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response: " + (error as any).message },
      { status: 500 }
    );
  }
}
