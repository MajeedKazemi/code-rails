import { diffLines } from "diff";

export const rawFixedCodeParser = (r: string) => {
    const obj: any = {
        rawFixedCode: r,
    };

    // remove [STOP-end-fixed-code-STOP] from the end of the file

    if (r.endsWith("\n[STOP-end-fixed-code-STOP]")) {
        obj.rawFixedCode = r.replace("\n[STOP-end-fixed-code-STOP]", "");
    }

    obj.rawFixedCode = obj.rawFixedCode.replace("[fixed-code]:", "").trim();

    return obj.rawFixedCode;
};

export const diffFixedCodeParser = (txt: string) => {
    const r = `[explained-original-code]:\n${txt}`;

    const obj: any = {
        rawExplainedLines: "",
        explanation: "",
    };

    const lines = r.split("\n");

    let inLineByLineExplanation = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("[explained-original-code]")) {
            inLineByLineExplanation = true;
            continue;
        } else if (line.startsWith("[end-explained-original-code]")) {
            inLineByLineExplanation = false;
            continue;
        } else if (inLineByLineExplanation) {
            obj.rawExplainedLines += line + "\n";
        } else if (line.startsWith("[high-level-explanation-of-changes]")) {
            obj.explanation = line.replace(
                "[high-level-explanation-of-changes]: ",
                ""
            );
        }
    }

    obj.rawExplainedLines = obj.rawExplainedLines.trim();

    obj.lines = obj.rawExplainedLines.split("\n").map((line: string) => {
        let splitter = " // [modified-reason]: ";

        if (line.includes("// [added-reason]: ")) {
            splitter = " // [added-reason]: ";
        }

        const [code, explanation] = line.split(splitter);

        return {
            code,
            explanation,
        };
    });

    return obj;
};

export const labelOriginalCode = (newCode: string, oldCode: string) => {
    const diff = diffLines(oldCode, newCode);
    let annotatedCode = "";

    for (const part of diff) {
        if (part.added) {
            const lines = part.value.split("\n");

            for (const line of lines) {
                if (line.trim() !== "") {
                    annotatedCode += `${line} // [modified]\n`;
                }
            }
        } else if (part.removed) {
            const lines = part.value.split("\n");

            for (const line of lines) {
                if (line.trim() !== "" && line.trim() !== "\n") {
                    // count spaces before the line

                    annotatedCode += `${keepSpacesBeforeLine(
                        line
                    )}// [added]\n`;
                } else {
                    // console.log("line is empty");
                }
            }
        } else {
            annotatedCode += part.value; // no change, copy line as is
        }
    }

    // go through each line of annotatedCode
    // if a line has // [added] and the line after it is // [modified] -> delete the // [added] part
    let finalAnnotatedCode = "";
    let lines = annotatedCode.split("\n");
    for (const [index, line] of lines.entries()) {
        if (
            index + 1 < lines.length &&
            line.includes("// [added]") &&
            lines[index + 1].includes("// [modified]")
        ) {
            // do nothing
            // console.log("");
        } else {
            finalAnnotatedCode += line + "\n";
        }
    }

    return finalAnnotatedCode.trim();
};

export const labelFixedCode = (oldCode: string, newCode: string) => {
    const diff = diffLines(oldCode, newCode);
    let annotatedCode = "";

    for (const part of diff) {
        if (part.added) {
            const lines = part.value.split("\n");
            lines.forEach((line) => {
                if (line.trim() !== "") {
                    annotatedCode += `${line} // [fixed]\n`;
                }
            });
        } else if (part.removed) {
            // do nothing for removed lines
        } else {
            annotatedCode += part.value; // no change, copy line as is
        }
    }

    return annotatedCode;
};

const keepSpacesBeforeLine = (line: string) => {
    let spaces = 0;
    for (const char of line) {
        if (char === " ") {
            spaces++;
        } else {
            break;
        }
    }

    return " ".repeat(spaces);
};
