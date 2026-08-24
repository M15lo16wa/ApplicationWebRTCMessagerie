import { useEffect } from "react";
import { getSocket } from "../../api/socket.js";
import { useCallStore } from "../../store/callStore.js";
import { startRingtone, stopRingtone } from "./ringtone.js";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

let peerConnection = null;
let pendingCandidates = [];

function teardownPeerConnection() {
  peerConnection?.close();
  peerConnection = null;
  pendingCandidates = [];
  stopRingtone();
  callActionInProgress = false;
}

function createPeerConnection({ conversationId, callId }) {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      getSocket()?.emit("call:ice-candidate", {
        callId,
        conversationId,
        candidate: event.candidate,
      });
    }
  };

  pc.ontrack = (event) => {
    useCallStore.getState().setRemoteStream(event.streams[0]);
  };

  pc.oniceconnectionstatechange = () => {
    const state = pc.iceConnectionState;
    if (state === "connected" || state === "completed") {
      useCallStore.getState().setConnectionQuality("good");
    } else if (state === "disconnected") {
      useCallStore.getState().setConnectionQuality("unstable");
    } else if (state === "failed") {
      useCallStore.getState().setError("Connexion perdue — réseau trop instable.");
      endCall();
    }
  };

  peerConnection = pc;
  return pc;
}

function getLocalStream(type) {
  return navigator.mediaDevices.getUserMedia({

    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: type === "video" ? { width: { max: 1280 }, height: { max: 720 }, frameRate: { max: 30 } } : false,
  });
}

function describeMediaError(err) {
  switch (err?.name) {
    case "NotAllowedError":
      return "Micro/caméra refusé — autorise l'accès dans les réglages du navigateur.";
    case "NotFoundError":
      return "Aucun micro ou caméra détecté sur cet appareil.";
    case "NotReadableError":
      return "Le micro ou la caméra est déjà utilisé par une autre application.";
    default:
      if (!navigator.mediaDevices) {
        return "Micro/caméra indisponible sur cette page — vérifie que l'adresse est bien en https.";
      }
      return "Impossible d'accéder au micro/à la caméra.";
  }
}

function warnIfVideoMissing(type, stream) {
  if (type === "video" && stream.getVideoTracks().length === 0) {
    useCallStore.getState().setError("Caméra indisponible — l'appel continue en audio seul.");
  }
}

async function tuneEncodingsForWeakNetwork(pc) {
  for (const sender of pc.getSenders()) {
    if (!sender.track) continue;
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];

    if (sender.track.kind === "video") {
      params.encodings[0].maxBitrate = 600_000;
      params.degradationPreference = "maintain-framerate";
    } else if (sender.track.kind === "audio") {
      params.encodings[0].maxBitrate = 32_000;
      params.encodings[0].priority = "high";
    }

    try {
      await sender.setParameters(params);
    } catch {
    }
  }
}

let facingMode = "user";

export async function switchCamera() {
  const { localStream } = useCallStore.getState();
  if (!localStream || !peerConnection) return;

  facingMode = facingMode === "user" ? "environment" : "user";

  const newStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { facingMode: { ideal: facingMode } },
  });
  const newTrack = newStream.getVideoTracks()[0];

  const sender = peerConnection.getSenders().find((s) => s.track?.kind === "video");
  await sender?.replaceTrack(newTrack);

  const oldTrack = localStream.getVideoTracks()[0];
  oldTrack?.stop();
  if (oldTrack) localStream.removeTrack(oldTrack);
  localStream.addTrack(newTrack);
}

let callActionInProgress = false;

export async function initiateCall(conversationId, type) {
  if (callActionInProgress) return;
  callActionInProgress = true;

  let localStream;
  try {
    localStream = await getLocalStream(type);
  } catch (err) {
    useCallStore.getState().setError(describeMediaError(err));
    callActionInProgress = false;
    return;
  }
  const pc = createPeerConnection({ conversationId, callId: null });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  await tuneEncodingsForWeakNetwork(pc);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  getSocket()?.emit("call:initiate", { conversationId, type, sdpOffer: offer }, (ack) => {
    callActionInProgress = false;
    if (!ack?.ok) {
      teardownPeerConnection();
      useCallStore.getState().reset();
      useCallStore.getState().setError(ack?.error ?? "Appel impossible");
      return;
    }
    startRingtone("outgoing");
    useCallStore.getState().startOutgoing({ callId: ack.callId, conversationId, type, localStream });
    warnIfVideoMissing(type, localStream);
  });
}

export async function acceptCall() {
  if (callActionInProgress) return;
  callActionInProgress = true;

  const { callId, conversationId, type, incomingOffer } = useCallStore.getState();

  let localStream;
  try {
    localStream = await getLocalStream(type);
  } catch (err) {
    useCallStore.getState().setError(describeMediaError(err));
    callActionInProgress = false;
    return;
  }
  warnIfVideoMissing(type, localStream);

  const pc = createPeerConnection({ conversationId, callId });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  await tuneEncodingsForWeakNetwork(pc);

  stopRingtone();

  await pc.setRemoteDescription(incomingOffer);
  for (const candidate of pendingCandidates) {
    await pc.addIceCandidate(candidate);
  }
  pendingCandidates = [];

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  getSocket()?.emit("call:accept", { callId, conversationId, sdpAnswer: answer });
  useCallStore.getState().markActive({ localStream });
  callActionInProgress = false;
}

export function declineCall() {
  const { callId, conversationId } = useCallStore.getState();
  getSocket()?.emit("call:decline", { callId, conversationId });
  teardownPeerConnection();
  useCallStore.getState().reset();
}

export function endCall() {
  const { callId, conversationId } = useCallStore.getState();
  if (callId) {
    getSocket()?.emit("call:end", { callId, conversationId });
  }
  teardownPeerConnection();
  useCallStore.getState().reset();
}

export function useCallSignalingListeners() {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    async function handleAccepted({ sdpAnswer }) {
      if (!peerConnection) return;
      stopRingtone();
      await peerConnection.setRemoteDescription(sdpAnswer);
      for (const candidate of pendingCandidates) {
        await peerConnection.addIceCandidate(candidate);
      }
      pendingCandidates = [];
      useCallStore.getState().markActive({});
    }

    function handleIncoming(payload) {
      startRingtone("incoming");
      useCallStore.getState().receiveIncoming(payload);
    }

    async function handleIceCandidate({ candidate }) {
      if (peerConnection?.remoteDescription) {
        await peerConnection.addIceCandidate(candidate);
      } else {
        pendingCandidates.push(candidate);
      }
    }

    function handleTerminated() {
      teardownPeerConnection();
      useCallStore.getState().reset();
    }

    socket.on("call:incoming", handleIncoming);
    socket.on("call:accepted", handleAccepted);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:declined", handleTerminated);
    socket.on("call:ended", handleTerminated);
    socket.on("call:missed", handleTerminated);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:accepted", handleAccepted);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:declined", handleTerminated);
      socket.off("call:ended", handleTerminated);
      socket.off("call:missed", handleTerminated);
    };
  }, []);
}
