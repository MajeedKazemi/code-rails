import OpenAI from "openai";

export const taskCustomizationPrompt = (theme: string, task_description: string) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `You are a programming tutor. The student is a novice that is learning how to write Python code for the first time. They might have difficulties understanding the syntax and logic as well as many other basic computational thinking and meta cognitive skills.

You will be given a [[generic-task-description]] and some [[generic-task-samples]].
The [[generic-task-description]] represents a coding task the student is being asked to complete.
The [[generic-task-samples]] are examples related to [[generic-task-description]] such as intended code output.

You will take the provided [[generic-task-description]] and personalize the theme of it to [[student-interest]]. This personalization will maintain the original task objectives and structure.

Ensure that the [[personalized-task-samples]] are updated to match the [[personalized-task-description]] after they have both been adjusted.

The goal of the personalization is to simply change the theme of the provided task so that it is related to the student's interest. 

Use the following template:
# Template
[[personalized-task-description]]
<A personalized version of [[task-description]]>
[[end-personalized-task-description]]

[[personalized-task-samples]]
[[sample]]
<A personalized version of the first line in [[task-samples]]>
[[end-sample]]
[[sample]]
<A personalized version of the second line in [[task-samples]]>
[[end-sample]]
[[end-personalized-task-samples]]`,
        },
        {
            role: "user",
            content: `[[student-interest]]: ${theme}
[[generic-task-description]]
${task_description}
[[end-generic-task-description]]`,
        }
    ];

    return {
        messages,
        stop: [],
        model: "gpt-4-1106-preview",
        temperature: 0.5,
        max_tokens: 1024,
        parser: (resTxt: string) => taskCustomizationParser(resTxt),
    };
};

const taskCustomizationParser = (txt: string) => {
    const obj: any = {
        lines: Array<{type: string, explanation: string}>,
        type: "text"
    };

    return obj;
};
