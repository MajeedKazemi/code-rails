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

    const [themes, setThemes] = useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>("");

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
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [categoryConfirmed, setCategoryConfirmed] = useState<boolean>(false);

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
        // set themes based on category
        setThemes([
            "Mario",
            "Zelda",
            "Sonic",
            "Pokemon",
            "Halo",
            "Call of Duty",
            "FIFA",
            "Madden",
            "NBA 2K",
            "MLB The Show",
            "NHL",
            "Rocket League"
        ]);

        setCategoryConfirmed(true);
    };

    const submitTheme = async (): Promise<boolean> => {
        try {
            console.log("Theme Selected: " + selectedTheme);
            const resp = await apiUpdateTheme(
                context?.token,
                selectedTheme
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
                {!categoryConfirmed ?
                    categories.map((category, index) => {
                        return (
                            <button
                                key={`category_button_${index}`}
                                className={(selectedCategory === category ? "bg-slate-300 border-black" : "bg-white border-slate-300") + " flex items-center p-4 border rounded-3xl hover:bg-slate-300 w-full aspect-square"}
                                onClick={() => setSelectedCategory(category)}
                            >
                                <p className="w-full">{category}</p>
                            </button>
                        );
                    })
                :
                    themes.map((theme, index) => {
                        return (
                            <button
                                key={`category_button_${index}`}
                                className={(selectedTheme === theme ? "bg-slate-300 border-black" : "bg-white border-slate-300") + " flex items-center p-4 border rounded-3xl hover:bg-slate-300 w-full aspect-square"}
                                onClick={() => setSelectedTheme(theme)}
                            >
                                <p className="w-full">{theme}</p>
                            </button>
                        );
                    })
                }
            </div>
            <div className="flex flex-row self-end gap-2">
                    {!categoryConfirmed ?
                        <button disabled={!selectedCategory} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={confirmCategory}>
                            Confirm Category
                        </button>
                    :
                        <>
                            <button className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={() => setCategoryConfirmed(false)}>
                                Back
                            </button>
                            <button disabled={!selectedTheme} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={handleSubmitTask}>
                                Confirm Theme
                            </button>
                        </>
                    }
            </div>
        </div>
    );
};
