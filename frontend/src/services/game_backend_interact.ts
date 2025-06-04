import Cookies from 'js-cookie';

async function createGame(gameName:string, token:string){
    try{
        const response = await fetch('http://localhost:5001/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: gameName,
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.code;
    }catch (error) {
        return "Error initializing game: " + error;
    }
}

async function joinGame(playerName:string, joinCode:string, user:any={}){
    if(user?.uid){
        const result = await fetch(`http://localhost:5001/api/games/join/${joinCode}/auth`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.stsTokenManager.accessToken}`,
            },
        });

        if (!result.ok) {
            // const errorText = await result.json();
            throw new Error(result.statusText);
        }
        return joinCode;
    }else{
        if(!playerName) {
            throw new Error("Error: Please enter your name.")
        }
        const result = await fetch(`http://localhost:5001/api/games/join/${joinCode}/nauth`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerName: playerName,
            }),
        });

        if (!result.ok) {
            const errorText = await result.json();
            throw new Error(errorText.message);
        }else{
            const data = await result.json();
            Cookies.set('playerName', playerName, { expires: 1 }); // Store player name in cookies
            Cookies.set("id", data.id, { expires: 1 }); // Store player ID in cookies
            return joinCode
        }
    }
}

export {createGame, joinGame}