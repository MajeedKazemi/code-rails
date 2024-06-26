import "./utils/strategy";

import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import Session from "express-session";
import mongoose from "mongoose";
import passport from "passport";

import { codexRouter } from "./routes/codex-router";
import { loginRouter } from "./routes/login-router";
import { tasksRouter } from "./routes/tasks-router";
import { feedbackRouter } from "./routes/feedback-router";
import { initLanguageService } from "./sockets/intellisense";
import { initPythonShell } from "./sockets/python-shell";
import env from "./utils/env";
import { themeRouter } from "./routes/theme-router";

const corsOptions = {
    origin: (origin: any, callback: any) => {
        const whitelist = env.WHITELISTED_DOMAINS.split(",").map((d) =>
            d.trim()
        );

        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

mongoose.set("strictQuery", true);

mongoose
    .connect(env.MONGODB_URI,
        {
            dbName: "code-rails",  
        }
    )
    .then((db) => {
        const app = express();

        app.use(cors(corsOptions));
        app.use(
            Session({
                secret: env.COOKIE_SECRET,
                resave: false,
                saveUninitialized: false,
            })
        );

        app.use(compression());
        app.use(cookieParser(env.COOKIE_SECRET));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(
            bodyParser.json({
                limit: "50mb",
            })
        );
        app.use(
            bodyParser.urlencoded({
                limit: "10mb",
                extended: true,
            })
        );

        app.use("/api/auth/", loginRouter);
        app.use("/api/tasks/", tasksRouter);
        app.use("/api/codex/", codexRouter);
        app.use("/api/feedback/", feedbackRouter);
        app.use("/api/theme/", themeRouter);

        const server = app.listen(
            env.PORT_PREFIX + env.NODE_APP_INSTANCE,
            () => {
                console.log(
                    `Express server listening at http://localhost:${
                        env.PORT_PREFIX + env.NODE_APP_INSTANCE
                    }`
                );
            }
        );

        initPythonShell(server);
        initLanguageService(server);
    })
    .catch((err) => {
        console.error("[Terminating] Error connecting to MongoDB: ", err);
    });
