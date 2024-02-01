
interface Props {
    title: string;
}

export const TitleButton = (props: Props) => {
    return(
        <div className="w-full bg-white px-6 py-3 rounded-3xl border border-slate-300">
            {props.title}
        </div>
    );
};
