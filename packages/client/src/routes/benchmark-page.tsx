import React, { useContext, useEffect } from "react";

import { apiGenerateFeedback, apiGetTask, apiGetTestsTasks } from "../api/api";
import { Layout } from "../components/layout";
import { AuthContext } from "../context";
import { Feedback } from "../components/feedback";

interface completedTest {
    feedback: string,
    iteration: number,
    taskDescription: string,
    isCorrect: boolean,
    userCode: string
}

export const BenchmarkPage = () => {
    const { context } = useContext(AuthContext);
    const [completedTests, setCompletedTests] = React.useState<completedTest[]>([]);

    const generateFeedback = async (task: any, userCode: string, correctness: boolean) => {
        try {
            const resp = await apiGenerateFeedback(
                context?.token,
                task.description,
                userCode,
                task.solution,
                task.output,
                correctness,
                2
            )
            const feedback = await resp.json()
            return feedback.feedback
        } catch (e) {
            console.log(e);
        }
    };

    const performTests = async () => {
        const resp = await apiGetTestsTasks(context?.token)
        const testCases = (await resp.json()).testcases

        for (const testCase of testCases.splice(0, 3)) {
            console.log(testCase)
            console.log(`Testing Case: ${testCase.taskId}`)
            const resp = await apiGetTask(context?.token, testCase.taskId)
            const task = (await resp.json()).task
            const feedback = await generateFeedback(task, testCase.studentCode, testCase.isCorrect)
            setCompletedTests(
                [
                    ...completedTests,
                    { 
                        feedback: feedback,
                        iteration: 2,
                        taskDescription: task.description,
                        isCorrect: testCase.isCorrect,
                        userCode: testCase.studentCode
                    }
                ]
            );
        }
    };

    useEffect(() => {
        console.log("Effect Triggered")
        performTests();
        // console.log('test')
    }, []);


    return (
        <Layout>
            <div>{completedTests.length}</div>
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
