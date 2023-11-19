import OpenAI from "openai";

export const feedbackL2Prompt = (intendedBehavior: string, studentCode: string, notes: string[]) => {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
        {
            role: "system",
            content: `You are a programming tutor. I am a novice student that is learning how to write Python code for the first time. I might have difficulties understanding the syntax and logic as well as many other basic computational thinking and meta cognitive skills.

Look at the [intended-behavior] and [student-code] to first generate the [[numbered-fixed-student-code]]. The [[numbered-fixed-student-code]] should not go above and beyond to check every possible input. Just focus on making it work or achieving the [intended-behavior].

Then, look back at the [student-code] and annotate each line with [[correct]] and those that need to be edited with either [[change]], [[remove]], or [[fix]] and a description about why and how. If there are lines that are [[add]], add an empty line and just tag it with [[add]] and an explanation of it.

Then, look back at the [student-code] and generate [[suggested-fixes]].
Each line in [[suggested-fixes]] has two element:
\`[line]: <number>\` where \`<number>\` corresponds to the line number in [student-code] that the [[suggested-fixes]] is associated with.
[suggestion]: <hint and description> where \`<hint and description>\` is the details associated with the [[suggested-fixes]] for \`[line]\`

You will then generate [[missing-parts]] which are code suggestions that are not associated with a specific line due to reasons such as the logic being missing.
Each element of  [[missing-parts]] will be structured as follows:
\`\`\`
- [after-line]:
    - [line]: <number>
    - [description-of-the-missing-lines]: 
    - [missing-part]: <what is missing and why it's needed>
    - [missing-part]: <what is missing and why it's needed>
    - [missing-part]: <what is missing and why it's needed>
\`\`\`
where the following must hold for each component:
In \`[line]: <number>\` <number> refers to the line which comes before the described [missing-part]s.
[description-of-the-missing-lines] is a list of [missing-part] which are descriptions of what logic should be added following [line]. These are structured as follows:
\`[missing-part]: <what is missing and why it's needed>\` where \`<what is missing and why it's needed>\` is a description of the logic that the [student-code] is missing. There does not need to be a specific number of [missing-part]s in this list.
If there are no [[missing-parts]] simply leave the section blank as:
\`\`\`
[[missing-parts]]
[[end-missing-parts]]
\`\`\`

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
[[end-suggested-fixes]]

[[missing-parts]]
- [after-line]:
    - [line]: <number>
    - [description-of-the-missing-lines]: 
    - [missing-part]: <what is missing and why it's needed>
    - [missing-part]: <what is missing and why it's needed>
    - [missing-part]: <what is missing and why it's needed>
- [after-line]:
    - [line]: <number>
    - [list-of-the-description-of-the-missing-lines]: 
    - [missing-part]: <what is missing and why it's needed>
    - [missing-part]: <what is missing and why it's needed>
    - [missing-part]: <what is missing and why it's needed>
[[end-missing-parts]]`,
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
        parser: (resTxt: string) => feedbackParser(resTxt, studentCode),
    };
};

const feedbackParser = (txt: string, studentCode: string) => {
    const obj: any = {
        lines: Array<{
            code: string,
            explanation: string
        }>,
        type: "code"
    };

    obj.lines = studentCode.split('\n').map((line, i) => ({
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

    const missingParts = txt.match(/\[\[missing-parts\]\](.*?)\[\[end-missing-parts\]\]/gs)
    const mpLines = missingParts ? missingParts[0].split('\n').slice(1, -1) : [];
    let lineNumber;
    const missingSuggestions = Array.from(Array(studentCode.split('\n').length), () => [] as string[]); // new Array(studentCode.split('\n').length + 1).fill([]);

    for (const line of mpLines) {
        if (line.trim().startsWith('- [line]:')) {
            const lineMatch = line.match(/\[line\]: (\d+)/);
            if (lineMatch) {
                lineNumber = lineMatch[1];
            }
        } else if (line.trim().startsWith('- [missing-part]:')) {
            missingSuggestions[Number(lineNumber)-1].push(line.trim().substring('- [missing-part]:'.length).trim());
        }
    };

    for (const [i, line] of obj.lines.entries()) {
        line.explanation = line.explanation.concat(missingSuggestions[i]);
    }

    return obj;
};

const numberCode = (code: string) => {
    return code.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
};
