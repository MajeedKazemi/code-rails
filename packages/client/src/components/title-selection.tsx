import { TitleButton } from "./title-button";

interface Props {
    titles: string[];
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
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
        </div>
    );
};
