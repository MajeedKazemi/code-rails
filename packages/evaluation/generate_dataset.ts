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

    // Character Names for Generating Story Titles
    const characterInputs = ["Mario", "Zeus", "Barbie", "Katniss Everdeen"];
    const generatedStories: {
        generatedTaskStory: String,
    }[] = [];

    const taskDescriptions = [
        "Write a program that will display the message 'Hello, World!'",
        "Write a program that creates a variable called name and sets its value to ro. Then, update the name variable by adding the value bot to its previous value. Finally, display the message Created: name",
        "Write a program that first, sets the variable num to a random number between 1 and 10. Then create another variable called message and set it to the message num is: num. Then, display the value of message",
        "Write a program that asks the user for two numbers and then displays the sum of them",
        "Write a program that first, generates a random number between 1 and 6 and assigns it to a variable called roll and then display roll. Finally, display the message rolled six only if roll is equal to six",
        "Write a program that asks the user to enter a number between 0 and 100 and set it to a variable called score. Additionally, create a variable called grade and set it to an empty text. Then check if the score is less than 50, if it is, then set grade to the letter C, if it’s between 50 and 75, set grade to B, otherwise, set grade to A. Then display the message Grade: grade",
        "Display Hello 10 times using a loop",
        "Set a variable called fruits to the text I like these fruits: . Then create a loop that would repeatedly do the following things for 5 times: first, ask the user to enter a fruit name and then adding what the user entered to the fruits (separated with a space). After the loop, display the value of the fruits variable",
        "Write a program that creates a list with the following textual values: 'math', 'history', 'programming', and 'art'. Then use a while loop and an index variable to display all of the items in the list one by one",
        "Create a list called numbers, and then use a for loop that repeats for 5 times to repeatedly ask the user to enter a number (as an integer) and add it to the list. Then use another loop to go through the items of the numbers list and find the largest number. Finally, display the value of the largest number. (Note: you can NOT use the max function.)"
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
                                 .slice(1, 2);

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
    // for (const title of tqdm(storyTitles)) {
    //     const prompt = taskCustomizationPrompt(
    //         title.character,
    //         title.taskDescription,
    //         title.storyTitle
    //     );

    //     const rawStories = await openai.chat.completions.create({
    //         messages: prompt.messages,
    //         model: prompt.model,
    //         temperature: prompt.temperature,
    //         stop: prompt.stop
    //     });

    //     if (rawStories.choices[0].message.content === null) {
    //         console.log("Story Generation Failed...");
    //         return;
    //     }

    //     const story = prompt.parser(rawStories.choices[0].message.content);

    //     generatedStories.push({
    //         generatedTaskStory: `${story.set_up}\n${story.conflict}`
    //     });
    // }

    const client = new Client();
    const datasetName = "Code Rails - Story Titles";

    let dataset: Dataset;
    try {
        dataset = await client.createDataset(datasetName);
    } catch (e) {
        dataset = await client.readDataset({datasetName});
    }

    await client.createExamples({
        inputs: storyTitles,
        // outputs: generatedStories,
        datasetId: dataset.id,
    });
};

main();
