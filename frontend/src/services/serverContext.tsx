import { createContext, useState } from "react";

export const ServerContext = createContext<any>(null);

export function ServerContextWrapper({ children }: { children: React.ReactNode }) {
    const [roomId, setRoomId] = useState<string>("");

    return (
        <ServerContext.Provider value={{ roomId, setRoomId }}>
            {children}
        </ServerContext.Provider>
    );
}