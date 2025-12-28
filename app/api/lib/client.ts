export const client = {
    room: {
        create: {
            post: async () => {
                try {
                    const res = await fetch("http://localhost:5000/api/room/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    const data = await res.json()
                    return { status: res.status, data }
                } catch (error) {
                    console.error("API client error:", error)
                    return { status: 500, data: { error: "Network error or server down" } }
                }
            },
        },
    },
}
