import env from "../utils/env";

export const apiUpdateTheme = (
    token: string | null | undefined,
    themes: string[]
) =>
    fetch(env.API_URL + "/api/theme/", {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            themes
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

export const apiGenerateSubCategories = (
    token: string | null | undefined,
    category: string
) =>
    fetch(env.API_URL + "/api/theme/sub_categories", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            category
        })
    });

export const apiGenerateCharacters = (
    token: string | null | undefined,
    category: string
) =>
    fetch(env.API_URL + "/api/theme/characters", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            category
        })
    });
