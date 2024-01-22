import env from "../utils/env";

export const apiUpdateTheme = (
    token: string | null | undefined,
    theme: string
) =>
    fetch(env.API_URL + "/api/theme/", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            theme
        })
    });

export const apiGetTheme = (
    token: string | null | undefined,
) =>
    fetch(env.API_URL + "/api/theme/", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
