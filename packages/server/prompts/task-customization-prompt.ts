import OpenAI from "openai";

export const taskCustomizationPrompt = (theme: string, task_description: string) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `using the given [character] and [story-title] augment the provided [python-programming-task] to include the [story-title]'s narrative.

This will be given to a k-12 student trying to learn about python programming. Just by augmenting the task description with a story using the provided [story-title] make the task more engaging for the student. The task should still implement a code that has the very similar code constructs (maybe just change the strings or numbers to fit with the new story)

The story should include the following parts:
[set-up], [conflict], and [resolution] all of which to be short/concise, easy to read and understand, and engaging for the young student.

in the [set-up] just try to provide the setup...
The [conflict] part is where you would focus on the [python-programming-task], make sure that the augmented version of the task does not have any ambiguity and could be precisely implemented to code. it should be well-specified for a programmer to write code for it, but augmented as part of the story.

for the [conflict] part, make it look like an instruction that a students needs to follow. the subject should be the student, they have to do the task correctly so that ...

and finally the resolution.

use the following format:
[set-up]: <2-3 sentences>
[conflict]: <one paragraph augmented task>
[resolution]: <2-3 sentences>`,
        },
        {
            role: "user",
            content: `[character]: ${theme}
[story-title]: Mario's Countdown to Save Princess Peach

[python-programming-task]:
${task_description}`,
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
