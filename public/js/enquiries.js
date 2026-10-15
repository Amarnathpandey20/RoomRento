/**
 * RoomRento • Enquiries & Host Chat Controller (Vanilla JS)
 */

let conversations = [];
let activeConvIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  conversations = JSON.parse(localStorage.getItem('room_rento_chat_threads') || 'null');
  if (!conversations) {
    conversations = window.ROOM_DATA.INITIAL_ENQUIRIES || [];
  }
  renderConversations();
  renderActiveThread();
  setupChatListeners();
});

function renderConversations() {
  const listEl = document.getElementById('chat-thread-list');
  if (!listEl) return;

  listEl.innerHTML = conversations.map((conv, idx) => `
    <div class="chat-thread-item ${idx === activeConvIndex ? 'active' : ''}" onclick="selectConversation(${idx})">
      <img src="${conv.hostAvatar}" alt="${conv.hostName}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
          <strong style="font-size:0.9rem;truncate;">${conv.hostName}</strong>
          <span style="font-size:0.72rem;color:var(--text-light);">${conv.timestamp}</span>
        </div>
        <p style="font-size:0.75rem;color:var(--primary);font-weight:600;margin-bottom:2px;truncate;">${conv.propertyTitle}</p>
        <p style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${conv.lastMessage}</p>
      </div>
    </div>
  `).join('');
}

function selectConversation(index) {
  activeConvIndex = index;
  renderConversations();
  renderActiveThread();
}

function renderActiveThread() {
  const current = conversations[activeConvIndex];
  if (!current) return;

  const headerEl = document.getElementById('chat-active-header');
  if (headerEl) {
    headerEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <img src="${current.hostAvatar}" alt="${current.hostName}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
        <div>
          <strong style="font-size:0.95rem;display:block;">${current.hostName}</strong>
          <span style="font-size:0.78rem;color:var(--text-muted);">${current.propertyTitle}</span>
        </div>
      </div>
      <button class="btn-primary" style="padding:0.4rem 0.85rem;font-size:0.8rem;" onclick="openScheduleVisitModal('${current.propertyId}', '${current.propertyTitle.replace(/'/g, "\\'")}')">
        Schedule Free Visit
      </button>
    `;
  }

  const messagesEl = document.getElementById('chat-messages');
  if (messagesEl) {
    messagesEl.innerHTML = current.messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        <p>${m.text}</p>
        <span style="font-size:10px;opacity:0.7;display:block;text-align:right;margin-top:3px;">${m.time || 'Just now'}</span>
      </div>
    `).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function setupChatListeners() {
  const form = document.getElementById('chat-send-form');
  const input = document.getElementById('chat-msg-input');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      sendMessage(text);
      input.value = '';
    });
  }

  // Quick reply chips
  document.querySelectorAll('.chat-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sendMessage(chip.textContent.trim());
    });
  });
}

function sendMessage(text) {
  const current = conversations[activeConvIndex];
  if (!current) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  current.messages.push({
    id: 'm-' + Date.now(),
    sender: 'user',
    text: text,
    time: timeStr
  });
  current.lastMessage = text;
  current.timestamp = timeStr;

  saveChatState();
  renderConversations();
  renderActiveThread();

  // Host automated reply simulation
  setTimeout(() => {
    const replies = [
      "Thanks for your message! Yes, this room is currently available for move-in.",
      "Certainly! I can arrange a visit for you. What time works best?",
      "The rent includes high-speed Wi-Fi, 100% power backup, and housekeeping.",
      "I have notified our caretaker at the property. Let's connect on WhatsApp as well."
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    current.messages.push({
      id: 'm-reply-' + Date.now(),
      sender: 'host',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    current.lastMessage = replyText;
    saveChatState();
    renderConversations();
    renderActiveThread();
  }, 1000);
}

function saveChatState() {
  localStorage.setItem('room_rento_chat_threads', JSON.stringify(conversations));
}
