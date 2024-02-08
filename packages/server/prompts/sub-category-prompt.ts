import OpenAI from "openai";

export const subCategoryPrompt = (category: string) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `Using the provided [category] generate nine [sub-categories].
[sub-categories] are only a few words at most which relate to a subset of the selected [category]. This [sub-category] should be at most one level higher than individual characters.

ie as Mario, Halo are to video games

These [sub-categories] will be used to generate a subsequent list of [characters], so ensure that each [sub-category] has identifiable [characters] associated with it. Be specific

These [characters] will then be used for story telling purposes in teaching programming to students in grades k-12 students.

Use the following template:
[sub-categories]:
- <few word theme>
- <few word theme>
- <few word theme>
[end-sub-categories]`,
        },
        {
            role: "user",
            content: `[category]: ${category}`,
        }
    ];

    return {
        messages,
        stop: [],
        model: "gpt-4-turbo-preview",
        temperature: 0.5,
        max_tokens: 1024,
        parser: (resTxt: string) => parser(resTxt),
    };
};

const parser = (txt: string) => {
    return txt.split("\n").slice(1, -1).map(l => l.replace(/^- /, "").trim());
};
