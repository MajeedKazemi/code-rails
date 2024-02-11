import React, { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "../context";
import { apiGenerateCharacters, apiGenerateSubCategories, apiUpdateTheme } from "../api/theme_api";
import { apiLogEvents, apiUserSubmitTask, logError } from "../api/api";
import { getLogObject } from "../utils/logger";
import { TextField } from "@mui/material";
import { Accordion, AccordionItem, Selection } from "@nextui-org/react";

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

    const [selectedAccordionKeys, setSelectedAccordionKeys] = React.useState<Selection>(new Set(["stage_0"]));

    const buttonRef = useRef<HTMLDivElement>(null);

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

    const confirmCategory = (value: string) => {
        setLoading(true);
        apiGenerateSubCategories(context?.token, value)
            .then(async (response) => {
                const data = await response.json();
                setSubCategories(data.categories);
                setLoading(false);
            })
            .catch((error) => {
                logError("confirmCategory: " + error.toString());
            });
    };

    const confirmSubCategory = (value: string) => {
        setLoading(true);
        apiGenerateCharacters(context?.token, value)
            .then(async (response) => {
                const data = await response.json();
                setThemes(data.characters);
                setLoading(false);
            })
            .catch((error) => {
                logError("confirmSubCategory: " + error.toString());
            });
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

    const headers = (stage: number) => {
        let headerText: string;
        let subHeaderText: string;

        switch (stage) {
            case 2:
                headerText = "Character Selection";
                subHeaderText = "The selected character will be used to generate tasks for you to complete";
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

        return [headerText, subHeaderText];
    };

    const themeButton = (
        refText: string,
        text: string,
        index: number,
        setRefText: (text: string) => void,
        gridStage: number
    ) => {
        return (
            <button
                key={`button_${index}`}
                className={(refText === text ? "bg-slate-300 border-black" : "bg-white border-slate-300") + " flex items-center p-4 border rounded-3xl hover:bg-slate-300 w-full h-full"}
                onClick={() => handleTextClick(setRefText, text, gridStage)}
            >
                <p className="w-full">{text}</p>
            </button>
        );
    };

    const grid = (
        items: string[],
        comparisonValue: string,
        setComparisonValue: (text: string) => void,
        gridStage: number
    ) => {
        return (
            <div key={`grid_${gridStage}`} className="grid grid-cols-3 auto-rows-fr gap-2 justify-items-center items-center w-full">
                {items.map((item, index) => {
                    return (
                        themeButton(comparisonValue, item, index, setComparisonValue, gridStage)
                    );
                })}
            </div>
        );
    };

    const navButtons = () => {
        return (
            <div
                ref={buttonRef}
                className="flex flex-row self-end"
            >
                {selectionStage >= 2 && <button disabled={!selectedTheme} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={handleSubmitTask}>
                    Confirm Character
                </button>}
            </div>
        );
    };

    const loadingSpinner = (loadingText: string) => 
        <div key={`spinner_${loadingText}`} className="flex flex-row gap-2 bg-white px-6 py-3 rounded-3xl border border-slate-300 max-w-sm m-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {loadingText}
        </div>

    const [textInput, setTextInput] = useState<string>("");
    const [customLoading, setCustomLoading] = useState<boolean>(false);
    const [customThemes, setCustomThemes] = useState<string[]>([]);

    const generateFromTextInput = () => {
        setCustomLoading(true);
        apiGenerateCharacters(context?.token, textInput)
            .then(async (response) => {
                const data = await response.json();
                setCustomThemes(data.characters);
                setCustomLoading(false);
            })
            .catch((error) => {
                logError("generateFromTextInput: " + error.toString());
            });
    };

    const textInputBox = () => {
        return (
            <div className="flex flex-col gap-2 p-4 rounded-3xl overflow-clip border-slate-300 border bg-white">
                <p className="font-semibold">Enter a character name or description</p>
                <p>Input your own character or a description of them to get character examples generated for you</p>
                <div className="flex gap-4">
                    <TextField
                        label="Character name or description"
                        variant="standard"
                        value={textInput}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setTextInput(event.target.value);
                        }}
                        className="grow"
                    />
                    <button disabled={!textInput || customLoading} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={generateFromTextInput}>
                        Generate
                    </button>
                </div>
            </div>
        );
    }

    const textInputComponents = () => {
        return (
            <div className="flex flex-col gap-2">
                { textInputBox() }
                { customLoading ? loadingSpinner("Generating Characters") : grid(customThemes, selectedTheme, setSelectedTheme, 2)}
                { customThemes.length > 0 && <div className="flex flex-row self-end">
                    <button disabled={!selectedTheme} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={handleSubmitTask}>
                        Confirm Character
                    </button>
                </div>}
            </div>
        );
    }

    const scrollToBottom = () => {
        buttonRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    
    useEffect(() => {
        scrollToBottom()
    }, [themes, subCategories, categories]);

    const handleTextClick = (setValue: (text: string) => void, value: string, gridStage: number) => {
        setValue(value);
        setSelectedAccordionKeys(new Set([`stage_${Math.min(gridStage + 1, 2)}`]));

        switch (gridStage) {
            case 0:
                // Reset sub category and theme
                setSelectionStage(1);
                setSelectedTheme("");
                setSelectedSubCategory("");
                setThemes([]);
                setSubCategories([]);
                confirmCategory(value);
                break;
            case 1:
                // Reset theme
                setSelectionStage(2);
                setSelectedTheme("");
                setThemes([]);
                confirmSubCategory(value);
                break;
            case 2:
            default:
                break;
        }
    };

    return (
        <div className="flex flex-col py-12 max-w-2xl m-auto">
            <Accordion defaultExpandedKeys={["main_1", "main_2"]}>
                <AccordionItem key="main_1" title="Already know a character and story that you would like to use for this course?">
                    {textInputComponents()}
                </AccordionItem>
                <AccordionItem key="main_2" title="Need some suggestions?">
                    <div className="flex flex-col gap-2">
                        <Accordion
                            selectionMode="multiple"
                            selectedKeys={selectedAccordionKeys}
                            onSelectionChange={setSelectedAccordionKeys}
                        >
                            {[...Array(selectionStage + 1)].map((_e, stage) => {
                                const [headerText, subHeaderText] = headers(stage);
                                return(
                                    <AccordionItem key={`stage_${stage}`} title={headerText} subtitle={subHeaderText}>
                                        <div className="flex flex-col gap-2">
                                        {!loading || selectionStage != stage ?
                                            <>
                                                {grid(
                                                    stage === 2 ? themes : stage === 1 ? subCategories : categories,
                                                    stage === 2 ? selectedTheme : stage === 1 ? selectedSubCategory : selectedCategory,
                                                    stage === 2 ? setSelectedTheme : stage === 1 ? setSelectedSubCategory : setSelectedCategory,
                                                    stage
                                                )}
                                                { stage === 2 && navButtons()}
                                            </>
                                        :
                                            loadingSpinner(
                                                stage === 2 ? "Generating Characters" : stage === 1 ? "Generating Sub Categories" : "Generating Categories"
                                            )
                                        }
                                        </div>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </div>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
