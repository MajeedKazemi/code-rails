import { useContext, useState } from "react";

import { AuthContext } from "../context";
import { apiUpdateTheme } from "../api/theme_api";
import { apiLogEvents, apiUserSubmitTask, logError } from "../api/api";
import { getLogObject } from "../utils/logger";
import { Button } from "./button";
import { TextField } from "@mui/material";

interface Props {
    taskId: string;
    onCompletion: () => void;
}

export const SelectThemeTask = (props: Props) => {
    const { context, setContext } = useContext(AuthContext);
    const [theme, setTheme] = useState<string>("");

    const sendLog = () => {
        apiLogEvents(
            context?.token,
            props.taskId,
            getLogObject(props.taskId, context?.user?.id)
        )
            .then(() => {})
            .catch((error) => {
                logError("sendLog: " + error.toString());
            });
    };

    const submitTheme = async (): Promise<boolean> => {
        try {
            console.log("Theme Selected: " + theme);
            const resp = await apiUpdateTheme(
                context?.token,
                theme
            )
            const success = await resp.json();
            return success.success;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    const handleSubmitTask = () => {
        submitTheme().then((success) => {
            if (success) {
                apiUserSubmitTask(
                    context?.token,
                    props.taskId,
                    {},
                    new Date()
                )
                .then(async (response) => {
                    sendLog();
                    props.onCompletion();
                })
                .catch((error: any) => {
                    logError("handleSkipTask: " + error.toString());
                });
            } else {
                logError("Theme selection failed");

            }
        })
    };

    return (
        <div className="flex justify-items-center items-center max-w-5xl h-full m-auto">
            <div className="flex flex-col p-4 max-w-lg gap-2 border border-slate-300 m-auto rounded-3xl bg-white overflow-hidden">
                <div>
                    It is now time to select your personalized tasks theme. This theme will be used to generate your tasks during the study.
                </div>
                <div>
                    <TextField
                        label="Theme"
                        variant="standard"
                        value={theme}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setTheme(event.target.value);
                        }}
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={handleSubmitTask}
                        type="block"
                        class="max-w-[50%]"
                    >
                        Submit Theme
                    </Button>
                </div>
            </div>
        </div>
    );
};
