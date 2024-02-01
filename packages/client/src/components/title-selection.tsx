import { TitleButton } from "./title-button";

interface Props {
    titles: string[];
    title: string;
    setTitle: (title: string) => void;
    confirmTitle: (title: string) => void;
}

export const TitleSelection = (props: Props) => {
    return(
        <div className="flex flex-col gap-2 w-[400px] h-full items-center justify-center m-auto">
            <div className="w-full bg-slate-100 px-6 py-2 rounded-3xl border border-slate-300">
                {/* <p>
                    You have{" "}
                    <span className="remaining-time">
                        {convertTime(props.timeLimit)} minutes
                    </span>{" "}
                    to finish this task.
                </p> */}
                <p>Please pick one of the following titles:</p>
            </div>
            
            {props.titles.length > 0 ?
                <>
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

                    <button className="bg-sky-200 hover:bg-sky-100 hover:text-white py-2 px-4 rounded-full self-end" onClick={() => props.confirmTitle("")}>
                        Confirm Title
                    </button>
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
    );
};
