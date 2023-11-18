import { useContext, useEffect, useState } from "react";

import { apiGenerateFeedback, apiGetCorrectness, apiGetTask, apiGetTestsTasks } from "../api/api";
import { Layout } from "../components/layout";
import { AuthContext } from "../context";
import { Feedback } from "../components/feedback";

interface completedTest {
    feedback: any,
    iteration: number,
    taskDescription: string,
    isCorrect: boolean,
    userCode: string
}

export const BenchmarkPage = () => {
    const { context } = useContext(AuthContext);
    const [completedTests, setCompletedTests] = useState<completedTest[]>([]);

    const generateFeedback = async (task: any, userCode: string, correctness: boolean, feedbackLevel: number) => {
        try {
            const resp = await apiGenerateFeedback(
                context?.token,
                task.description,
                userCode,
                task.solution,
                task.output,
                correctness,
                feedbackLevel
            )
            const feedback = await resp.json()
            return feedback.feedback
        } catch (e) {
            console.log(e);
        }
    };

    const getCorrectness = async (task: any, testCase: any): Promise<boolean> => {
        try {
            console.log("Determining Correctness")
            const resp = await apiGetCorrectness(
                context?.token,
                task.description,
                testCase.studentCode,
                task.solution,
                task.output
            )
            const correctness = await resp.json();
            return correctness;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    const runTest = async (testCase: any, feedbackLevel: number) => {
        const resp = await apiGetTask(context?.token, testCase.taskId)
        const task = (await resp.json()).task
        const feedback = feedbackLevel ? 
            await generateFeedback(task, testCase.studentCode, testCase.isCorrect, feedbackLevel) 
        : 
            await getCorrectness(task, testCase)

        setCompletedTests(completedTests => ([
            ...completedTests,
            { 
                feedback: feedback,
                iteration: feedbackLevel,
                taskDescription: task.description,
                isCorrect: testCase.isCorrect,
                userCode: testCase.studentCode
            },
        ]));
    }

    const performTests = async (feedbackLevel: number) => {
        console.log("Performing Tests...")
        const resp = await apiGetTestsTasks(context?.token)
        const testCases = (await resp.json()).testcases

        for (const testCase of testCases.slice(0, 1)) {
            console.log(`Testing Case: ${testCase.taskId}`)
            runTest(testCase, feedbackLevel);
        }
    };

    return (
        <Layout>
            <div className="p-2 flex gap-2">
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {console.log(completedTests)}}>Log Completed Tests</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(0)}}>Run Correctness</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(1)}}>Run Level 1</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(2)}}>Run Level 2</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(3)}}>Run Level 3</button>
                <div className="p-2 bg-violet-600 rounded-lg text-white">{completedTests.length}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
                {completedTests.map((test, index) => {
                    return(
                        <div key={index} className="flex flex-col gap-2 bg-white p-2 shadow border-black rounded-xl">
                            <p className="font-bold">Task Description:</p>
                            <p>{test.taskDescription}</p>
                            <div className="border rounded-xl max-h-96 overflow-y-auto whitespace-pre-wrap">
                                <div className="bg-slate-100 p-2">
                                    User Code:
                                </div>
                                <div className="p-2">
                                    {test.userCode}
                                </div>
                            </div>
                            {test.iteration ? 
                                <Feedback
                                    feedback={test.feedback}
                                    iteration={test.iteration}
                                />
                            :
                                <div className="flex flex-col gap-2 m-2">
                                    <div className="p-2 bg-violet-600 rounded-lg text-white">True Correctness: <span className={test.isCorrect ? "text-green-500" : "text-red-500"}>{`${test.isCorrect}`}</span></div>
                                    <div className="p-2 bg-violet-600 rounded-lg text-white">Generated Correctness: <span className={test.feedback.correct ? "text-green-500" : "text-red-500"}>{`${test.feedback.correct}`}</span></div>
                                </div>
                            }
                        </div>
                    );
                })}
            </div>
        </Layout>
    );
};
