import { useEffect, useState } from "react";
import { TitleButton } from "./title-button";
import { TitleChip } from "./title-chip";

interface Props {
    titles: string[];
    title: string;
    setTitle: (title: string) => void;
    confirmTitle: () => void;
    generateTitles: () => void;
    setTheme: (themes: string) => void;
    theme: string;
}

export const TitleSelection = (props: Props) => {
    const [generating, setGenerating] = useState(false);
    const [themes, setThemes] = useState<string[]>([]);

    useEffect(() => {
        setGenerating(false)
    }, [props.titles])

    useEffect(() => {
        const themes = ["Barbie", "Mario", "Indiana Jones"];
        props.setTheme(themes[0]);
        setThemes(themes);
    }, []);

    return(
        <>
            <div className="absolute inset-y-0 right-0 m-2">
                <div className="flex flex-col h-full w-full justify-center gap-2">
                    {themes.map((theme: string, index: number) => {
                        return(
                            <TitleChip
                                key={`theme_chip_${index}`}
                                theme={theme}
                                selected={props.theme === theme}
                                setTheme={props.setTheme}
                            />
                        )
                    
                    })}
                </div>
            </div>
            <div className="flex flex-col gap-2 w-[400px] h-full items-center justify-center m-auto">
                {props.titles.length > 0 ?
                    <>
                        <div className="w-full font-semibold">
                            {/* <p>
                                You have{" "}
                                <span className="remaining-time">
                                    {convertTime(props.timeLimit)} minutes
                                </span>{" "}
                                to finish this task.
                            </p> */}
                            <p>Please pick one of the following titles:</p>
                        </div>
                        {props.titles.map((title: string, index: number) => {
                            return(
                                <TitleButton
                                    key={`title_button_${index}`}
                                    text={title}
                                    title={props.title}
                                    setTitle={props.setTitle}
                                />
                            )
                        })}

                        <div className="flex gap-2 self-end">
                            <button 
                                className=""
                                onClick={() => {
                                    setGenerating(true);
                                    props.generateTitles();
                                }}
                            >
                                {generating ?
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                :
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                }
                            </button>
                            <button disabled={!props.title} className="bg-sky-200 disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 enabled:hover:text-white py-2 px-4 rounded-full" onClick={() => props.confirmTitle()}>
                                Confirm Title
                            </button>
                        </div>
                    </>
                :
                    <div className="flex flex-row gap-2 bg-white px-6 py-3 rounded-3xl border border-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Generating Titles
                    </div>
                }
            </div>
        </>
    );
};
