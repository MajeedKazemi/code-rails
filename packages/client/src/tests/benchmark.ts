// each of these should be queried from tasks.ts to obtain task description, input/output examples, and notes.
// this benchmark can be used for both the grading and the feedback APIs (all three levels).
// to report the results, researchers usually perform a thematic analysis on the grading and feedback.
// the results of this benchmark should be reported in the paper.
export interface ITestCase {
    taskId: string;
    isCorrect: boolean;
    studentCode: string;
}

export const testCases: Array<ITestCase> = [
    {
        taskId: "7",
        isCorrect: false,
        studentCode: `num1 = "20"
num2 = "5"
add = "25"
sub = "15"
mult = "100"
div = "4.0"
print(add ) + print(sub ) + print(mult) + print(div)`,
    },
    {
        taskId: "17",
        isCorrect: false,
        studentCode: `import random
coin = int(input("enter a number between 1 and 2: "))
if coin is 1:
    print(heads)
else
    print(tails)`,
    },
    {
        taskId: "17",
        isCorrect: false,
        studentCode: `c = input(int("num:"))
if c is 1:
    print(heads)
else
    print("coin: tails")`,
    },
    {
        taskId: "32",
        isCorrect: false,
        studentCode: `import randit from random
picked_number= random.randit(1,1000)
guessnum=input(int("Guess the number"))
if guessnum= picked_number
    print("You guessed the number!" ")
elif:
    while guessnum>picked_number:
        print("The number is too high"
        guessnum=int(input("Guess the number"))
    while guessnum<picked_number:
        print("The number is too low"
        guessnum=int(input("Guess the number"))`,
    },
    {
        taskId: "32",
        isCorrect: true,
        studentCode: `import random
picked_number=random.randint(1,1000)
guessnum=int(input("guess between 1 and 1000"))
if guessnum==picked_number:
    print("You guessed the number!" ")
else:
    while guessnum!=picked_number:
        if guessnum>picked_number:
            print("guessed too high")
        elif guessnum<picked_number:
            print("guessed too low")
        
        guessnum=int(input("guess again"))
print("guessed the number correctly!")`,
    },
    {
        taskId: "32",
        isCorrect: true,
        studentCode: `import random
guesses=0
picked_number=random.randint(1,1000)
guessnum=int(input("guess between 1 and 1000"))
if guessnum==picked_number:
    print("You guessed the number!" ")
else:
    while guessnum!=picked_number:
        if guessnum>picked_number:
            print("guessed too high")
        elif guessnum<picked_number:
            print("guessed too low")
        
        guessnum=int(input("guess again"))
        guesses+=1
print(f'guessed correctly after {guesses} guesses!')`,
    },
    {
        taskId: "43",
        isCorrect: false,
        studentCode: `numbers = 0
for x in 5:
    number = input(int("Enter a number: "))
    numbers =+ number
for i in len(range(numbers)):
    largest = abs(numbers(i) - numbers(i + 1))`,
    },
    {
        taskId: "20",
        isCorrect: false,
        studentCode: `num 1 = random.randit(1), (1000)
num 2 == random.randit(1), (1000)
Comparision = input(Greater or smaller?)
if Comparision = "greater"
if num 1 > num 2:
    print("You entered" + str(Comparision) + " and the result is " + num 1)`,
    },
    {
        taskId: "24",
        isCorrect: false,
        studentCode: `fruits = "I like these fruits:"
fruits = ["apple, banana, cherry, orange, grape"]
for x in fruits:
    print x`,
    },
    {
        taskId: "4",
        isCorrect: false,
        studentCode: `Name="ro" 
Name= +"bot"
print (Created:Name)`,
    },
    {
        taskId: "9",
        isCorrect: false,
        studentCode: `import random
num = (random.randint (1, 10))
message = num is:+ num
print (message)`,
    },
    {
        taskId: "11",
        isCorrect: false,
        studentCode: `X = input ("Enter a number: ")
Y = input ("Enter another number: ")
int (X)
int (Y)
print ("calculating...")
print (int(X)  (Y))`,
    },
    {
        taskId: "15",
        isCorrect: false,
        studentCode: `str(n1) = input("enter a number between 10 and 100")
if str(n1) > 75:
    print("Greater than 75")
if str(n1) < 75:
    print("Less than 75")`,
    },
    {
        taskId: "19",
        isCorrect: false,
        studentCode: `num=(int(input("Enter a number")))
if num = / 2 >= 0:
    print (f'{num} is even')`,
    },
    {
        taskId: "1",
        isCorrect: true,
        studentCode: `print("Im Wall E")`,
    },
    {
        taskId: "1",
        isCorrect: false,
        studentCode: `input("Im Wall-E")`,
    },
    {
        taskId: "1",
        isCorrect: false,
        studentCode: `"Im Wall-E"`,
    },
    {
        taskId: "1",
        isCorrect: false,
        studentCode: `name = "Im Wall-E"`,
    },
    {
        taskId: "1",
        isCorrect: false,
        studentCode: `print(I'm Wall-E)`,
    },
    {
        taskId: "11",
        isCorrect: false,
        studentCode: `num1 = input("Enter a Number: ")

num2 = input("Enter Another Number: ")
print(num1 + num2)`,
    },
    {
        taskId: "11",
        isCorrect: false,
        studentCode: `num1 =input("Enter num1: ")
num2 = input("Enter num2:")
print(int(num1)+int(num2))`,
    },
    {
        taskId: "11",
        isCorrect: false,
        studentCode: `variable=input
input ("enter a number")
input ("enter another number")
print (variable+variable)`,
    },
    {
        taskId: "15",
        isCorrect: false,
        studentCode: `mort = input("enter a number beetween 10 and 100")
if mort > 75 :
    print ("greater than 75")
else:  print("less than 75")`,
    },
    {
        taskId: "15",
        isCorrect: true,
        studentCode: `mort = input("enter a number beetween 10 and 100")
if int(mort) > 75 :
    print ("is > 75")
else:  print("is < 75")`,
    },
    {
        taskId: "15",
        isCorrect: false,
        studentCode: `a=input("enter number")
if a > int(75) : 
    print("why not working")`,
    },
    {
        taskId: "15",
        isCorrect: false,
        studentCode: `question = ("enter_a_number_between_10_and_100")
input (question)
if (question) = < 75
print ("less than 75")`,
    },
    {
        taskId: "15",
        isCorrect: false,
        studentCode: `number = input("Enter a number")
if int(number) > 75:
    print("less than 75")
else:
    print("greater than 75")`,
    },
    {
        taskId: "15",
        isCorrect: false,
        studentCode: `number = input("Enter a number")
if int(number) >= 80:
    print("greater than 80")
elif int(number) <= 20:
    print("less than 20")`,
    },
    {
        taskId: "27",
        isCorrect: false,
        studentCode: `S = input ("Enter a number")
num = 0
Num = 0
while num < S
    num = num + 1
    Num = num + num 
    print (num)
print(Num)`,
    },
    {
        taskId: "27",
        isCorrect: false,
        studentCode: `num = 0
i = 0
while for i in range(1,101):
    num = num + 1
    i = i + 1
    print(nu)`,
    },
];

// add testcases:
// - that are correct
// - have subtle errors
