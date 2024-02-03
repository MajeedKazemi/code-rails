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

    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const categories = [
        "Video Games",
        "Sports",
        "Time Travel",
        "Space Exploration",
        "Music",
        "Ancient Civilizations",
        "Underwater Worlds",
        "Superheros",
        "Mythical Creatures",
        "National History",
        "Cultural Heroes"
    ];

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

    const confirmCategory = () => {

    };

    const submitTheme = async (): Promise<boolean> => {
        try {
            console.log("Theme Selected: " + selectedCategory);
            const resp = await apiUpdateTheme(
                context?.token,
                selectedCategory
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
        <div className="flex flex-col max-w-3xl m-auto">
            <div className="grid grid-cols-4 gap-2 py-6 justify-items-center items-center w-full">
                {categories.map((category, index) => {
                    return (
                        <button
                            key={`category_button_${index}`}
                            className={(selectedCategory === category ? "bg-slate-300 border-black" : "bg-white border-slate-300") + " flex items-center p-4 border rounded-3xl hover:bg-slate-300 w-full aspect-square"}
                            onClick={() => setSelectedCategory(category)}
                        >
                            <p className="w-full">{category}</p>
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-row self-end">
                <button disabled={!selectedCategory} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={confirmCategory}>
                    Confirm Category
                </button>
            </div>
        </div>
    );
};
