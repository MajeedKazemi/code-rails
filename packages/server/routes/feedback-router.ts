import express from "express";

import { IUser } from "../models/user";
import { openai } from "../utils/openai";
import { verifyUser } from "../utils/strategy";

export const feedbackRouter = express.Router();

feedbackRouter.post("/generate", verifyUser, async (req, res) => {
    const { description,
            currentCode,
            solution,
            samples } = req.body;
    const userId = (req.user as IUser)._id;

    if (description !== undefined) {
const prompt = `You are a helpful teaching assistant tasked with providing feedback on introductory Python coding problems.
The teaching assistant will not provide code, but will provide feedback on the code that the student has written.
The problem that the student is trying to solve is: ${description} with the correct solution being: ${solution}.
The student has written the following code to solve the problem:\n${currentCode}\nPlease provide feedback on the code:\n`;

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
