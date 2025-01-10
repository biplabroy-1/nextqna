import { Groq } from "groq-sdk";

const apiKeys = [
	"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",
	"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",
	"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",
	"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",
	"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",
];

let currentKeyIndex = 0;

function getNextApiKey() {
	// Get the current API key
	const key = apiKeys[currentKeyIndex];

	// Update the index for the next call (circular rotation)
	currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

	return key;
}

export async function POST(req: Request) {
	try {
		const { question } = await req.json();

		// Get the next API key
		const apiKey = getNextApiKey();

		const groq = new Groq({
			apiKey: apiKey,
		});

		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content:
						"You are a helpful coding assistant to help java, html, css and javascript. Provide smaller, clear, concise answers to coding questions. just send the codes like a txt also without '```' if it is html css js question then send like this 'HTML: <html> CSS: <style> JAVASCRIPT: <script>'",
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

		return Response.json({
			answer: completion.choices[0]?.message?.content || "No answer generated",
		});
	} catch (error) {
		console.error("Error:", error);
		return Response.json({ error: "Failed to get answer" }, { status: 500 });
	}
}
