import express from "express";

import { IUser } from "../models/user";
import { openai } from "../utils/openai";
import { verifyUser } from "../utils/strategy";

export const feedbackRouter = express.Router();

feedbackRouter.post("/generate", verifyUser, async (req, res) => {
    const { description,
            currentCode,
            solution,
            samples,
            correctness } = req.body;
    const userId = (req.user as IUser)._id;

    if (description !== undefined) {
        const correctness_prompt = `Their solution is considered ${correctness ? "correct" : "incorrect"}.`
        const prompt = `You are a helpful teaching assistant tasked with providing feedback on introductory Python coding problems.
The teaching assistant will not provide code, but will provide feedback on the code that the student has written.
The problem that the student is trying to solve is: ${description} with the correct solution being: ${solution}.
The student has written the following code to solve the problem:\n${currentCode}\n${correctness_prompt}
Please provide feedback on the code:\n`;

        const result = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "gpt-3.5-turbo",
            temperature: 0.5,
            user: userId,
        });

        if (result.choices && result.choices?.length > 0) {
            console.log("Returning response");
            const feedback = result.choices[0].message.content;

            res.json({
                feedback: feedback,
                success: true,
            });
        } else {
            res.json({
                success: false,
            });
        }
    }
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
                        feedback: true,
                        success: true,
                    });
                    break;
                default:
                    res.json({
                        feedback: false,
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
