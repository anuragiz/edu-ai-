import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow longer generation if needed

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in the environment.");
    }

    const ai = new GoogleGenAI({ 
      apiKey: apiKey || "", // Fallback to empty string to prevent ADC errors if undefined
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const { messages, context } = await req.json();

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

    // Extract the latest message
    const latestMessage = messages[messages.length - 1];
    
    // Format previous history for context if needed, but for simplicity we'll pass the latest message
    // A better implementation would format the full conversation history.
    let fullPrompt = "";
    
    if (messages.length > 1) {
       fullPrompt += "Previous conversation context:\n";
       messages.slice(0, -1).forEach((msg: any) => {
         fullPrompt += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
       });
       fullPrompt += "\n";
    }
    
    fullPrompt += `Student: ${latestMessage.content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ 
      text: response.text 
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response: " + (error as any).message },
      { status: 500 }
    );
  }
}
