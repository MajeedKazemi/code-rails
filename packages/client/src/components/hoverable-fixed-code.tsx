import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

import { highlightCode } from "../utils/highlight";

interface IProps {
    code: string;
    explanation: string | null;
}

export const HoverableFixedCode = (props: IProps) => {
    const [hovering, setHovering] = useState(false);
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
        <div
            className="hoverable-code-line-container"
            onMouseEnter={() => {
                setHovering(true);
            }}
            onMouseLeave={() => {
                setHovering(false);
            }}
        >
            <span
                className={
                    (props.explanation
                        ? "hoverable-fixed-code"
                        : "hoverable-code") +
                    (hovering && props.explanation
                        ? " hoverable-code-hovering"
                        : "")
                }
                ref={codeEl}
            >
                {props.code}
            </span>
            {hovering && props.explanation && (
                <div
                    className="hoverable-code-line-explanation"
                    onMouseEnter={() => {
                        setHovering(true);
                    }}
                    onMouseLeave={() => {
                        setHovering(false);
                    }}
                    dangerouslySetInnerHTML={{
                        __html: highlightCode(
                            props.explanation,
                            "exp-inline-code"
                        ),
                    }}
                ></div>
            )}
        </div>
    );
};
