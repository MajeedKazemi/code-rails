import { useContext, useEffect, useState } from "react";

import { apiGenerateFeedback, apiGetTask, apiGetTestsTasks } from "../api/api";
import { Layout } from "../components/layout";
import { AuthContext } from "../context";
import { Feedback } from "../components/feedback";

interface completedTest {
    feedback: {code: string, explanation: string, status: string}[],
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

    const runTest = async (testCase: any, feedbackLevel: number) => {
        const resp = await apiGetTask(context?.token, testCase.taskId)
        const task = (await resp.json()).task
        const feedback = await generateFeedback(task, testCase.studentCode, testCase.isCorrect, feedbackLevel)
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

        for (const testCase of testCases.slice(0, 3)) {
            console.log(`Testing Case: ${testCase.taskId}`)
            runTest(testCase, feedbackLevel);
        }
        console.log("Tests Completed")
    };

    return (
        <Layout>
            <div className="p-2 flex gap-2">
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {console.log(completedTests)}}>Log Completed Tests</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(1)}}>Run Level 1</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(2)}}>Run Level 2</button>
                <button className="p-2 bg-violet-600 rounded-lg text-white" onClick={() => {performTests(3)}}>Run Level 3</button>
                <div className="p-2 bg-violet-600 rounded-lg text-white">{completedTests.length}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
                {completedTests.map((test, index) => {
                    return(
                        <div key={index} className="bg-white p-2 shadow border-black rounded-xl">
                            <p className="font-bold">Task Description:</p>
                            <p>{test.taskDescription}</p>
                            <Feedback
                                feedback={test.feedback}
                                iteration={test.iteration}
                            />
                        </div>
                    );
                })}
            </div>
        </Layout>
    );
};
