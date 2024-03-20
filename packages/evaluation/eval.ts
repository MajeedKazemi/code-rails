import { ChatOpenAI } from "@langchain/openai";
import { EvaluatorInputFormatter, RunEvalConfig, runOnDataset } from "langchain/smith";
import { Run, Example, Client } from "langsmith";
import { EvaluationResult } from "langsmith/evaluation";

const evalStories = async () => {
    const datasetName = "Code Rails - Story Titles and Generated Stories";

    const prompt = "Write a program that will display the message 'Hello, World!'";
    const llm = new ChatOpenAI({modelName: "gpt-4-turbo-preview", temperature: 0});

    const formatEvaluatorInputs: EvaluatorInputFormatter = function ({
        rawInput, // dataset inputs
        rawPrediction, // model outputs
        rawReferenceOutput, // dataset outputs
    }) {
        return {
            input: rawInput.input,
            prediction: rawPrediction?.output,
            reference: rawReferenceOutput.output // `Must mention: ${rawReferenceOutput?.must_mention ?? [].join(", ")}`,
        };
    };

    const evalConfig: RunEvalConfig = {
        // Prebuilt evaluators
        evaluators: [
            {
                evaluatorType: "labeled_criteria",
                criteria: "helpfulness",
                feedbackKey: "helpfulness",
                // The off-the-shelf evaluators need to know how to interpret the data
                // in the dataset and the model output.
                formatEvaluatorInputs
            },
        ],
    };

    await runOnDataset(
        llm,
        datasetName,
        {
            evaluationConfig: evalConfig,
            // You can manually specify a project name
            // or let the system generate one for you
            projectName: "ts-test-2",
            projectMetadata: {
                // Experiment metadata can be specified here
                version: "1.0.0",
            },
        }
    );
};

// check for command line arg
const arg = process.argv[2];

if (arg == "stories") {
    evalStories();
} else {
    console.log("Error! Please provide a valid command line argument.")
}
