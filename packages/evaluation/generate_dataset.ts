import { Client } from "langsmith";

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
    const datasetName = "Rap Battle Dataset";

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
};

main();
