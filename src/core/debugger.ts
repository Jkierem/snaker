import { createContext, useContext } from "react";

interface DebuggerContextData {
    
}

export const DebuggerContext = createContext({});

export const useDebugger = () => useContext(DebuggerContext);