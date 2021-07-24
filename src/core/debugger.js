import { createContext, useContext } from "react";

export const DebuggerContext = createContext({});

export const useDebugger = () => useContext(DebuggerContext);