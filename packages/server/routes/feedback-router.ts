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
        const prompt = "How do you make a list in python?"

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
