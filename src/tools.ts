export const tools = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current time and date in ISO format",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];

export async function executeTool(name: string, args: any): Promise<string> {
  if (name === "get_current_time") {
    return new Date().toISOString();
  }
  return `Error: Tool '${name}' not found.`;
}
