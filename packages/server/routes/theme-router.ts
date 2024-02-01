import express from "express";

import { IUser, UserModel } from "../models/user";

import { verifyUser } from "../utils/strategy";
import { openai } from "../utils/openai";
import { titleGenerationPrompt } from "../prompts/title-generation-prompt";
import { taskCustomizationPrompt } from "../prompts/task-customization-prompt";
import { getTaskFromTaskId } from "../tasks/tasks";

export const themeRouter = express.Router();

themeRouter.put("/", verifyUser, async (req, res) => {
    // Update User Theme
    const userId = (req.user as IUser)._id;
    const user = await UserModel.findById(userId)
    const theme = req.body.theme;
    if (!theme) {
        res.statusCode = 400;
        res.send({
            success: false,
            message: "Theme not provided"
        });
        return;
    }
    if (!user) {
        res.statusCode = 404;
        res.send({
            success: false,
            message: "User not found"
        });
        return;
    }

    user.theme = theme;

    user.save().then(
        (user: IUser) => {
            res.send({
                success: true,
            });
        },
        (err: any) => {
            res.statusCode = 500;
            res.send(err);
        }
    );
});

themeRouter.get("/", verifyUser, async (req, res) => {
    // Get User Theme
    const theme = (req.user as IUser).theme;
    if (theme !== undefined) {
        res.statusCode = 200;
        res.send({
            success: true,
            theme,
        });
    } else {
        res.statusCode = 500;
        res.send({
            success: false,
            messsage: "User theme not found"
        });
    }
});

themeRouter.post("/titles", verifyUser, async (req, res) => {
    const { taskId } = req.body;
    const task = getTaskFromTaskId(taskId);
    if (!task) {
        res.statusCode = 404;
        res.send({
            success: false,
            message: "Task not found"
        });
        return;
    }

    const taskDescription = task.description;
    const userId = (req.user as IUser)._id;
    const theme = (req.user as IUser).theme;

    if (!theme) {
        res.statusCode = 500;
        res.send({
            success: false,
            message: "User Theme not found"
        });
        return;
    }

    const prompt = titleGenerationPrompt(
        theme,
        taskDescription
    );

    console.log("Generating Titles...");
    const rawTitles = await openai.chat.completions.create({
        messages: prompt.messages,
        model: prompt.model,
        temperature: prompt.temperature,
        stop: prompt.stop,
        user: userId,
    });

    if (rawTitles.choices[0].message.content === null) {
        console.log("Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const titles = prompt.parser(rawTitles.choices[0].message.content);

    res.statusCode = 200;
    res.send({
        success: true,
        titles,
    });
});

themeRouter.post("/apply", verifyUser, async (req, res) => {
    const { taskDescription } = req.body;
    const userId = (req.user as IUser)._id;
    const theme = (req.user as IUser).theme;

    if (!theme) {
        res.statusCode = 500;
        res.send({
            success: false,
            message: "User Theme not found"
        });
        return;
    }

    const prompt = taskCustomizationPrompt(
        theme,
        taskDescription
    );

    const rawTask = await openai.chat.completions.create({
        messages: prompt.messages,
        model: prompt.model,
        temperature: prompt.temperature,
        stop: prompt.stop,
        user: userId,
    });

    if (rawTask.choices[0].message.content === null) {
        console.log("Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const task = prompt.parser(rawTask.choices[0].message.content);

    res.statusCode = 200;
    res.send({
        success: true,
        task,
    });
});
