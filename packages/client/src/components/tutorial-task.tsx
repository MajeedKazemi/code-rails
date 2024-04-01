import { useContext, useEffect, useState } from "react";

import { apiUserSubmitTask, logError } from "../api/api";
import { AuthContext } from "../context";
import { marked } from "marked";

interface tutorialProps {
    id: string;
    description: string;
    content: string;

    onCompletion: () => void;
    modal?: boolean;
}

export const ReadTutorialTask = (props: tutorialProps) => {
    const { context } = useContext(AuthContext);
    const [startedAt, setStartedAt] = useState(new Date());

    const handleSubmitTask = () => {
        if (!props.modal) {
            apiUserSubmitTask(context?.token, props.id, {}, new Date(), startedAt)
                .then(async (response) => {
                    const data = await response.json();
                    props.onCompletion();
                })
                .catch((error: any) => {
                    logError(error.toString());
                });
        } else {
            props.onCompletion();
        }
    };

    const htmlWithTailwind = async (markdown: string) => {
        const html = (await marked.parse(markdown))
            .replace(/<h2>/g, `<h2 class="text-xl font-semibold">`)
            .replace(/<code>/g, `<code class="inline-code bg-slate-600 text-white">`);
        return html
    };

    const handleContent = async () => {
        const html = await htmlWithTailwind(props.content);
        const element = document.getElementById('content')
        const element_raw = document.getElementById('content_raw')
        if (element) {
            element.innerHTML = html;
        }

        if (element_raw) {
            element_raw.textContent = html;
        }
    };

    useEffect(() => {
        handleContent();
    }, []);

    return (
        <div className={"flex flex-col gap-4 p-4 mx-auto rounded-3xl border-slate-300 border bg-white max-w-4xl" + (props.modal ? "" : " mt-4")}>
            <p className="text-2xl font-semibold">{props.description}</p>
            <div id="content">{props.content}</div>
            <button
                className="bg-sky-200 self-end disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:bg-sky-100 py-2 px-4 rounded-full"
                onClick={handleSubmitTask}
            >
                {props.modal ? "Close" : "Start Unit"}
            </button>
        </div>
    );
};
