import re
import sys

from feedback_prompts import l1_prompt
from langchain import prompts, smith
from langchain.schema import output_parser
from langchain_core.messages import AIMessage
from langchain_openai import ChatOpenAI
from langsmith import Client
from tqdm import tqdm


def extract_text_between_tags(txt, start_tag, end_tag):
    # Compile a regular expression pattern to match the desired text blocks
    pattern = re.compile(r"\[" + re.escape(start_tag) + r"\](.*?)\[" + re.escape(end_tag) + r"\]", re.DOTALL)
    matches = pattern.findall(txt)
    # Extract and process the match if it exists
    if matches:
        # Split the matched text by newline, remove the first and last elements, then join back with newline
        return "\n".join(matches[0].split("\n")[1:-1])
    return ""

def evalStories():
    prompt = prompts.ChatPromptTemplate.from_messages(
        [
            ("system", """using the given [character] and [story-title] augment the provided [python-programming-task] to include the [story-title]'s narrative.

This will be given to a k-12 student trying to learn about python programming. Just by augmenting the task description with a story using the provided [story-title] make the task more engaging for the student. The task should still implement a code that has the very similar code constructs (maybe just change the strings or numbers to fit with the new story)

The story should include the following parts:
[set-up], [conflict], and [resolution] all of which to be short/concise, easy to read and understand, and engaging for the young student.

in the [set-up] just try to provide the setup...
The [conflict] part is where you would focus on the [python-programming-task], make sure that the augmented version of the task does not have any ambiguity and could be precisely implemented to code. it should be well-specified for a programmer to write code for it, but augmented as part of the story.

for the [conflict] part, make it look like an instruction that a students needs to follow. the subject should be the student, they have to do the task correctly so that ...

and finally the resolution.

use the following format:
[set-up]:
<2-3 sentences>
[end-set-up]
[conflict]:
<one paragraph augmented task>
[end-conflict]
[resolution]:
<2-3 sentences>
[end-resolution]"""),
            ("human", """[character]: {character}
[story-title]: {storyTitle}

[python-programming-task]:
{taskDescription}"""),
        ],
    )

    def outputParser(ai_message: AIMessage):
        txt = ai_message.content
        set_up = extract_text_between_tags(txt, "set-up", "end-set-up")
        conflict = extract_text_between_tags(txt, "conflict", "end-conflict")

        return set_up + "\n" + conflict

    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    chain = prompt | llm | outputParser

    # Define the evaluators to apply
    eval_config = smith.RunEvalConfig(
        evaluators=[
            # smith.RunEvalConfig.Criteria({"coherence": "Is the submission coherent, well-structured, and organized? Note that the reader already knows that they will be writing a program."}),
            smith.RunEvalConfig.Criteria({"consistency": "Is the objective consistent between the [Input] and [Submission]? Note that task can be slightly different from that described in the [Input], but should embody the same coding knowledge requirements. ie strings can be different."}),
            smith.RunEvalConfig.Criteria({"engagement": "Is the submission engaging, interesting, and fun to read?"}),
            smith.RunEvalConfig.Criteria({"creativity": "Is this [Submission] creative, imaginative, or novel?"}),
            smith.RunEvalConfig.Criteria({"clear_objective": "Is the coding task in [Submission] easy to identify? The reader expects the task to be embedded in a story."}),
        ],
        custom_evaluators=[],
        eval_llm=ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5),
        input_key="taskDescription",
    )

    client = Client()
    client.run_on_dataset(
        dataset_name="Code Rails - Story Titles",
        evaluation=eval_config,
        llm_or_chain_factory=chain,
        project_name="eval-0",
        concurrency_level=5,
        verbose=True,
        # input_mapper=lambda x: {
        #     "character": x["input_character"],
        #     "storyTitle": x["input_storytitle"],
        #     "taskDescription": x["input_taskdescription"]
        # },
    )

def getSolutionPrompt(id):
    if id ==0:
        return prompts.ChatPromptTemplate.from_messages(
            [
                ("system", "Generate a solution to the provided [problem]. The solution should be written in Python. Only return the code with no other annotations including backticks."),
                ("human", "[problem]: {problem}"),
            ],
        )
    elif id == 1:
        return prompts.ChatPromptTemplate.from_messages(
            [
                ("system", "Generate an incorrect solution to the provided [problem]. The solution should be written in Python. Only return the code with no other annotations including backticks."),
                ("human", "[problem]: {problem}"),
            ],
        )
    elif id == 2:
        return prompts.ChatPromptTemplate.from_messages(
            [
                ("system", "Generate a mostly correct solution to the provided [problem], but ensure there are some mistakes. The solution should be written in Python. Only return the code with no other annotations including backticks."),
                ("human", "[problem]: {problem}"),
            ],
        )

def getSolutionDatasetName(id):
    if id == 0:
        return "Code Rails - Correct Solutions"
    elif id == 1:
        return "Code Rails - Incorrect Solutions"
    elif id == 2:
        return "Code Rails - Approximate Solutions"

def generateTaskSolutions(prompt_id: int = 0):
    prompt = getSolutionPrompt(prompt_id)

    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    chain = prompt | llm | output_parser.StrOutputParser()

    client = Client()
    project_name = "eval-0"
    df = client.get_test_results(project_name=project_name)

    inputs = []
    for idx, row in tqdm(df.iterrows(), total=df.shape[0]):
        solution = chain.invoke({"problem": row["outputs.output"]})
        inputs.append({
            "storyTitle": row["input.storyTitle"],
            "character": row["input.character"],
            "originalTaskDescription": row["input.taskDescription"],
            "taskDescription": row["outputs.output"],
            "solution": solution,
        })


    dataset = client.create_dataset(
        dataset_name=getSolutionDatasetName(prompt_id),
    )

    client.create_examples(
        inputs=inputs,
        dataset_id=dataset.id,
    )

def evalFeedback(prompt_id: int =1):
    prompt = l1_prompt()

    def outputParser(ai_message: AIMessage):
        txt = ai_message.content
        hints = extract_text_between_tags(txt, "hints-to-fix-student-code", "end-hints-to-fix-student-code")
        return hints

    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    chain = prompt | llm | outputParser

    # Define the evaluators to apply
    eval_config = smith.RunEvalConfig(
        evaluators=[
            smith.RunEvalConfig.Criteria({"helpfulness": "Do the hints in [Submission] help resolve any issues in [input-solution]? [input-solution] is code written by a student attempting to solve [input-task]."}),
        ],
        custom_evaluators=[],
        eval_llm=ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5),
        input_key="inputs",
    )

    client = Client()
    client.run_on_dataset(
        dataset_name="CR - Incorrect Subset",
        evaluation=eval_config,
        llm_or_chain_factory=chain,
        project_name="CR - Subset Eval 2",
        verbose=True,
        input_mapper=lambda x: {
            "inputs": f"\n[input-solution]:\n{x['solution']}\n[input-task]:\n{x['taskDescription']}",
            "taskDescription": x["taskDescription"],
            "solution": x["solution"],
        },
    )

# check for command line arg
arg = sys.argv[1] if len(sys.argv) > 1 else ""

if (arg == "stories"):
    evalStories()
elif ("solutions" in arg.lower()):
    if arg == "solutions" or arg == "solutions-correct":
        generateTaskSolutions(0)
    elif arg == "solutions-incorrect":
        generateTaskSolutions(1)
    elif arg == "solutions-approximate":
        generateTaskSolutions(2)
elif (arg == "feedback"):
    if arg == "feedback" or arg == "feedback-one":
        evalFeedback(1)
    elif arg == "feedback-two":
        evalFeedback(2)
    elif arg == "feedback-three":
        evalFeedback(3)
else:
    print("Error! Please provide a valid command line argument.")
