import express from "express";

import { getUserData, IUser, UserModel } from "../models/user";

import { verifyUser } from "../utils/strategy";

export const themeRouter = express.Router();

themeRouter.post("/", verifyUser, async (req, res) => {
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
