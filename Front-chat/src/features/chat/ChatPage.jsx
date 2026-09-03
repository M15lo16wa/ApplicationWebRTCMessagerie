import { useEffect, useState } from "react";
import { getSocket } from "../../api/socket.js";
import { registerConversationsListeners } from "../../store/conversationsStore.js";
import { registerPresenceListeners } from "../../store/presenceStore.js";
import { useConversationsStore } from "../../store/conversationsStore.js";
import { GroupCreateModal } from "../group/GroupCreateModal.jsx";
import { CallHistoryView } from "./CallHistoryView.jsx";
import { ChatWindow } from "./ChatWindow.jsx";
import { ContactInfoPanel } from "./ContactInfoPanel.jsx";
import { ContactsView } from "./ContactsView.jsx";
import { ConversationList } from "./ConversationList.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { IconRail } from "./IconRail.jsx";
import { ProfilePanel } from "./ProfilePanel.jsx";

export function ChatPage() {
  const [view, setView] = useState("chat");
  const [showInfo, setShowInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const activeConversationId = useConversationsStore((state) => state.activeConversationId);
  const conversations = useConversationsStore((state) => state.conversations);
  const closeConversation = useConversationsStore((state) => state.closeConversation);
  const conversation = conversations.find((c) => c.id === activeConversationId);

  const showDetail = view === "chat" && Boolean(activeConversationId);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const offPresence = registerPresenceListeners(socket);
    const offConversations = registerConversationsListeners(socket);
    return () => {
      offPresence();
      offConversations();
    };
  }, []);

  function changeView(nextView) {
    setView(nextView);
    setShowProfile(false);
    setShowInfo(false);
  }

  function goToChat() {
    changeView("chat");
  }

  return (
    <div className="h-dvh flex bg-app overflow-hidden">
      <div className={`${showDetail ? "hidden" : "flex"} w-full md:w-auto md:flex flex-shrink-0`}>
        <IconRail
          view={view}
          onChangeView={changeView}
          onOpenProfile={() => {
            setShowProfile(true);
            setShowInfo(false);
          }}
        />

        {view === "chat" && (
          <ConversationList
            onCompose={() => changeView("contacts")}
            onOpenGroupModal={() => setShowGroupModal(true)}
          />
        )}
        {view === "contacts" && <ContactsView onOpenChat={goToChat} />}
        {view === "calls" && <CallHistoryView />}
      </div>

      <div className={`${showDetail ? "flex" : "hidden"} md:flex flex-1 min-w-0`}>
        {view === "chat" ? (
          <ChatWindow
            onBack={closeConversation}
            onOpenInfo={() => {
              if (conversation) {
                setShowInfo(true);
                setShowProfile(false);
              }
            }}
          />
        ) : (
          <EmptyState
            title={view === "contacts" ? "Démarre une discussion" : "Historique des appels"}
            subtitle={
              view === "contacts"
                ? "Choisis un contact pour lui écrire, ou crée un groupe."
                : "Rappelle un contact depuis la liste à gauche."
            }
          />
        )}
      </div>

      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
      {showInfo && conversation && (
        <ContactInfoPanel conversation={conversation} onClose={() => setShowInfo(false)} />
      )}

      {showGroupModal && <GroupCreateModal onClose={() => setShowGroupModal(false)} />}
    </div>
  );
}
