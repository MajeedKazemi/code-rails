interface Props {
    theme: string;
    selected: boolean;
    setTheme: (theme: string) => void;
}

export const TitleChip = ({ theme, selected, setTheme }: Props) => {
    return(
        <div
            className={"flex items-center justify-center text-center w-24 aspect-square border-1.5 rounded-full " + (selected ? "bg-slate-300 border-green-600 cursor-not-allowed" : "bg-white border-black cursor-pointer hover:bg-slate-300")}
            onClick={() => setTheme(theme)}
        >
            <p className="text-black font-semibold">
                {theme.length > 15 ? theme.substring(0, 15) + "..." : theme}
            </p>
        </div>
    );
};
