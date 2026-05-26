'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
  ArrowLeft, Users, Plus, Check, CheckCheck, Image as ImageIcon,
  FileText, Mic, Hash, Circle, MessageSquare,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useStore } from '@/stores/useStore';
import { demoUsers } from '@/lib/demo-data';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

function formatMessageTime(date: Date): string {
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday ' + format(date, 'h:mm a');
  return format(date, 'MMM d, h:mm a');
}

function formatChatTime(date: Date): string {
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MM/dd');
}

export default function ChatPage() {
  const { user, chatRooms, messages, activeChatId, setActiveChatId, sendMessage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = chatRooms.find((r) => r.id === activeChatId);
  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  const filteredRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [activeMessages.length]);

  const handleSend = () => {
    if (!messageText.trim() || !activeChatId) return;
    sendMessage(activeChatId, messageText.trim());
    setMessageText('');
    inputRef.current?.focus();
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setShowMobileChat(true);
  };

  const getOtherUser = (room: typeof chatRooms[0]) => {
    if (room.type === 'group') return null;
    const otherId = room.members.find((m) => m !== user?.uid);
    return demoUsers.find((u) => u.uid === otherId);
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: typeof activeMessages }[] = [];
    let currentDate = '';
    activeMessages.forEach((msg) => {
      const msgDate = isToday(msg.createdAt) ? 'Today' : isYesterday(msg.createdAt) ? 'Yesterday' : format(msg.createdAt, 'MMMM d, yyyy');
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, msgs: [] });
      }
      groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [activeMessages]);

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8.5rem)] flex rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.01]">
        {/* Chat list sidebar */}
        <div className={`
          w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0a0a14]/50
          ${showMobileChat ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Messages
              </h2>
              <Button variant="ghost" size="xs" icon={<Plus className="w-4 h-4" />}>
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map((room) => {
              const otherUser = getOtherUser(room);
              const isActive = room.id === activeChatId;

              return (
                <motion.div
                  key={room.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => handleSelectChat(room.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2
                    ${isActive
                      ? 'bg-indigo-500/[0.06] border-l-indigo-500'
                      : 'border-l-transparent hover:border-l-white/10'
                    }
                  `}
                >
                  <div className="relative">
                    <Avatar
                      name={room.name}
                      size="lg"
                      isOnline={room.type === 'private' ? otherUser?.isOnline : undefined}
                    />
                    {room.type === 'group' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-indigo-500/20 border-2 border-gray-900 flex items-center justify-center">
                        <Users className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white truncate">{room.name}</span>
                      {room.lastMessageAt && (
                        <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                          {formatChatTime(new Date(room.lastMessageAt))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {room.lastMessageBy === user?.uid && (
                        <CheckCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      )}
                      <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`
          flex-1 flex flex-col
          ${!showMobileChat ? 'hidden md:flex' : 'flex'}
        `}>
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a0a14]/50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowMobileChat(false); setActiveChatId(null); }}
                    className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar
                    name={activeChat.name}
                    size="md"
                    isOnline={activeChat.type === 'private' ? getOtherUser(activeChat)?.isOnline : undefined}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{activeChat.name}</h3>
                    <p className="text-xs text-gray-500">
                      {activeChat.type === 'group'
                        ? `${activeChat.members.length} members`
                        : getOtherUser(activeChat)?.isOnline
                          ? 'Online'
                          : 'Offline'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center py-4">
                      <span className="px-3 py-1 rounded-full bg-white/[0.04] text-[11px] text-gray-500 font-medium">
                        {group.date}
                      </span>
                    </div>

                    {group.msgs.map((msg, i) => {
                      const isMine = msg.senderId === user?.uid;
                      const showAvatar = !isMine && (i === 0 || group.msgs[i - 1]?.senderId !== msg.senderId);
                      const isLastInGroup = i === group.msgs.length - 1 || group.msgs[i + 1]?.senderId !== msg.senderId;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-3' : 'mb-0.5'}`}
                        >
                          {!isMine && (
                            <div className="w-7 flex-shrink-0">
                              {showAvatar && <Avatar name={msg.senderName} size="xs" />}
                            </div>
                          )}
                          <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                            {showAvatar && !isMine && activeChat.type === 'group' && (
                              <p className="text-[11px] text-indigo-400 font-medium ml-3 mb-0.5">{msg.senderName}</p>
                            )}
                            <div
                              className={`
                                px-3.5 py-2 text-sm leading-relaxed
                                ${isMine
                                  ? `bg-gradient-to-br from-indigo-600 to-indigo-700 text-white ${isLastInGroup ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
                                  : `bg-white/[0.06] text-gray-200 ${isLastInGroup ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
                                }
                              `}
                            >
                              {msg.text}
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                                <span className="text-[10px] opacity-50">
                                  {format(msg.createdAt, 'h:mm a')}
                                </span>
                                {isMine && (
                                  <CheckCheck className="w-3 h-3 text-indigo-300/60" />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator area */}
              <AnimatePresence>
                {activeChatId === 'chat-1' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4"
                  >
                    <div className="flex items-center gap-2 py-1.5">
                      <div className="flex gap-0.5">
                        {[0, 0.2, 0.4].map((delay) => (
                          <motion.div
                            key={delay}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay }}
                            className="w-1.5 h-1.5 rounded-full bg-gray-500"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Sarah is typing...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message input */}
              <div className="p-4 border-t border-white/[0.06] bg-[#0a0a14]/50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    className={`p-2.5 rounded-xl transition-all ${
                      messageText.trim()
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-white/[0.04] text-gray-600'
                    }`}
                  >
                    {messageText.trim() ? (
                      <Send className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-6"
              >
                <MessageSquare className="w-12 h-12 text-indigo-400/50" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Select a conversation to start messaging or create a new chat
              </p>
              <Button variant="outline" size="sm" className="mt-6" icon={<Plus className="w-4 h-4" />}>
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
