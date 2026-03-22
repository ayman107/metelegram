import { chat } from './llm.js';
import { addMessage, getHistory } from './db.js';

export async function processUserMessage(userId: string, text: string): Promise<string> {
    await addMessage(userId, 'user', text);
    
    const history = await getHistory(userId, 10);
    const messages = history.map(row => ({
        role: row.role as any,
        content: row.content
    }));
    
    const response = await chat(userId, messages);
    await addMessage(userId, 'assistant', response);
    
    return response;
}
