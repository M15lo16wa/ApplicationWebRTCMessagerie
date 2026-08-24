import { HttpError } from "../../lib/httpError.js";
import { conversationsService } from "../conversations/conversations.service.js";
import { callSessionState } from "../signaling/callSession.state.js";
import { callsRepository } from "./calls.repository.js";

const RING_TIMEOUT_MS = 30_000;

export const callsService = {
  ringTimeoutMs: RING_TIMEOUT_MS,

  async initiate({ conversationId, initiatorId, type }) {
    await conversationsService.assertParticipant(conversationId, initiatorId);
    const call = await callsRepository.create({ conversationId, initiatorId, type });
    callSessionState.create(call.id, { conversationId, initiatorId });
    return call;
  },

  async accept({ callId, userId }) {
    const session = callSessionState.get(callId);
    if (!session) {
      throw new HttpError(404, "Cet appel n'existe plus");
    }
    callSessionState.addParticipant(callId, userId);
    callSessionState.setState(callId, "active");
    await callsRepository.addParticipant(callId, userId);
    await callsRepository.setState(callId, "active");
    return session;
  },

  async decline({ callId, userId }) {
    callSessionState.removeParticipant(callId, userId);
    await callsRepository.setState(callId, "missed");
    callSessionState.end(callId);
  },

  async end({ callId, userId }) {
    callSessionState.removeParticipant(callId, userId);
    await callsRepository.markLeft(callId, userId);
    const session = callSessionState.get(callId);
    if (!session || session.participants.size === 0) {
      await callsRepository.setState(callId, "ended");
      callSessionState.end(callId);
    }
  },

  history(userId) {
    return callsRepository.listForUser(userId);
  },

  async deleteOne({ callId, userId }) {
    const call = await callsRepository.findById(callId);
    if (!call || !call.participants.some((p) => p.userId === userId)) {
      throw new HttpError(404, "Appel introuvable");
    }
    await callsRepository.hideForUser([callId], userId);
    return { callIds: [callId] };
  },

  async deleteMany({ callIds, userId }) {
    const calls = await callsRepository.findManyByIds(callIds);
    const ownIds = calls
      .filter((c) => c.participants.some((p) => p.userId === userId))
      .map((c) => c.id);
    await callsRepository.hideForUser(ownIds, userId);
    return { callIds: ownIds };
  },

  async clearHistory({ userId }) {
    const callIds = await callsRepository.hideAllForUser(userId);
    return { callIds };
  },
};
