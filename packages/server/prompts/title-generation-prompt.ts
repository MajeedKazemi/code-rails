import OpenAI from "openai";

export const titleGenerationPrompt = (theme: string, task_description: string, current_titles: string) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `using the provided [character] generate three [story-titles] without quotes as a way to incorporate storytelling (which includes a setup, conflict, and resolution) for the provided [python-programming-task].

The story's conflict part should be about the provided [python-programming-task]

Use the following template:
[story-titles]:
- <10-15 word story title>
- <10-15 word story title>
- <10-15 word story title>
[end-story-titles]

each story should have a completely different narrative and conflict. be imaginative. these will be provided to k-12 students to make the python tasks more engaging.`,
        },
        {
            role: "user",
            content: `[character]: ${theme}

[python-programming-task]:
${task_description}`,
        }
    ];

    if (current_titles) {
        messages.push({
            role: "assistant",
            content: `[story-titles]:
${current_titles}
[end-story-titles]`
        });

        messages.push({
            role: "user",
            content: `Generate three more titles`
        });
    }

    return {
        messages,
        stop: [],
        model: "gpt-4-turbo-preview",
        temperature: 0.5,
        max_tokens: 1024,
        parser: (resTxt: string) => titleGenerationParser(resTxt),
    };
};

const titleGenerationParser = (txt: string) => {
    return txt.split("\n").slice(1, -1).map(l => l.replace(/^- /, "").trim());
};
