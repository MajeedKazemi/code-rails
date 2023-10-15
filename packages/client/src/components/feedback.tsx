import { Tooltip } from "react-tooltip";

interface FeedbackProps {
    feedback: any;
}

export const Feedback = (props: FeedbackProps) => {
    if (props.feedback.explanation) {
        return(
            // <div className="border rounded-xl max-h-96 overflow-y-auto p-4">
            <div className="border rounded-xl bg-indigo-900">
                <div className="rounded-t-xl bg-indigo-600 text-white p-2 flex gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                    </svg>
                    Hover over <p className="text-red-500">red</p> lines to see suggestions
                </div>
                <div className="p-2 font-mono max-h-96 overflow-y-auto whitespace-pre-wrap divide-y divide-indigo-900">
                    {props.feedback.lines.map((line: any, index: number) => {
                        return(
                            <div>
                                <div id={`line_${index}`} className={`text-white min-h-[1.5rem] ${line.explanation ? "bg-red-500" : ""}`}>
                                    {line.code}
                                </div>
                                <Tooltip className="z-40 bg-red-300 text-red-500" anchorSelect={`#line_${index}`} place="right">
                                    {line.explanation}
                                </Tooltip>
                            </div>
                        )
                    })}
                </div>
            </div>
                /* <div>
                    {props.feedback.explanation}
                </div> */
            // </div>
        )
    } else {
        return(
            <div className="border rounded-xl">
                <div className="max-h-96 m-4">
                    <p><strong>Feedback:</strong></p>
                    <p id="feedback-text">
                        <p className="flex flex-row gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Generating Feedback...
                        </p>
                    </p>
                </div>
            </div>
        )
    }
};
