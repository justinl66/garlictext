import { createContext, useState } from "react";

export const ServerContext = createContext<any>(null);

export function ServerContextWrapper({ children }: { children: React.ReactNode }) {
    // const [roomId, setRoomId] = useState<string>("");
    const [creator, setCreator] = useState<string>("");
    const [players, setPlayers] = useState<any[]>([]);
    const [gameSettings, setGameSettings] = useState<any>({
        rounds: 3,
        drawingTime: 60,
        writingTime: 60,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateFromServer = async (roomCode:string) => {
        setLoading(true);
        await fetch('http://localhost:5001/api/code/' + roomCode, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        }
        ).then(data => {
            setCreator(data.hostId);
            setPlayers(data.participants);
            setGameSettings(data.gameSettings);
            setLoading(false);
            setError(null);
        }).catch(error => {
            setError("Error fetching data: " + error.message);
            setLoading(false);
        });
    }

    return (
        <ServerContext.Provider value={{updateFromServer, creator, players, gameSettings, loading, error }}>
            {children}
        </ServerContext.Provider>
    );
}