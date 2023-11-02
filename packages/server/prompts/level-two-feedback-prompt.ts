import { ChatCompletionRequestMessage } from "openai";

const feedbackL2Prompt = {
    prime: (intendedBehavior: string, studentCode: string, notes: string[]) => {
        const system: ChatCompletionRequestMessage = {
            role: "system",
            content: `You are a programming tutor. I am a novice student that is learning how to write Python code for the first time. I might have difficulties understanding the syntax and logic as well as many other basic computational thinking and meta cognitive skills.

Look at the [intended-behavior] and [lined-student-code] to first generate the [fixed-student-code]. The [fixed-student-code] should not go above and beyond to check every possible input. Just focus on making it work or achieving the [intended-behavior].

Then, look back at the [lined-student-code] and annotate each line with [[correct]] and those that need to be edited with either [[change]], [[remove]], or [[fix]] and a description about why and how. If there are lines that are [[add]], add an empty line (but don't update the line numbers) and just tag it with [[add]] and an explanation of it.

I will provide one example, but try to generalize to other cases.

[annotated-lined-student-code]:
1.    student_code_... # [[change]]: description about why it needs to be changed and how to change it. use keywords like this: \`keyword\`
# [[add]]: description about what is missing and why.
2.    student_code_... # [[correct]]
3.    student_code_... # [[fix]]: description about what is wrong and how to fix it.
4.    student_code_... # [[correct]]
5.        student_code_... # [[correct]]
# [[add]]: description about what is missing and why.
6.    student_code_... # [[remove]]: description about why it needs to be removed.`,
        };

        const inputExample: ChatCompletionRequestMessage = {
            role: "user",
            content: `[intended-behavior]: Set two variables called num1 and num2 to a random number between 1 and 1000 and a third variable called result to 0. Ask the user to enter one of the two options: greater, or smaller and then check which one the user has entered. (display an error message: Invalid Option if the user didn't enter any of the two). If the user enters greater, then check if the num1 is greater than num2. If it is, set result to num1 and otherwise, set result to num2. However, if the user enters smaller, then check if the num1 is smaller than num2. If it is, set result to num1 and otherwise, set result to num2. Finally, if the user did not enter an invalid input, display the message: You entered option and the result is result.

[lined-student-code]:
1.    num 1 = random.randit(1), (1000)
2.    num 2 == random.randit(1), (1000)
3.    num 3 = random.randit(1), (1000)
4.    
5.    Comparision = input(Greater or smaller?)
6.    if Comparision = "greater"
7.    if num 1 > num 2:
8.        print("You entered" + str(Comparision) + " and the result is " + num 1)
[end-lined-student-code]`,
        };

        const outputExample: ChatCompletionRequestMessage = {
            role: "assistant",
            content: `[fixed-student-code]:
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
[end-fixed-student-code]

[annotated-lined-student-code]:
L.    # [[add]]: import the \`random\` module
1.    num 1 = random.randit(1), (1000) # [[fix]]: The variable name should be \`num1\`, not \`num 1\`. Also, the function is \`randint()\`, not \`randit()\`. The correct syntax for creating a random integer between \`a\` and \`b\` is \`random.randint(a, b)\`.
2.    num 2 == random.randit(1), (1000) # [[fix]]: The variable name should be \`num2\`, not \`num 2\`. Also, the function is \`randint()\`, not \`randit()\`. The correct syntax for creating a random integer between \`a\` and \`b\` is \`random.randint(a, b)\`. Use \`=\` instead of \`==\` to assign a value to a variable.
3.    num 3 = random.randit(1), (1000) # [[remove]]: The variable \`num3\` is not needed for this task and can be removed.
4.    
L.    # [[add]]: Add a new line to create a variable called \`result\` and assign it the value \`0\`.
5.    Comparision = input(Greater or smaller?) # [[fix]]: the \`input\` prompt message should be inside quotes.
6.    if Comparision = "greater" # [[change]]: The comparison operator should be \`==\` (double equals) instead of \`=\` (single equals). Also, there should be a colon at the end of the line to indicate the start of a new block of code.
7.    if num 1 > num 2: # [[fix]]: There should be an indentation error at this line. The line should be indented to be inside the above \`if\` block.
8.        print("You entered" + str(Comparision) + " and the result is " + num 1) # [[fix]]: The variable \`num1\` should be converted to a string using the \`str()\` function.
L.    # [[add]]: Add an \`elif\` block to handle the case where the user enters \`"smaller"\`.
L.    # [[add]]: Add an \`else\` block to handle the case where the user enters an invalid input.
L.    # [[add]]: Add a print statement to display the message that displays the value of \`comparison\` and \`result\` variables.
`,
        };

        return [
            system,
            inputExample,
            outputExample,
            {
                role: "user",
                content: `[intended-behavior]: ${intendedBehavior}

[student-code]:
${studentCode}
[end-student-code]`,
            },
        ];
    },
    stopTokens: ["end-hints-to-fix-student-code"],
};
