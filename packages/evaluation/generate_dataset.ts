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
        storyTitle: String,
        taskDescription: String
    }[] = [];
    const storyTitlesInputs: {
        storyTitle: String,
        taskDescription: String,
        character: String
    }[] = [];

    // Character Names for Generating Story Titles
    const characterInputs = ["Mario", "Zeus", "Barbie", "Katniss Everdeen"];
    const generatedStories: {
        generatedTaskStory: String,
        character: String,
        storyTitle: String,
        taskDescription: String
    }[] = [];

    const taskDescriptions = [
        "Write a program that will display the message 'Hello, World!'",
        "Write a program that creates a variable called <i>name</i> and sets its value to <b>ro</b>. Then, update the <i>name</i> variable by adding the value <b>bot</b> to it's previous value. Finally, display the message <b>Created: <i>name</i></b>.",
        "Write a program that sets <i>num1</i> to 20, and<i>num2</i> to 5. Then set another variable called <i>add</i> to the addition of num1 and num2, <i>sub</i> to their subtraction, <i>mult</i> to their multiplication, and <i>div</i> to their division. Finally, display each of the <i>add</i>, <i>sub</i>, <i>mult</i> and <i>div</i> variables.",
        "Write a program that generates a random number between 1 and 10 and sets it to a variable called <i>num</i>. Then, display the value of <i>num</i>."
    ];

    // Generate Story Titles
    for (const character of tqdm(characterInputs)) {
        for (const taskDescription of tqdm(taskDescriptions)) {
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

            const titles = prompt.parser(rawTitles.choices[0].message.content)
                                 .slice(1, 3);

            titles.forEach(title => {
                storyTitles.push({
                    character,
                    storyTitle: title,
                    taskDescription
                });
            });
        }
    }

    // Generate Stories
    for (const title of tqdm(storyTitles)) {
        const prompt = taskCustomizationPrompt(
            title.character,
            title.taskDescription,
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

        generatedStories.push({
            generatedTaskStory: `${story.set_up}\n${story.conflict}`,
            character: title.character,
            storyTitle: title.storyTitle,
            taskDescription: title.taskDescription
        });
    }

    const client = new Client();
    const datasetName = "Code Rails - Story Titles and Generated Stories";

    let dataset: Dataset;
    try {
        dataset = await client.createDataset(datasetName);
    } catch (e) {
        dataset = await client.readDataset({datasetName});
    }

    await client.createExamples({
        inputs: storyTitlesInputs,
        outputs: generatedStories,
        datasetId: dataset.id,
    });
};

main();
