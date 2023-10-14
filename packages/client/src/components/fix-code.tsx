import * as monaco from "monaco-editor";
import React, { Fragment, useEffect, useRef } from "react";

import { getIconSVG } from "../utils/icons";
import { highlightCode } from "../utils/highlight";
// import { ResponseFeedback } from "../response-feedback";
import { HoverableFixedCode } from "./hoverable-fixed-code";

interface feedbackProps {
    lines?: Array<{
        code: string;
        explanation: string;
    }>;
    explanation?: string;
}

export const FixCodeResponse = (props: feedbackProps) => {
    const codeEl = useRef(null);

    useEffect(() => {
        if (codeEl.current) {
            monaco.editor.colorizeElement(codeEl.current as HTMLElement, {
                theme: "dark",
                mimeType: "c",
                tabSize: 4,
            });
        }
    }, [codeEl]);

    return (
        <div className="response-main-container">
            <div className="response-header">
                <Fragment>
                    <b>Help Fix Code:</b>
                </Fragment>
            </div>

            <div className="response-main-content">
                <div>
                    <div className="response-main-answer">
                        {props.explanation && (
                            <span>
                                <b>Fixes:</b>{" "}
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: highlightCode(
                                            props.explanation,
                                            "inline-code-subtle"
                                        ),
                                    }}
                                ></span>
                            </span>
                        )}
                    </div>

                    {props.lines && (
                        <div className="hoverable-code-container">
                            <div className="hoverable-code-header">
                                {getIconSVG(
                                    "cursor-arrow-rays",
                                    "response-header-icon"
                                )}
                                <b>
                                    Hover over red lines to see how to fix them
                                </b>
                            </div>

                            <div className="hoverable-code-content">
                                {props.lines?.map((line, index) => {
                                    return (
                                        <HoverableFixedCode
                                            code={line.code}
                                            explanation={line.explanation}
                                            key={
                                                JSON.stringify(line) +
                                                index.toString()
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* {streamFinished && (
                    <ResponseFeedback
                        admin={props.admin}
                        priorData={meta.feedback}
                        responseId={meta.id}
                        onSubmitFeedback={props.onSubmitFeedback}
                    />
                )} */}
            </div>
        </div>
    );
};
