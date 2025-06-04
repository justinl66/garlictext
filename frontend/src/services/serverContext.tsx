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
        let currentUpdate = Cookies.get('currentUpdate') || "0"
        
        try{
            const response = await fetch(`http://localhost:5001/api/games/${roomCode}/lobbyInfo?version=${currentUpdate}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if(response.status === 222){
                    setGameStarted(true);
                    return;
                }
                throw new Error('Network response was not ok: ' + response.statusText); 
            }

            const data = await response.json();
            if(data.message === "good" && creator !== ""){
                return;
            }
            setGameName(data.name);
            setCreator(data.hostId);
            setPlayers(data.participants || []);
            setGameSettings({
                rounds: data.rounds,
                drawingTime: data.drawingTime,
                writingTime: data.writingTime,
                maxPlayers: data.maxPlayers,
            });
            setError(null);

        }catch(e:any){
            setError("Error fetching data: " + e.message);
            return;
        }


        // alert('Updating lobby from server...');
        // setLoading(true);
        // await fetch(`http://localhost:5001/api/games/${roomCode}/lobbyInfo?version=${currentUpdate}`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // }).then(response => {
        //     // alert('Response status: ' + response.status);
        //     if (!response.ok) {
        //         if(response.status === 222){
        //             setGameStarted(true);
        //             return;
        //         }
        //         throw new Error('Network response was not ok: ' + response.statusText);
        //     }
        //     return response.json();
        // }
        // ).then(data => {
        //     if(data.message == "good" && creator != ""){
        //         return;
        //     }
        //     setGameName(data.name);
        //     setCreator(data.hostId);
        //     // setPlayers([...data.participants]);
        //     setGameSettings({
        //         ...gameSettings,
        //         rounds: data.rounds,
        //         drawingTime: data.drawingTime,
        //         writingTime: data.writingTime,
        //         maxPlayers: data.maxPlayers,
        //     });

        //     // alert("Game settings updated: " + JSON.stringify(data));
            
        //     Cookies.set('currentUpdate', data.currentUpdate, { expires: 1 });
        //     // setLoading(false);
        //     setError(null);
        //     // alert(players)
        // }).catch(error => {
        //     setError("Error fetching data: " + error.message);
        //     // setLoading(false);
        // });
    }

    return (
        <ServerContext.Provider value={{updateLobbyFromServer, gameName, creator, players, gameSettings, gameStarted, loading, error }}>
            {children}
        </ServerContext.Provider>
    );
}