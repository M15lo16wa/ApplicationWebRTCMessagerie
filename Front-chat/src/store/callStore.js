import { create } from "zustand";

export const useCallStore = create((set) => ({
  phase: "idle",
  callId: null,
  conversationId: null,
  type: null,
  peerId: null,
  incomingOffer: null,
  localStream: null,
  remoteStream: null,
  error: null,
  connectionQuality: null,

  startOutgoing({ callId, conversationId, type, localStream }) {
    set({ phase: "outgoing", callId, conversationId, type, localStream, error: null });
  },

  receiveIncoming({ callId, conversationId, type, sdpOffer, initiatorId }) {
    set({
      phase: "incoming",
      callId,
      conversationId,
      type,
      peerId: initiatorId,
      incomingOffer: sdpOffer,
      error: null,
    });
  },

  markActive({ localStream, remoteStream }) {
    set((state) => ({
      phase: "active",
      localStream: localStream ?? state.localStream,
      remoteStream: remoteStream ?? state.remoteStream,
    }));
  },

  setRemoteStream(remoteStream) {
    set({ remoteStream });
  },

  setError(error) {
    set({ error });
  },

  setConnectionQuality(connectionQuality) {
    set({ connectionQuality });
  },

  reset() {
    set((state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      return {
        phase: "idle",
        callId: null,
        conversationId: null,
        type: null,
        peerId: null,
        incomingOffer: null,
        localStream: null,
        remoteStream: null,
        error: null,
        connectionQuality: null,
      };
    });
  },
}));
