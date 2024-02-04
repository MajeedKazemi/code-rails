import { useContext, useState } from "react";

import { AuthContext } from "../context";
import { apiGenerateCharacters, apiGenerateSubCategories, apiUpdateTheme } from "../api/theme_api";
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

    const [subCategories, setSubCategories] = useState<string[]>([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");

    const [themes, setThemes] = useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>("");
    
    const [selectionStage, setSelectionStage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

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
        setSubCategories([]);
        setLoading(true);
        apiGenerateSubCategories(context?.token, selectedCategory)
            .then(async (response) => {
                const data = await response.json();
                setSubCategories(data.categories);
                setLoading(false);
            })
            .catch((error) => {
                logError("confirmCategory: " + error.toString());
            });
        setSelectionStage(selectionStage + 1);
    };

    const confirmSubCategory = () => {
        setThemes([]);
        setLoading(true);
        apiGenerateCharacters(context?.token, selectedSubCategory)
            .then(async (response) => {
                const data = await response.json();
                setThemes(data.characters);
                setLoading(false);
            })
            .catch((error) => {
                logError("confirmSubCategory: " + error.toString());
            });
        setSelectionStage(selectionStage + 1);
    };

    const submitTheme = async (): Promise<boolean> => {
        try {
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

    const navButtons = () => {
        let nextTask: () => void;
        let nextText: string;
        let disabled: boolean;
    
        switch (selectionStage) {
            case 2:
                nextTask = handleSubmitTask;
                nextText = "Confirm Theme";
                disabled = !selectedTheme;
                break;
            case 1:
                nextTask = confirmSubCategory;
                nextText = "Generate Sub Categories";
                disabled = !selectedSubCategory;
                break;
            case 0:
            default:
                nextTask = confirmCategory;
                nextText = "Confirm Category";
                disabled = !selectedCategory;
        }

        return (
            <div className="flex flex-row self-end gap-2">
                {selectionStage > 0 &&
                    <button className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={() => setSelectionStage(selectionStage-1)}>
                        Back
                    </button>
                }
                <button disabled={disabled} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={nextTask}>
                    {nextText}
                </button>
            </div>
        );
    };

    const grid = () => {
        let items: string[] = [];
        let comparisonValue: string;
        let setComparisonValue: (text: string) => void;

        let loadingText: string;
    
        switch (selectionStage) {
            case 2:
                items = themes;
                comparisonValue = selectedTheme;
                setComparisonValue = setSelectedTheme;
                loadingText = "Generating Themes";
                break;
            case 1:
                items = subCategories;
                comparisonValue = selectedSubCategory;
                setComparisonValue = setSelectedSubCategory;
                loadingText = "Generating Sub Categories";
                break;
            case 0:
            default:
                items = categories;
                comparisonValue = selectedCategory;
                setComparisonValue = setSelectedCategory;
                loadingText = "Generating Characters";
        }

        return (
            <div className="grid grid-cols-3 auto-rows-fr gap-2 justify-items-center items-center w-full">
                {!loading ?
                    items.map((item, index) => {
                        return (
                            themeButton(comparisonValue, item, index, setComparisonValue)
                        );
                    })
                :
                    <div className="col-span-full row-span-full flex flex-row gap-2 bg-white px-6 py-3 rounded-3xl border border-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        {loadingText}
                    </div>
                }
            </div>
        );
    };

    const headers = () => {
        let headerText: string;
        let subHeaderText: string;

        switch (selectionStage) {
            case 2:
                headerText = "Character Selection";
                subHeaderText = "The selected character will be used to generate a task for you to complete";
                break;
            case 1:
                headerText = "Sub-Category Selection";
                subHeaderText = "The selected sub-category will be used to generate a list of characters for you to select from";
                break;
            case 0:
            default:
                headerText = "Category Selection";
                subHeaderText = "The selected category will be used to generate a list of sub-categories for more refined interest selection";
        }
        return (
            <>
                <h1 className="text-2xl font-semibold">{headerText}</h1>
                <p>{subHeaderText}</p>
            </>
        );
    };

    return (
        <div className="flex flex-col gap-2 py-4 max-w-2xl m-auto">
            {headers()}
            {grid()}
            {navButtons()}
        </div>
    );
};
