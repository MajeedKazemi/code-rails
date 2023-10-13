import { spawn } from "child_process";

export const removeComments = (code: string) =>
    code
        .replace(/\s*?#.*?\n/g, "") // single line comments
        .replace(/'''[\s\S]*?'''/g, "") // multi-line comments
        .replace(/"""[\s\S]*?"""/g, ""); // multi-line comments

export const formatPythonCode = (code: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const blackFormat = spawn("black", [
            "--code", code,
        ]);
        
        let formattedCode = "";
        
        blackFormat.stdout.on("data", (data) => {
            formattedCode += data.toString();
        });
        
        blackFormat.stderr.on("data", (data) => {
            reject(data.toString());
        });
        
        blackFormat.on("close", (code: number) => {
            if (code === 0) {
                resolve(formattedCode);
            } else {
                reject(`clang-format exited with code ${code}`);
            }
        });
    });
