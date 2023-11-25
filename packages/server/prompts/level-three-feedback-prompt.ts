import OpenAI from "openai";

export const feedbackL3Prompt = (intendedBehavior: string, studentCode: string, notes: string[]) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `You are a programming tutor. I am a novice student that is learning how to write Python code for the first time. I might have difficulties understanding the syntax and logic as well as many other basic computational thinking and meta cognitive skills.

Look at the [intended-behavior] and [student-code] to first generate the [[numbered-fixed-student-code]]. The [[numbered-fixed-student-code]] should not go above and beyond to check every possible input. Just focus on making it work or achieving the [intended-behavior].

Then, look back at the [student-code] and generate [[suggested-fixes]].
Each line in [[suggested-fixes]] has two element:
\`[line]: <number>\` where \`<number>\` corresponds to the line number in [numbered-fixed-student-code] that the [[suggested-fixes]] is associated with.
[suggestion]: <hint and description> where \`<hint and description>\` is the details associated with the [[suggested-fixes]] for \`[line]\`

Use the following template:

# Template
[[numbered-fixed-student-code]]:
<A fixed version of [student-code]>
[[end-numbered-fixed-student-code]]

[[suggested-fixes]]:
- [line]: <number> [suggestion]: <hint and description>
- [line]: <number> [suggestion]: <hint and description>
- [line]: <number> [suggestion]: <hint and description>
- [line]: <number> [suggestion]: <hint and description>
[[end-suggested-fixes]]`
        },
        {
            role: "user",
            content: `[intended-behavior]: ${intendedBehavior}
[student-code]:
${numberCode(studentCode)}
[end-student-code]`
        }
    ];

    return {
        messages,
        stop: [],
        model: "gpt-4-1106-preview",
        temperature: 0.5,
        max_tokens: 1024,
        parser: (resTxt: string) => feedbackParser(resTxt),
    };
};

const feedbackParser = (txt: string) => {
    const obj: any = {
        lines: Array<{
            code: string,
            explanation: string[]
        }>,
        type: "code"
    };
    const annotatedCode = txt.match(/\[numbered-fixed-student-code\](.*?)\[end-numbered-fixed-student-code\]/gs)

    if (!annotatedCode) {
        return obj;
    }

    const fixedStudentCode = annotatedCode[0].split('\n').slice(2, -2).join('\n').replace(/^\d+\.\s?/gm, '');

    obj.lines = fixedStudentCode.split('\n').map((line, i) => ({
        code: line,
        explanation: []
    }));

    const suggestedFixes = txt.match(/\[\[suggested-fixes\]\](.*?)\[\[end-suggested-fixes\]\]/gs);
    const sfLines = suggestedFixes ? suggestedFixes[0].split('\n').slice(1, -1).join('\n') : "";
    const sfMatches = sfLines.matchAll(/\[line\]: (\d+) \[suggestion\]: (.*)/g);

    for (const match of sfMatches) {
        const lineNumber = match[1];
        const suggestion = match[2].trim();
        obj.lines[Number(lineNumber) - 1].explanation.push(suggestion);
    };

    return obj;
};

const numberCode = (code: string) => {
    return code.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
};
