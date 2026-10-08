export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
) => {
    let response = await fetch(url, {
        ...options,
        credentials: "include",
    });

    if (response.status === 401) {
        const refresh = await fetch(
            "/api/user/refresh-token",
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (refresh.ok) {
            response = await fetch(url, {
                ...options,
                credentials: "include",
            });
        }
    }

    return response;
};