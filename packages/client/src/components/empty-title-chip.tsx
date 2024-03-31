interface Props {
    index: number;
    addTitle: (index: number) => void;
}

export const EmptyTitleChip = ({ index, addTitle }: Props) => {
    return(
        <div
            className="flex items-center justify-center text-center w-24 aspect-square border-1.5 rounded-full bg-white border-black cursor-pointer hover:bg-slate-300"
            onClick={() => addTitle(index)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </div>
    );
};
