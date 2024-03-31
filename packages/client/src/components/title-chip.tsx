interface Props {
    title: string;
}

export const TitleChip = ({ title }: Props) => {
    return(
        <div className="flex items-center justify-center text-center w-24 aspect-square border-1.5 border-black rounded-full">
            <p className="text-black font-semibold">
                {title.length > 15 ? title.substring(0, 15) + "..." : title}
            </p>
        </div>
    );
};
