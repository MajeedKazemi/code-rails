interface Props {
    theme: string;
    selected: boolean;
    setTheme: (theme: string) => void;
}

export const TitleChip = ({ theme, selected, setTheme }: Props) => {
    return(
        <div
            className={"flex items-center relative justify-center text-center w-24 aspect-square border-1.5 rounded-full " + (selected ? "bg-slate-300 border-green-600 cursor-not-allowed" : "bg-white border-black cursor-pointer hover:bg-slate-300")}
            onClick={() => setTheme(theme)}
        >
            <p className="text-black font-semibold">
                {theme.length > 15 ? theme.substring(0, 15) + "..." : theme}
            </p>
            <div 
                className="absolute cursor-pointer top-0 right-0"
                onClick={() => console.log(`Edit ${theme} theme`)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </div>
        </div>
    );
};
