import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';
import { tools, executeTool } from './tools.js';

const groq = new Groq({ apiKey: config.GROQ_API_KEY });
const gemini = config.GEMINI_API_KEY ? new GoogleGenerativeAI(config.GEMINI_API_KEY) : null;

export async function chat(userId: string, messages: any[], useFallback = false): Promise<string> {
    const systemPrompt = {
        role: "system",
        content: "You are meclaw, a personal AI agent running locally. You communicate clearly and concisely. You have access to tools. Only use them when necessary."
    };

    const fullMessages = [systemPrompt, ...messages];

    let loopLimit = 5;
    let iteration = 0;
    
    // We maintain a local thread of messages for tool calls within the loop
    let thread = [...fullMessages];

    while (iteration < loopLimit) {
        iteration++;
        try {
            if (!useFallback) {
                const response = await groq.chat.completions.create({
                    messages: thread,
                    model: "llama-3.3-70b-versatile",
                    tools: tools as any,
                    tool_choice: "auto",
                });
                
                const responseMessage = response.choices[0]?.message;
                
                if (!responseMessage) {
                    throw new Error("No response message from Groq");
                }

                if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                    thread.push(responseMessage); // Add assistant's tool call message
                    
                    for (const toolCall of responseMessage.tool_calls) {
                        const functionName = toolCall.function.name;
                        const functionArgs = JSON.parse(toolCall.function.arguments || "{}");
                        
                        const toolResult = await executeTool(functionName, functionArgs);
                        
                        thread.push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: functionName,
                            content: toolResult,
                        });
                    }
                    // Loop back to get the LLM's response to the tool output
                    continue;
                }
                
                return responseMessage.content || "Empty response from agent.";
            } else {
                throw new Error("Fallback Gemini not fully implemented for tool loops yet.");
            }
        } catch (error: any) {
            console.error(`LLM Error (Iteration ${iteration}):`, error.message);
            if (!useFallback && gemini) {
                console.log("Switching to Gemini fallback...");
                useFallback = true;
                
                // Simplified Gemini fallback implementation without tool loops
                const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = thread.map(m => `${m.role}: ${m.content || JSON.stringify(m.tool_calls)}`).join('\n');
                const result = await model.generateContent(prompt);
                return result.response.text();
            } else {
                return `Agent encountered an error: ${error.message}`;
            }
        }
    }
    
    return "Error: Agent loop limit reached.";
}
