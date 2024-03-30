import express from "express";

import { IUser, UserModel, getPrimaryTheme } from "../models/user";

import { verifyUser } from "../utils/strategy";
import { openai } from "../utils/openai";
import { titleGenerationPrompt } from "../prompts/title-generation-prompt";
import { taskCustomizationPrompt } from "../prompts/task-customization-prompt";
import { getTaskFromTaskId } from "../tasks/tasks";
import { UserTaskModel } from "../models/user-task";
import { subCategoryPrompt } from "../prompts/sub-category-prompt";
import { characterPrompt } from "../prompts/character-prompt";

export const themeRouter = express.Router();

themeRouter.put("/", verifyUser, async (req, res) => {
    // Update User Theme
    const userId = (req.user as IUser)._id;
    const user = await UserModel.findById(userId)
    const themes: Array<string> = req.body.themes;
    if (!themes || themes.length === 0) {
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

    user.themes = themes;

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
    const themes = (req.user as IUser).themes;

    if (themes !== undefined) {
        res.statusCode = 200;
        res.send({
            success: true,
            themes,
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
    const { taskId, currentTitles } = req.body;
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
    const theme = getPrimaryTheme(req.user as IUser);

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
        taskDescription,
        currentTitles && currentTitles.length > 0 ? currentTitles.map((item: string) => `- ${item}`).join("\n") : ""
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
    const { taskId, title } = req.body;
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
    const theme = getPrimaryTheme(req.user as IUser);

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
        taskDescription,
        title
    );

    console.log("Applying Theme...");
    const rawTaskInformation = await openai.chat.completions.create({
        messages: prompt.messages,
        model: prompt.model,
        temperature: prompt.temperature,
        stop: prompt.stop,
        user: userId,
    });

    if (rawTaskInformation.choices[0].message.content === null) {
        console.log("Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const customTask = {title, ...prompt.parser(rawTaskInformation.choices[0].message.content)};

    UserTaskModel.findOne({ userId, taskId }).then((userTask) => {
        if (userTask) {
            userTask.customTask = customTask;

            userTask.save().then(
                (userTask) => {
                    res.statusCode = 200;
                    res.send({
                        success: true,
                        task: customTask
                    });
                },
                (err) => {
                    res.statusCode = 500;
                    res.send(err);
                }
            );
        } else {
            res.statusCode = 500;
            res.send({ message: "UserTask not found" });
        }
    });
});

themeRouter.post("/sub_categories", verifyUser, async (req, res) => {
    const { category } = req.body;
    const userId = (req.user as IUser)._id;

    if (!category) {
        res.statusCode = 400;
        res.send({
            success: false,
            message: "Category not provided"
        });
        return;
    }

    const prompt = subCategoryPrompt(
        category
    );

    console.log("Generating Sub Categories...");
    const rawCategories = await openai.chat.completions.create({
        messages: prompt.messages,
        model: prompt.model,
        temperature: prompt.temperature,
        stop: prompt.stop,
        user: userId,
    });

    if (rawCategories.choices[0].message.content === null) {
        console.log("Category Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const categories = prompt.parser(rawCategories.choices[0].message.content);

    res.statusCode = 200;
    res.send({
        success: true,
        categories,
    });
});

themeRouter.post("/characters", verifyUser, async (req, res) => {
    const { category } = req.body;
    const userId = (req.user as IUser)._id;

    if (!category) {
        res.statusCode = 400;
        res.send({
            success: false,
            message: "Category not provided"
        });
        return;
    }

    const prompt = characterPrompt(
        category
    );

    console.log("Generating Characters...");
    const rawCharacters = await openai.chat.completions.create({
        messages: prompt.messages,
        model: prompt.model,
        temperature: prompt.temperature,
        stop: prompt.stop,
        user: userId,
    });

    if (rawCharacters.choices[0].message.content === null) {
        console.log("Category Generation Failed...")
        res.json({
            success: false,
        });
        return;
    }

    const characters = prompt.parser(rawCharacters.choices[0].message.content);

    res.statusCode = 200;
    res.send({
        success: true,
        characters,
    });
});
