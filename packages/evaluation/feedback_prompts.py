from langchain import prompts


def l1_prompt():
    return prompts.ChatPromptTemplate.from_messages([
        (
            "system",
            """You are a programming tutor. I am a novice student that is learning how to write Python code for the first time. I might have difficulties understanding the syntax and logic as well as many other basic computational thinking and meta cognitive skills.

    Look at the [intended-behavior] and [student-code] to first generate the [fixed-student-code]. The [fixed-student-code] should not go above and beyond to check every possible input. Just focus on making it work or achieving the [intended-behavior].

    Then provide [hints-to-fix-student-code] using the following bullet point template with tags at the beginning of each hint's bullet points: [[fix]], [[add]], [[remove]].

    # Template:
    [hints-to-fix-student-code]:
    [[tag]] hint bullet point. write python keywords like this: `keyword`
    [[tag]] text...
    [[tag]] text...
    [end-hints-to-fix-student-code]

    at the beginning of each hint's bullet points add one of the following tags: [[fix]], [[add]], [[remove]]""",
        ),
        (
            "user",
            """[intended-behavior]: Set two variables called num1 and num2 to a random number between 1 and 1000 and a third variable called result to 0. Ask the user to enter one of the two options: greater, or smaller and then check which one the user has entered. (display an error message: Invalid Option if the user didn't enter any of the two). If the user enters greater, then check if the num1 is greater than num2. If it is, set result to num1 and otherwise, set result to num2. However, if the user enters smaller, then check if the num1 is smaller than num2. If it is, set result to num1 and otherwise, set result to num2. Finally, if the user did not enter an invalid input, display the message: You entered option and the result is result.

    [student-code]:
    num1 = random.randint(1, 1000)
    num2 = random.randint(1, 1000)

    comparison = input("Greater or smaller? ")

    if comparison == "greater":
        if num1 > num2:
            result = num1
        else:
            result = num2
    elif comparison == "smaller":
        if num1 < num2:
            result = num1
        else:
            result = num2
    else:
        print("Invalid Option")

    print("You entered " + comparison + " and the result is " + str(result))""",
        ),
        (
            "assistant",
            """[fixed-student-code]:
    import random

    num1 = random.randint(1, 1000)
    num2 = random.randint(1, 1000)
    result = 0

    comparison = input("Greater or smaller? ")

    if comparison == "greater":
        if num1 > num2:
            result = num1
        else:
            result = num2
    elif comparison == "smaller":
        if num1 < num2:
            result = num1
        else:
            result = num2
    else:
        print("Invalid Option")

    print("You entered " + comparison + " and the result is " + str(result))

    [hints-to-fix-student-code]:
    [[add]] missing `import` statement for the `random` module.
    [[fix]] typo in `random.randit(a), (b)`. should be `random.randint(a, b)` instead.
    [[fix]] variable names can't have spaces, so `num 1` and `num 2` should be `num1` and `num2`, respectively.
    [[fix]] use double equals `==` to check `if comparison` is equal to `"greater"`.
    [[remove]] you do not need `num 3` for this task.
    [[add]] you forgot to handle the case where the user enters `"smaller"` (you can use `elif` for that) and didn't check for invalid input cases (using `else`).
    [[add]] In the final print statement, you need to convert numbers to string using `str()` before concatenation with the `+` operator.
    [end-hints-to-fix-student-code]""",
        ),
        (
            "user",
            "[intended-behavior]: {taskDescription}\n[student-code]\n{solution}\n[end-student-code]",
        ),
    ])
