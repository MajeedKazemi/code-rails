import { ChatOpenAI } from "@langchain/openai";
import { Client } from "langsmith";

import { EvaluatorInputFormatter, RunEvalConfig, runOnDataset } from "langchain/smith";
import { Run, Example } from "langsmith";
import { EvaluationResult } from "langsmith/evaluation";


const main = async () => {
    // Inputs are provided to your model, so it know what to generate
    const datasetInputs = [
        {question: "a rap battle between Atticus Finch and Cicero"},
        {question: "a rap battle between Barbie and Oppenheimer"},
        // ... add more as desired
    ];

    // Outputs are provided to the evaluator, so it knows what to compare to
    // Outputs are optional but recommended.
    const datasetOutputs = [
        { must_mention: ["lawyer", "justice"] },
        { must_mention: ["plastic", "nuclear"] },
    ];
    const client = new Client();
    const datasetName = "Rap Battle Dataset - 2";

    // Storing inputs in a dataset lets us
    // run chains and LLMs over a shared set of examples.
    const dataset = await client.createDataset(datasetName, {
    description: "Rap battle prompts.",
    });
    await client.createExamples({
        inputs: datasetInputs,
        outputs: datasetOutputs,
        datasetId: dataset.id,
    });

    const llm = new ChatOpenAI({modelName: "gpt-3.5-turbo", temperature: 0});


    const formatEvaluatorInputs: EvaluatorInputFormatter = function ({
        rawInput, // dataset inputs
        rawPrediction, // model outputs
        rawReferenceOutput, // dataset outputs
    }) {
        return {
            input: rawInput.input,
            prediction: rawPrediction?.output,
            reference: `Must mention: ${rawReferenceOutput?.must_mention ?? [].join(", ")}`,
        };
    };

    const evalConfig: RunEvalConfig = {
        // Custom evaluators can be user-defined RunEvaluator's
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
                {
                evaluatorType: "criteria",
                criteria: {
                    cliche: "Are the lyrics cliche?"
                },
                feedbackKey: "is_cliche",
                formatEvaluatorInputs
            },
        ],
    };

    await runOnDataset(llm, datasetName, {
        evaluationConfig: evalConfig,
        // You can manually specify a project name
        // or let the system generate one for you
        projectName: "chatopenai-test-2",
        projectMetadata: {
            // Experiment metadata can be specified here
            version: "1.0.0",
        },
    });
}

main();
