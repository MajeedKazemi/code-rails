import OpenAI from "openai";

export const subCategoryPrompt = (category: string) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `Using the provided [category] generate nine [themes].
[themes] are only a few words at most which relate to the selected [category]

These themes will be used to generate a subsequent list of [characters], so ensure that each [theme] has identifiable [characters] associated with it.

These [characters] will then be used for story telling purposes in teaching programming to students in grades k-12 students, so keep them simple

Use the following template:
[themes]:
- <few word theme>
- <few word theme>
- <few word theme>
[end-themes]`,
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
