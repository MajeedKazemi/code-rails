# Evaluation Test Suite

This evaluation suite has a couple functionalities.

## Prerequisites

1. `LANGCHAIN_API_KEY` environment variable must be set to the API key for the LangSmith API.
2. `python3 -m venv venv` to create a virtual environment.
3. `source venv/bin/activate` to activate the virtual environment.
4. `pip install -r requirements.txt` to install the required Python packages.
5. `yarn` to install the required Node packages.

## LangSmith Dataset Generation

1. `yarn generate` will generate a dataset of story titles and other associated metadata for use in generating stories for further evaluation.
2. This dataset will be stored available via the associated LangSmith account,

## Evaluation

1. Run `python eval.py stories` to evaluate the generated stories.
