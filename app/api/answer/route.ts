import { Groq } from "groq-sdk";

// Define types for the request body and response
interface RequestBody {
	question: string;
	topic: string;
}

interface GroqCompletion {
	choices: {
		message: {
			content: string;
		};
	}[];
}

// API keys array
const apiKeys: string[] = [
	"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",
	"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",
	"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",
	"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",
	"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",
];

let currentKeyIndex = 0;

// Function to get the next API key in rotation
function getNextApiKey(): string {
	const key = apiKeys[currentKeyIndex];
	currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
	return key;
}

// Main POST handler
export async function POST(req: Request): Promise<Response> {
	try {
		// Parse and validate the request body
		const { question, topic }: RequestBody = await req.json();

		if (!question || typeof question !== "string") {
			throw new Error("Invalid question provided.");
		}

		const apiKey = getNextApiKey();

		// Build the content dynamically based on the topic
		const content: string = topic
			? `You are a helpful coding assistant specializing in ${topic}. Provide smaller, clear, concise answers to coding questions. Just send the codes like a txt also without '\`\`\`'. If and only if it is HTML, CSS, JS combined question, then send like this 'HTML: <html> CSS: <style> JAVASCRIPT: <script>'`
			: "You are a helpful coding assistant specializing in Java, HTML, CSS, JavaScript. Provide smaller, clear, concise answers to coding questions. Just send the codes like a txt also without '```'. If and only if it is HTML, CSS, JS combined question, then send like this 'HTML: <html> CSS: <style> JAVASCRIPT: <script>'";

		// Create a Groq instance
		const groq = new Groq({
			apiKey: apiKey,
		});

		// Call the Groq API
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content: content,
				},
				{
					role: "user",
					content: question,
				},
			],
			model: "llama-3.3-70b-versatile",
			temperature: 1,
			max_tokens: 1024,
			top_p: 1,
			stop: null,
		});

		// Extract the response content
		const answer =
			completion.choices[0]?.message?.content || "No answer generated";

		return Response.json({ answer });
	} catch (error) {
		console.error("Error:", error);
		return Response.json(
			{
				error: error instanceof Error ? error.message : "Failed to get answer",
			},
			{ status: 500 },
		);
	}
}
