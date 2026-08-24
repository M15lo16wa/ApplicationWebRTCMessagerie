import { useCallStore } from "../../store/callStore.js";
import { ActiveCallScreen } from "./ActiveCallScreen.jsx";
import { CallErrorToast } from "./CallErrorToast.jsx";
import { IncomingCallScreen } from "./IncomingCallScreen.jsx";
import { useCallSignalingListeners } from "./useWebRTC.js";

export function CallManager() {
  useCallSignalingListeners();
  const phase = useCallStore((state) => state.phase);

  return (
    <>
      <CallErrorToast />
      {phase === "incoming" && <IncomingCallScreen />}
      {(phase === "outgoing" || phase === "active") && <ActiveCallScreen />}
    </>
  );
}
