import { createContext, useState } from "react";
import Cookies from "js-cookie";

export const ServerContext = createContext<any>(null);

export function ServerContextWrapper({ children }: { children: React.ReactNode }) {
    // const [roomId, setRoomId] = useState<string>("");
    const [gameName, setGameName] = useState<string>("");
    const [creator, setCreator] = useState<string>("");
    const [players, setPlayers] = useState<any[]>([]);
    const [gameSettings, setGameSettings] = useState<any>({
        rounds: 3,
        drawingTime: 60,
        writingTime: 60,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    const updateLobbyFromServer = async (roomCode:string) => {
        let currentUpdate = Cookies.get('currentUpdate');
        // alert('Current update: ' + currentUpdate);
        if(!currentUpdate){
            currentUpdate = '0';
        }
        
        // alert('Updating lobby from server...');
        // setLoading(true);
        await fetch(`http://localhost:5001/api/games/${roomCode}/lobbyInfo?version=${currentUpdate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => {
            // alert('Response status: ' + response.status);
            if (!response.ok) {
                if(response.status === 222){
                    setGameStarted(true);
                    throw new Error('start');
                }
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        }
        ).then(data => {
            if(data.message == "good"){
                return;
            }

            Cookies.set('gameName', data.gameName, { expires: 1 });
            Cookies.set('host', data.gameHost, { expires: 1 });
            Cookies.set('gameSettings', JSON.stringify({
                rounds: data.rounds,
                drawingTime: data.drawingTime,
                writingTime: data.writingTime,
                maxPlayers: data.maxPlayers,
            }), { expires: 1 });
            Cookies.set('players', JSON.stringify(data.participants), { expires: 1 });

            Cookies.set('currentUpdate', data.currentUpdate, { expires: 1 });
            
            return 1;

            // alert(players)
        }).catch(error => {
            if(error.message === 'start') {
                return;
            }
            setError("Error fetching data: " + error.message);
            // setLoading(false);
        });
    }

    return (
        <ServerContext.Provider value={{updateLobbyFromServer, gameName, creator, players, gameSettings, gameStarted, loading, error }}>
            {children}
        </ServerContext.Provider>
    );
}