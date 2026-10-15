import React, { useState } from 'react';
import { useRooms } from '../../context/RoomContext';

export default function EnquiriesView() {
  const { enquiries, sendMessage, viewRoomDetails } = useRooms();
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(enquiries[0]?.id || null);
  const [inputText, setInputText] = useState('');

  const currentEnquiry = enquiries.find(e => e.id === selectedEnquiryId) || enquiries[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentEnquiry) return;
    sendMessage(currentEnquiry.id, inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col w-full px-gutter-mobile py-4 max-w-5xl mx-auto h-[calc(100vh-140px)] min-h-[500px]">
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold uppercase tracking-wide">
          <span className="material-symbols-outlined text-[14px]">chat</span>
          Direct Messages
        </span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold mt-1">
          Host Enquiries &amp; Chats
        </h1>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-lowest rounded-3xl border border-surface-container-high/40 shadow-sm overflow-hidden">
        {/* Conversations List */}
        <div className="border-r border-surface-container-high/40 flex flex-col overflow-y-auto">
          <div className="p-3 bg-surface-container-low font-label-md text-label-md font-bold text-on-surface">
            Active Chats ({enquiries.length})
          </div>
          <div className="flex flex-col divide-y divide-surface-container-high/30">
            {enquiries.map((enq) => {
              const isSelected = enq.id === currentEnquiry?.id;
              return (
                <div
                  key={enq.id}
                  onClick={() => setSelectedEnquiryId(enq.id)}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <img
                    src={enq.hostAvatar}
                    alt={enq.hostName}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-label-md text-label-md font-bold text-on-surface truncate">
                        {enq.hostName}
                      </h4>
                      <span className="font-body-sm text-[11px] text-outline shrink-0">
                        {enq.timestamp}
                      </span>
                    </div>
                    <p className="font-label-sm text-[11px] text-primary truncate">
                      {enq.propertyTitle}
                    </p>
                    <p className="font-body-sm text-[12px] text-on-surface-variant truncate mt-0.5">
                      {enq.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Thread */}
        {currentEnquiry && (
          <div className="md:col-span-2 flex flex-col h-full bg-surface">
            {/* Header */}
            <div className="p-3 bg-surface-container-lowest border-b border-surface-container-high/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentEnquiry.hostAvatar}
                  alt={currentEnquiry.hostName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-surface leading-tight">
                    {currentEnquiry.hostName}
                  </h4>
                  <button
                    onClick={() => viewRoomDetails(currentEnquiry.propertyId)}
                    className="font-label-sm text-[11px] text-primary hover:underline block text-left"
                  >
                    {currentEnquiry.propertyTitle} →
                  </button>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {currentEnquiry.messages.map((msg) => {
                const isMe = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl shadow-xs text-body-md ${
                        isMe
                          ? 'bg-primary text-on-primary rounded-br-none'
                          : 'bg-surface-container-lowest text-on-surface border border-surface-container-high/40 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-outline mt-0.5 px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-surface-container-lowest border-t border-surface-container-high/40 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${currentEnquiry.hostName}...`}
                className="flex-1 bg-surface-container-low px-4 py-2.5 rounded-full font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
