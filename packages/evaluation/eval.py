import sys
import re

from langsmith import Client
from langchain import prompts, smith
from langchain_openai import ChatOpenAI
from langchain.schema import output_parser
from langchain_core.messages import AIMessage
from langsmith.beta._evals import compute_test_metrics

def extract_text_between_tags(txt, start_tag, end_tag):
    # Compile a regular expression pattern to match the desired text blocks
    pattern = re.compile(r'\[' + re.escape(start_tag) + r'\](.*?)\[' + re.escape(end_tag) + r'\]', re.DOTALL)
    matches = pattern.findall(txt)
    # Extract and process the match if it exists
    if matches:
        # Split the matched text by newline, remove the first and last elements, then join back with newline
        return '\n'.join(matches[0].split('\n')[1:-1])
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
{taskDescription}""")
        ]
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
            smith.RunEvalConfig.Criteria("coherence")
        ],
        custom_evaluators=[],
        eval_llm=ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5),
        input_key="taskDescription"
    )

    client = Client()
    chain_results = client.run_on_dataset(
        dataset_name="Code Rails - Story Titles and Generated Stories",
        evaluation=eval_config,
        llm_or_chain_factory=chain,
        project_name="py-test-3-unlabelled",
        concurrency_level=5,
        verbose=True
    )

# check for command line arg
arg = sys.argv[1] if len(sys.argv) > 1 else ""

if (arg == "stories"):
    evalStories()
else:
    print("Error! Please provide a valid command line argument.")
