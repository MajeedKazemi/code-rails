import { Client, Dataset } from "langsmith";
import { titleGenerationPrompt } from "../server/prompts/title-generation-prompt";
import { taskCustomizationPrompt } from "../server/prompts/task-customization-prompt";
import OpenAI from "openai";
import { tqdm } from "ts-tqdm";

const openai = new OpenAI();

const main = async () => {
    // Data Inputs 
    const storyTitles: {
        character:String,
        storyTitle: String
    }[] = [];
    const storyTitlesInputs: {
        storyTitle: String,
        taskDescription: String,
        character: String
    }[] = [];

    // Character Names for Generating Story Titles
    const characterInputs = ["Mario", "Zeus", "Barbie", "Katniss Everdeen"];
    const generatedStories: {generatedTaskStory: String}[] = [];

    const taskDescription = "Write a function that take in an integer n and returns the first n terms of the fibonacci sequence.";

    // Generate Story Titles
    for (const character of tqdm(characterInputs)) {
        const prompt = titleGenerationPrompt(
            character,
            taskDescription,
            ""
        );

        const rawTitles = await openai.chat.completions.create({
            messages: prompt.messages,
            model: prompt.model,
            temperature: prompt.temperature,
            stop: prompt.stop
        });

        if (rawTitles.choices[0].message.content === null) {
            console.log("Title Generation Failed...");
            return;
        }

        const titles = prompt.parser(rawTitles.choices[0].message.content);

        titles.forEach(title => {
            storyTitles.push({ character, storyTitle: title });
        });
    }

    // Generate Stories
    for (const title of tqdm(storyTitles)) {
        const prompt = taskCustomizationPrompt(
            title.character,
            taskDescription,
            title.storyTitle
        );

        const rawStories = await openai.chat.completions.create({
            messages: prompt.messages,
            model: prompt.model,
            temperature: prompt.temperature,
            stop: prompt.stop
        });

        if (rawStories.choices[0].message.content === null) {
            console.log("Story Generation Failed...");
            return;
        }

        const story = prompt.parser(rawStories.choices[0].message.content);

        generatedStories.push({ generatedTaskStory: `${story.set_up}\n${story.conflict}` });
    }

    console.log("storyTitles", storyTitles);
    console.log("generatedStories", generatedStories);

    // const client = new Client();
    // const datasetName = "Code Rails - Story Titles and Generated Stories";

    // let dataset: Dataset;
    // try {
    //     dataset = await client.createDataset(datasetName);
    // } catch (e) {
    //     dataset = await client.readDataset({datasetName});
    // }

    // await client.createExamples({
    //     inputs: storyTitlesInputs,
    //     outputs: generatedStories,
    //     datasetId: dataset.id,
    // });
};

main();
