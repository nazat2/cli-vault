import { useEffect, useState } from "react";
import { getMode, setMode, subscribeModeChange } from "../lib/modeStore.js";

export function useMode() {
  const [mode, setModeState] = useState(getMode());

  useEffect(() => {
    return subscribeModeChange(setModeState);
  }, []);

  function switchMode(nextMode) {
    setMode(nextMode);
  }

  return [mode, switchMode];
}
