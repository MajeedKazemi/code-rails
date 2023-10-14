export const rawFixedCodeParser = (r: string) => {
    const obj: any = {
        rawFixedCode: r,
    };

    // remove [STOP-end-fixed-code-STOP] from the end of the file

    if (r.endsWith("\n[STOP-end-fixed-code-STOP]")) {
        obj.rawFixedCode = r.replace("\n[STOP-end-fixed-code-STOP]", "");
    }

    return obj;
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
