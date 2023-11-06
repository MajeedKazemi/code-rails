import express from "express";

import { IUser } from "../models/user";
import { openai } from "../utils/openai";
import { verifyUser } from "../utils/strategy";
import { formatPythonCode, removeComments } from "../utils/format";
import { feedbackL1Prompt } from "../prompts/level-one-feedback-prompt";

export const feedbackRouter = express.Router();

feedbackRouter.post("/generate", verifyUser, async (req, res) => {
    const { description,
            currentCode,
            solution,
            samples,
            correctness,
            iteration } = req.body;
    const userId = (req.user as IUser)._id;

    const cleanedCode = await formatPythonCode(removeComments(currentCode.trim()));

    console.log(`Original Code:\n${currentCode}`)
    console.log(`Cleaned Code:\n${cleanedCode}`)
    const formattedL1Prompt = feedbackL1Prompt(
        description.substring(0, 500),
        cleanedCode.substring(0, 2500),
        []
    );

    console.log("Generating Feedback...")
    const rawL1Feedback = await openai.chat.completions.create({
        messages: formattedL1Prompt.messages,
        model: formattedL1Prompt.model,
        temperature: formattedL1Prompt.temperature,
        stop: formattedL1Prompt.stop,
        user: userId,
    });

    if (rawL1Feedback.choices[0].message.content === null) {
        console.log("Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    console.log("Raw Feedback:")
    console.log(rawL1Feedback.choices[0].message.content);

    const L1Feedback: string = formattedL1Prompt.parser(rawL1Feedback.choices[0].message.content);

    console.log("Parsed Feedback:")
    console.log(L1Feedback);

    console.log("Returning Feedback...")
    res.json({
        feedback: L1Feedback,
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
please indicate if the code is correct enough or incorrect by returning "correct" or "incorrect"
Do not say anthing else`;

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
