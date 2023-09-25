import * as monaco from "monaco-editor";
import { useContext } from "react";
import { apiGenerateFeedback } from "../api/api";

import { AuthContext } from "../context";

interface FeedbackProps {
    editor: monaco.editor.IStandaloneCodeEditor | null;
    taskDescription: string;
    solution: string;
    samples: Array<Array<string>>;
}

export const Feedback = (props: FeedbackProps) => {
    const { context } = useContext(AuthContext);

    const generateFeedback = async () => {
        try {
            console.log("Generating Feedback")
            await apiGenerateFeedback(
                context?.token,
                props.taskDescription,
                "", // Current User Code
                props.solution,
                props.samples
            ).then(async (resp) => {
                await resp.json().then((feedback) => {
                    // console.log(feedback.feedback);
                    document.querySelector("#feedback-text")!.innerHTML = feedback.feedback;
                });
            });
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="max-h-96 overflow-scroll">
            <p>Feedback:</p>
            <p id="feedback-text">
                <p className="flex flex-row gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Generating Feedback...
                </p>
            </p>
            
            <button onClick={() => {
                    generateFeedback();
                }}>Generate Feedback</button>
        </div>
    );
};

