import { useContext, useState } from "react";

import { AuthContext } from "../context";
import { apiGenerateSubCategories, apiUpdateTheme } from "../api/theme_api";
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
        // "Underwater Worlds",
        "Superheros",
        "Mythical Creatures",
        "National History",
        // "Cultural Heroes"
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
        console.log("Category Selected: " + selectedCategory)
        setThemes([]);
        apiGenerateSubCategories(context?.token, selectedCategory)
            .then(async (response) => {
                const data = await response.json();
                setThemes(data.categories);
            })
            .catch((error) => {
                logError("confirmCategory: " + error.toString());
            });

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

    const themeButton = (refText: string, text: string, index: number, setRefText: (text: string) => void) => {
        return (
            <button
                key={`button_${index}`}
                className={(refText === text ? "bg-slate-300 border-black" : "bg-white border-slate-300") + " flex items-center p-4 border rounded-3xl hover:bg-slate-300 w-full h-full"}
                onClick={() => setRefText(text)}
            >
                <p className="w-full">{text}</p>
            </button>
        );
    };

    return (
        <div className="flex flex-col gap-2 py-4 max-w-2xl m-auto">
            {!categoryConfirmed ?
                <>
                    <h1 className="text-2xl font-semibold">Category Selection</h1>
                    <p>The selected category will be used to generate a list of sub-categories for more refined interest selection:</p>
                </>
            :
                <>
                    <h1 className="text-2xl font-semibold">Theme Selection</h1>
                    <p>The selected theme will be used to generate a task for you to complete:</p>
                </>
            }
            <div className="grid grid-cols-3 auto-rows-fr gap-2 justify-items-center items-center w-full">
                {!categoryConfirmed ?
                    categories.map((category, index) => {
                        return (
                            themeButton(selectedCategory, category, index, setSelectedCategory)
                        );
                    })
                :
                    <> {themes.length > 0 ?
                        themes.map((theme, index) => {
                            return (
                                themeButton(selectedTheme, theme, index, setSelectedTheme)
                            );
                        })
                    :
                        <div className="col-span-full row-span-full flex flex-row gap-2 bg-white px-6 py-3 rounded-3xl border border-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Generating Sub Categories
                        </div>
                    } </>
                }
            </div>
            <div className="flex flex-row self-end gap-2">
                    {!categoryConfirmed ?
                        <button disabled={!selectedCategory} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={confirmCategory}>
                            Confirm Category
                        </button>
                    :
                        <>
                            {themes.length > 0 &&
                                <>
                                    <button className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={() => setCategoryConfirmed(false)}>
                                        Back
                                    </button>
                                    <button disabled={!selectedTheme} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={handleSubmitTask}>
                                        Confirm Theme
                                    </button>
                                </>
                            }
                        </>
                    }
            </div>
        </div>
    );
};
