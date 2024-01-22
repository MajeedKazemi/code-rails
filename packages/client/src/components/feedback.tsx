import Tooltip from '@mui/material/Tooltip';

interface FeedbackProps {
    feedback: any;
    iteration: number;
}

export const Feedback = (props: FeedbackProps) => {
    const highlightCode = (response: string) => {
        const inlineCodeRegex = /`([^`]+)`/g;
        return response.replace(inlineCodeRegex, "<code class='bg-gray-800 rounded-lg px-1 py-0.5'>$1</code>");
    }

    const Header = () => {
        const headingClasses = "rounded-t-xl bg-indigo-600 text-white p-2 flex gap-1";
        if (props.iteration > 2) {
            return(
                <div className={headingClasses}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                    </svg>
                    <p>Hover over <span className="text-red-500 whitespace-normal">red</span> lines in the fixed code to see suggestions</p>
                </div>
            )
        } else if (props.iteration > 1) {
            return(
                <div className={headingClasses}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                    </svg>
                    <p>Hover over <span className="text-red-500">red</span> lines in your code to see suggestions</p>
                </div>
            )
        } else {
            return(
                <div className={headingClasses + " flex-col"}>
                    <div className='flex gap-1'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                        Feedback: 
                    </div>
                    <div>
                        Try fixing your code based on the following suggestions
                    </div>
                </div>
            )
        }
    };

    const Body = () => {
        const bodyClasses = "text-white p-2 max-h-96 overflow-y-auto whitespace-pre-wrap";
        if (props.feedback.type === "text") {
            return(
                <ul className={bodyClasses + " pl-6 list-disc divide-y divide-indigo-900"}>
                    {props.feedback.lines.map((line: any, index: number) => {
                        let color;
                        let key_word;
                        switch (line.type) {
                            case "add":
                                color = "marker:text-green-500"
                                key_word = "Missing"
                                break;
                            case "remove":
                                color = "marker:text-red-500"
                                key_word = "Incorrect"
                                break;
                            default:
                                color = "marker:text-orange-500"
                                key_word = "Fix"
                        }
                        return(
                            <li className={color} key={`line_${index}`}>
                                {key_word + ": "}
                                <span dangerouslySetInnerHTML={{ __html: highlightCode(line.explanation) }} />
                            </li>
                        )
                    })}
                </ul>
            )
        } else {
            return(
                <div className={bodyClasses + " divide-y divide-indigo-900"}>
                    {props.feedback.lines.map((line: any, index: number) => {
                        return(
                            <div key={`feedback_line_${index}`}>
                                <Tooltip classes={{ popper: "whitespace-pre-wrap" }} title={line.explanation.join("\n")} placement="right" arrow>
                                    <div className={`min-h-[1.5rem] ${line.explanation.length > 0 ? "bg-red-500" : ""}`}>
                                        {line.code}
                                    </div>
                                </Tooltip>
                            </div>
                        )
                    })}
                </div>
            )
        }
    };

    if (props.feedback.type) {
        return(
            <div className="border rounded-xl bg-indigo-900">
                <Header />
                {Body()}
            </div>
        )
    } else {
        return(
            <div className="border rounded-xl">
                <div className="max-h-96 m-4">
                    <p><strong>Feedback:</strong></p>
                    <div id="feedback-text">
                        <p className="flex flex-row gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="animate-spin w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Generating Feedback...
                        </p>
                    </div>
                </div>
            </div>
        )
    }
};
