import re
import sys

from feedback_prompts import l1_prompt, l2_prompt, l3_prompt
from langchain import prompts, smith
from langchain.schema import output_parser
from langchain_core.messages import AIMessage
from langchain_openai import ChatOpenAI
from langsmith import Client
from tqdm import tqdm


def extract_text_between_tags(txt, start_tag, end_tag, keep_text=False):
    # Compile a regular expression pattern to match the desired text blocks
    pattern = re.compile(r"\[" + re.escape(start_tag) + r"\](.*?)\[" + re.escape(end_tag) + r"\]", re.DOTALL)
    matches = pattern.findall(txt)
    # Extract and process the match if it exists
    if matches:
        # Split the matched text by newline, remove the first and last elements, then join back with newline
        return_list = matches[0].split("\n")[1:-1]
        if keep_text:
            return_list = [f"[[{start_tag}]]:"] + return_list + [f"[[{end_tag}]]"]
            
        return "\n".join(return_list)
    return ""

def number_code(code: str) -> str:
    lines = code.split('\n')
    numbered_lines = [f"{i + 1}. {line}" for i, line in enumerate(lines)]
    return '\n'.join(numbered_lines)


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
        # verbose=True,
        # input_mapper=lambda x: {
        #     "character": x["input_character"],
        #     "storyTitle": x["input_storytitle"],
        #     "taskDescription": x["input_taskdescription"]
        # },
    )

def getSolutionPrompt():
    return prompts.ChatPromptTemplate.from_messages(
        [
            ("system", f"""Generate threes to the provided [problem]. One set will be correct, one set will be incorrect, and one set will be approximate. 
- The [correct-solution] should be correct
- The [approximate-solution] should be close to the correct solution but have some noticeable mistakes.
- The [incorrect-solution] should be extremely wrong and barely resemble the problem.
Ensure that this solution falls within its respective category and is differentiable from the other two sets of solutions.
The solution should be written in Python. Only return the code with no other annotations including backticks.

Please use the following template:

[correct-solution]:
Correct solution here
[end-correct-solution]

[approximate-solution]:
Correct solution here
[end-approximate-solution]

[incorrect-solution]:
Correct solution here
[end-incorrect-solution]"""),
            ("human", "[problem]: {problem}"),
        ],
    )

def getSolutionDatasetName(id):
    return ["Code Rails - Correct Solutions", "Code Rails - Incorrect Solutions", "Code Rails - Approximate Solutions"][id]

def getSolutionProjectName(id):
    return ["Code Rails - Feedback Correct Evaluation", "Code Rails - Feedback Incorrect Evaluation", "Code Rails - Feedback Approximate Evaluation"][id]

def generateTaskSolutions(prompt_id: int = 0):
    prompt = getSolutionPrompt()

    def outputParser(ai_message: AIMessage):
        txt = ai_message.content
        correct = extract_text_between_tags(txt, "correct-solution", "end-correct-solution")
        approx = extract_text_between_tags(txt, "approximate-solution", "end-approximate-solution")
        incorrect = extract_text_between_tags(txt, "incorrect-solution", "end-incorrect-solution")

        if not correct or not approx or not incorrect:
            print("\n--- Error: Missing one of the solutions! ---\n")

        return {
            "correct": correct,
            "approximate": approx,
            "incorrect": incorrect,
        }

    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    chain = prompt | llm | outputParser

    client = Client()
    project_name = "eval-0"
    df = client.get_test_results(project_name=project_name)

    correct_inputs, approximate_inputs, incorrect_inputs = [], [], []
    for idx, row in tqdm(df.iterrows(), total=df.shape[0]):
        solutions = chain.invoke({"problem": row["outputs.output"]})

        base_inputs = {
            "storyTitle": row["input.storyTitle"],
            "character": row["input.character"],
            "originalTaskDescription": row["input.taskDescription"],
            "taskDescription": row["outputs.output"],
        }

        incorrect_inputs.append({
            **base_inputs,
            "solution": solutions["incorrect"],
        })

        approximate_inputs.append({
            **base_inputs,
            "solution": solutions["approximate"],
        })

        correct_inputs.append({
            **base_inputs,
            "solution": solutions["correct"],
        })


    for i, inputs in enumerate([correct_inputs, incorrect_inputs, approximate_inputs]):
        dataset = client.create_dataset(
            dataset_name=getSolutionDatasetName(i),
        )

        client.create_examples(
            inputs=inputs,
            dataset_id=dataset.id,
        )

def feedbackPrompt(level: int):
    return [l1_prompt(), l2_prompt(), l3_prompt()][level]

def evalFeedback(dataset_id: int = 1, feedback_level: int = 0):
    prompt = feedbackPrompt(feedback_level)

    def outputParser(ai_message: AIMessage):
        txt = ai_message.content
        start_text = ["hints-to-fix-student-code", "suggested-fixes", "numbered-fixed-student-code"][feedback_level]
        end_text = ["end-hints-to-fix-student-code", "end-missing-parts", "end-suggested-fixes"][feedback_level]
        hints = extract_text_between_tags(txt, start_text, end_text, keep_text=feedback_level > 0)
        return hints

    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    chain = prompt | llm | outputParser

    # Define the evaluators to apply
    eval_config = smith.RunEvalConfig(
        evaluators=[
            smith.RunEvalConfig.Criteria({"helpfulness": "Do the hints in [Submission] help resolve any issues in [input-solution]? [input-solution] is code written by a student attempting to solve [input-task]."}),
            smith.RunEvalConfig.Criteria({"correctness": "Are the hints in [Submission] correct? [input-solution] is code written by a student attempting to solve [input-task]."}),
        ],
        custom_evaluators=[],
        eval_llm=ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5),
        input_key="inputs",
    )

    client = Client()
    client.run_on_dataset(
        dataset_name=getSolutionDatasetName(dataset_id),
        evaluation=eval_config,
        llm_or_chain_factory=chain,
        project_name=f"[L{feedback_level + 1}]: " + getSolutionProjectName(dataset_id) + " 2",
        # verbose=True,
        input_mapper=lambda x: {
            "inputs": f"\n[input-solution]:\n{x['solution']}\n[input-task]:\n{x['taskDescription']}",
            "taskDescription": x["taskDescription"],
            "solution": x["solution"] if feedback_level == 0 else number_code(x["solution"]),
        },
    )

# check for command line arg
arg = sys.argv[1] if len(sys.argv) > 1 else ""

# Evaluated Customized Stories
if (arg == "stories"):
    evalStories()

# Generate Task Solutions for Feedback Evaluation
elif ("solutions" in arg.lower()):
    if arg == "solutions" or arg == "solutions-correct":
        generateTaskSolutions(0)
    elif arg == "solutions-incorrect":
        generateTaskSolutions(1)
    elif arg == "solutions-approximate":
        generateTaskSolutions(2)

# Evaluate Feedback with additional parameters
elif ("feedback" in arg):
    arg = arg.lower()
    if "incorrect" in arg:
        correctness_level = 1
    elif "approximate" in arg:
        correctness_level = 2
    else: # "correct" in arg:
        correctness_level = 0
    
    if "l2" in arg:
        feedback_level = 1
    elif "l3" in arg:
        feedback_level = 2
    else: # "l1" in arg:
        feedback_level = 0

    print(f"Running Feedback Evalution with:\n\tCorrectness Level: {correctness_level}, Feedback Level: {feedback_level}")
    evalFeedback(correctness_level, feedback_level)
else:
    print("Error! Please provide a valid command line argument.")
