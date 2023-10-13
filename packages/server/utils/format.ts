export const removeComments = (code: string) =>
    code
        .replace(/\s*?#.*?\n/g, "") // single line comments
        .replace(/'''[\s\S]*?'''/g, "") // multi-line comments
        .replace(/"""[\s\S]*?"""/g, ""); // multi-line comments
