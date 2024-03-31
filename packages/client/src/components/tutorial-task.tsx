import { useContext, useState } from "react";

import { apiUserSubmitTask, logError } from "../api/api";
import { AuthContext } from "../context";

interface IWatchVideoTaskProps {
    id: string;
    description: string;
    content: string;

    onCompletion: () => void;
}

export const ReadTutorialTask = (props: IWatchVideoTaskProps) => {
    const { context } = useContext(AuthContext);
    const [startedAt, setStartedAt] = useState(new Date());

    const handleSubmitTask = () => {
        apiUserSubmitTask(context?.token, props.id, {}, new Date(), startedAt)
            .then(async (response) => {
                const data = await response.json();
                props.onCompletion();
            })
            .catch((error: any) => {
                logError(error.toString());
            });
    };

    return (
        <div className="flex flex-col gap-4 p-4 mt-4 mx-auto rounded-3xl border-slate-300 border bg-white max-w-4xl">
            <p className="text-lg font-semibold">{props.description}</p>
            <p>{props.content}</p>
            <button className="bg-sky-200 self-end disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 py-2 px-4 rounded-full" onClick={handleSubmitTask}>
                Complete Task
            </button>
        </div>
    );
};
