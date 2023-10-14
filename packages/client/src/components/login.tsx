import React, { useContext, useState } from "react";

import { authLogin } from "../api/api";
import { AuthContext } from "../context";
import { Button } from "./button";
import { Input } from "./input";

export const Login = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { setContext } = useContext(AuthContext);

    const formSubmitHandler = (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        const loginErrorMessage = "Your username or password is incorrect. Please try again.";
        const genericErrorMessage = "Something went wrong. Please try again.";

        authLogin(username, password)
            .then(async (response) => {
                setIsSubmitting(false);

                if (!response.ok) {
                    console.error("login failed");
                    setErrorMessage(loginErrorMessage);
                } else {
                    const data = await response.json();

                    setContext({ token: data.token, user: data.user });
                }
            })
            .catch((error) => {
                setErrorMessage(genericErrorMessage);
                setIsSubmitting(false);
                setContext({ token: null, user: null });
            });
    };

    return (
        <form onSubmit={formSubmitHandler} className="mb-md">
            <span className="section-title">Login</span>
            <Input
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && <div className="text-red-600 m-2">
                {errorMessage}
            </div>}
            <Button icon="login">
                {`${isSubmitting ? "Signing In" : "Sign In"}`}
            </Button>
        </form>
    );
};
