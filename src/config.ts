import dotenv from 'dotenv';
dotenv.config();

function getEnv(key: string, required = true): string {
    const value = process.env[key];
    if (required && !value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value || '';
}

export const config = {
    TELEGRAM_BOT_TOKEN: getEnv('TELEGRAM_BOT_TOKEN'),
    GROQ_API_KEY: getEnv('GROQ_API_KEY'),
    GEMINI_API_KEY: getEnv('GEMINI_API_KEY', false),
    DB_PATH: getEnv('DB_PATH', false) || './memory.db',
    ALLOWED_USERS: (getEnv('ALLOWED_USERS', false) || '')
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0)
};
