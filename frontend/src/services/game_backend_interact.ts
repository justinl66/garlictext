async function initializeGameBackend(userToken: string, roomName: string): Promise<string> {
    await fetch('/api/initialize_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
            name: roomName,
        }),
    }).then(res => {
        if (!res.ok) {
            return `HTTP error! status: ${res.status}`;
        }
        return "success";
    }
    ).catch(error => {
        return "Error initializing game: " + error.message;
    });
    return "Unable to fetch"
}

async function createGameBackend(userToken: string, roomName: string, maxPlayers: number, totalRounds: number) {
    await fetch('/api/create_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
            name: roomName,
            maxPlayers: maxPlayers,
            totalRounds: totalRounds,
        }),
    }).then(res => {
        if (!res.ok) {
            return `HTTP error! status: ${res.status}`;
        }
        return "success";
    }).catch(error => {
        return "Error creating game: " + error.message;
    });

}


export {initializeGameBackend, createGameBackend};
