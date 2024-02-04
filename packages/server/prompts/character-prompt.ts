import OpenAI from "openai";

export const characterPrompt = (category: string) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `Using the provided [category] generate up to nine [characters].
[characters] are individuals or heroes that are related to the given [category].

These [characters] will be used to generate a programming task in the form of a story with the [character] as the subject for grades k-12 students, so ensure that each [character] is well known.

Use the following template:
[characters]:
- <character name>
- <character name >
- <character name >
[end-characters]`,
        },
        {
            role: "user",
            content: `[category]: ${category}`,
        }
    ];

    return {
        messages,
        stop: [],
        model: "gpt-4-1106-preview",
        temperature: 0.5,
        max_tokens: 1024,
        parser: (resTxt: string) => parser(resTxt),
    };
};

const parser = (txt: string) => {
    return txt.split("\n").slice(1, -1).map(l => l.replace(/^- /, "").trim());
};
