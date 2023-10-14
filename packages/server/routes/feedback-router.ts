import express from "express";

import { IUser } from "../models/user";
import { openai } from "../utils/openai";
import { verifyUser } from "../utils/strategy";
import { formatPythonCode, removeComments } from "../utils/format";
import { mainDiffFixedCode, mainFixCode } from "../prompts/fix-code-prompt";
import { labelFixedCode, labelOriginalCode } from "../utils/agents";

export const feedbackRouter = express.Router();

feedbackRouter.post("/generate", verifyUser, async (req, res) => {
    const { description,
            currentCode,
            solution,
            samples,
            correctness } = req.body;
    const userId = (req.user as IUser)._id;

    console.log("Original Code:\n", currentCode);
    
    console.log("Formatting Code...");
    const cleanedCode = await formatPythonCode(removeComments(currentCode.trim()));

    const fixCodePrompt = mainFixCode(
        description.substring(0, 500),
        cleanedCode.substring(0, 2500)
    );

    console.log("Generating Fixed Code..."); // TODO: Investigate replacing with the given solution
    const rawFixedCode = await openai.chat.completions.create({
        messages: fixCodePrompt.messages,
        model: fixCodePrompt.model,
        temperature: fixCodePrompt.temperature,
        stop: fixCodePrompt.stop,
        user: userId,
    });
    
    if (rawFixedCode.choices[0].message.content === null) {
        console.log("Fixed Code Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const fixedCode: string = fixCodePrompt.parser(rawFixedCode.choices[0].message.content);
    
    console.log("Fixed Code:\n", fixedCode);

    console.log("Annotating Code...");
    const explainDiffPrompt = mainDiffFixedCode(
        labelOriginalCode(cleanedCode, fixedCode),
        labelFixedCode(cleanedCode, fixedCode),
        description.substring(0, 500)
    );

    console.log("Generating Code Explanation...");
    const rawExplainedCode = await openai.chat.completions.create({
        messages: explainDiffPrompt.messages,
        model: explainDiffPrompt.model,
        temperature: explainDiffPrompt.temperature,
        stop: explainDiffPrompt.stop,
        user: userId,
    });
    
    // if (rawExplainedCode.choices && rawExplainedCode.choices?.length > 0) {
    if (rawExplainedCode.choices[0].message.content === null) {
        console.log("Code Explanation Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const explainedCode: string = explainDiffPrompt.parser(rawExplainedCode.choices[0].message.content);

    console.log("Explained Code:\n", explainedCode)

    res.json({
        feedback: explainedCode,
        success: true,
    });
});

feedbackRouter.post("/correctness", verifyUser, async (req, res) => {
    const { description,
            currentCode,
            solution,
            samples } = req.body;
    const notes = [
        "In print statements the specific string does not matter, but the general format does.",
    ];
    const userId = (req.user as IUser)._id;

    if (description !== undefined) {
        const prompt = `You are a helpful teaching assistant tasked with determining correctness of introductory Python coding problem solutions.
The problem that the student is trying to solve is: ${description} with a correct solution being: ${solution}.
The student has written the following code to solve the problem:\n${currentCode}
Keep in mind that the student's code does not need to be an exact match to the solution.
The goal is for them to demonstrate that they can solve the problem, so we do not care if they make a small string typo or use a different variable name.
Ignore HTML tags.
You should favour marking things as correct rather than incorrect.
please indicate if the code is correct enough or incorrect by returning "correct" or "incorrect"`;

        let result;
        while ((result?.choices[0].message.content !== "correct") && (result?.choices[0].message.content !== "incorrect")) {
            result = await openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: "gpt-3.5-turbo",
                temperature: 0.5,
                user: userId,
            });
        }

        if (result.choices && result.choices?.length > 0) {
            console.log("Returning response");

            switch (result.choices[0].message.content) {
                case "correct":
                    res.json({
                        correct: true,
                        success: true,
                    });
                    break;
                default:
                    res.json({
                        correct: false,
                        success: true,
                    });
                    break;
            }
        } else {
            res.json({
                success: false,
            });
        }
    }
});
