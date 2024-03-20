import sys

import langsmith
from langchain import chat_models, prompts, smith
from langchain.schema import output_parser

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
    llm = chat_models.ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    chain = prompt | llm | output_parser.StrOutputParser()

    # Define the evaluators to apply
    eval_config = smith.RunEvalConfig(
        evaluators=[
            smith.RunEvalConfig.LabeledCriteria("coherence")
        ],
        custom_evaluators=[],
        eval_llm=chat_models.ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.5)
    )

    client = langsmith.Client()
    chain_results = client.run_on_dataset(
        dataset_name="Code Rails - Story Titles and Generated Stories",
        evaluation=eval_config,
        llm_or_chain_factory=chain,
        project_name="test-terrible-particle-14",
        concurrency_level=5,
        verbose=True,
    )

# check for command line arg
arg = sys.argv[1] if len(sys.argv) > 1 else ""

if (arg == "stories"):
    evalStories()
else:
    print("Error! Please provide a valid command line argument.")
