const activeSessions = new Map();

export const callSessionState = {
  create(callId, { conversationId, initiatorId }) {
    const session = {
      callId,
      conversationId,
      initiatorId,
      participants: new Set([initiatorId]),
      state: "ringing",
    };
    activeSessions.set(callId, session);
    return session;
  },

  get(callId) {
    return activeSessions.get(callId);
  },

  addParticipant(callId, userId) {
    activeSessions.get(callId)?.participants.add(userId);
  },

  removeParticipant(callId, userId) {
    const session = activeSessions.get(callId);
    session?.participants.delete(userId);
    return session;
  },

  setState(callId, state) {
    const session = activeSessions.get(callId);
    if (session) session.state = state;
  },

  end(callId) {
    activeSessions.delete(callId);
  },
};
