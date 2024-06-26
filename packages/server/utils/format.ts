import { spawn } from "child_process";

export const removeComments = (code: string) =>
    code
        .replace(/\s*?#.*?\n/g, "") // single line comments
        .replace(/'''[\s\S]*?'''/g, "") // multi-line comments
        .replace(/"""[\s\S]*?"""/g, ""); // multi-line comments

export const formatPythonCode = (code: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const ruffFormat = spawn("ruff", [
            "--stdin-filename", "temp.py", "--fix", "--quiet", "--exit-zero", "--select", "ALL", "check",
        ]);

        ruffFormat.stdin.write(code);
        ruffFormat.stdin.end();
        
        let formattedCode = "";
        
        ruffFormat.stdout.on("data", (data) => {
            formattedCode += data.toString();
        });
        
        ruffFormat.stderr.on("data", (data) => {
            reject(data.toString());
        });
        
        ruffFormat.on("close", (code: number) => {
            if (code === 0) {
                resolve(formattedCode);
            } else {
                reject(`Ruff exited with code ${code}`);
            }
        });
    });
