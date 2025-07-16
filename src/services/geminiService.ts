import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we'll log an error.
  console.error(
    "NEXT_PUBLIC_GEMINI_API_KEY environment variable not set. Gemini features will be disabled."
  );
}

// Initialize with a check to avoid crashing if the key is missing.
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const suggestTagsForPrompt = async (
  promptContent: string
): Promise<string[]> => {
  if (!genAI) {
    console.warn("Gemini AI client not initialized. Cannot suggest tags.");
    // Return a mock response or throw an error if the API key is not available
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    return ["mock-tag", "ai-disabled"];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze the following AI prompt and suggest 3 to 5 relevant, one-or-two-word tags for categorization. The tags should be lowercase and represent the prompt's core concepts, domain, or intent. Respond with only a comma-separated list of the tags.`,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "marketing, creative, headline" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.3,
      },
    });

    const result = await chat.sendMessage(promptContent);
    const response = await result.response;
    const text = response.text();
    return text.split(",").map((tag: string) => tag.trim());
  } catch (error) {
    console.error("Error suggesting tags from Gemini API:", error);
    // Return an empty array or throw the error, depending on desired behavior
    return [];
  }
};
