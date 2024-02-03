
interface Props {
    text: string;
    title: string;
    setTitle: (title: string) => void;
}

export const TitleButton = (props: Props) => {
    return(
        <button 
            onClick={() => props.setTitle(props.text)}
            className={"w-full text-left px-6 py-3 rounded-3xl border border-slate-300" + (props.title === props.text ? " bg-slate-300" : " bg-white")}
        >
            {props.text}
        </button>
    );
};
