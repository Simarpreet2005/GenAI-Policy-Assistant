import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, FolderOpen, Clock, AlertTriangle, Settings,
  Plus, MoreVertical, Send, ShieldCheck, Search, FileText,
  CheckCircle, ChevronRight, Sun, User, Paperclip, ExternalLink, Sparkles,
  Menu, Activity, X
} from 'lucide-react';
import { mockChatRequest } from '../services/mockApi';

const ChatDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, workflowStatus]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    const newUserMsg = { 
      id: Date.now(), 
      role: 'user', 
      text: userText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);
    setWorkflowStatus({ step: 0 });
    
    // Auto-open workflow panel on mobile when sending a message
    if (window.innerWidth < 1280) {
      setWorkflowOpen(true);
    }

    try {
      const data = await mockChatRequest(userText, (step) => {
        setWorkflowStatus({ step });
      });

      setWorkflowStatus({ step: 4 });
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        ...data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      // Auto-close workflow panel on mobile shortly after completion
      if (window.innerWidth < 1280) {
        setTimeout(() => setWorkflowOpen(false), 2000);
      }
    } catch (error) {
      setIsTyping(false);
      setWorkflowStatus(null);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        answer: "Error connecting to the compliance service. Please try again.",
        riskLevel: "High",
        citations: [],
        retrievedChunks: [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex justify-center bg-background text-textMain selection:bg-primary/20 overflow-hidden">
      <div className="w-full max-w-[1600px] h-full flex px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 gap-5 lg:gap-6 relative">
        
        {/* MOBILE OVERLAY */}
        {(sidebarOpen || workflowOpen) && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm"
            onClick={() => { setSidebarOpen(false); setWorkflowOpen(false); }}
          />
        )}

        {/* LEFT SIDEBAR */}
        <aside className={`
          fixed lg:static top-0 left-0 h-full w-[280px] flex-shrink-0 flex flex-col gap-4 lg:gap-5 z-50 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#0a0b10] lg:bg-transparent shadow-2xl lg:shadow-none p-4 lg:p-0
        `}>
          {/* Header / Logo */}
          <div className="glass-panel p-5 flex items-center justify-between rounded-[20px] shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles size={20} className="fill-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-[16px] leading-tight">ComplyAI</h2>
                <p className="text-[12px] text-textMuted font-medium uppercase tracking-wider mt-0.5">Policy Assistant</p>
              </div>
            </div>
            <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <div className="glass-panel flex-1 py-5 flex flex-col gap-2 overflow-y-auto custom-scrollbar rounded-[20px] shadow-lg">
            <div className="px-5 mb-4 shrink-0">
              <button
                onClick={() => { setMessages([]); setWorkflowStatus(null); setInput(''); setSidebarOpen(false); }}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} /> New Chat
              </button>
            </div>

            <div className="px-3 flex flex-col gap-1.5 shrink-0">
              <NavItem icon={<MessageSquare size={18} />} label="Chat" active />
              <NavItem icon={<FolderOpen size={18} />} label="Policy Documents" />
              <NavItem icon={<Clock size={18} />} label="Recent Sessions" />
              <NavItem icon={<AlertTriangle size={18} />} label="Risk Dashboard" />
              <div className="my-4 border-t border-white/[0.05] mx-4"></div>
              <NavItem icon={<Settings size={18} />} label="Settings" />
            </div>

            <div className="mt-auto px-5 pt-4 shrink-0">
              <div className="glass-card p-4 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-colors rounded-xl border border-white/5">
                <div>
                  <p className="text-[13px] text-green-400 font-medium">Active <span className="text-textMuted font-normal ml-1">Mock Mode</span></p>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="glass-panel p-4 flex items-center justify-between rounded-[20px] shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                A
              </div>
              <div>
                <p className="font-semibold text-white leading-tight text-[14px]">Admin User</p>
                <p className="text-[12px] text-textMuted mt-0.5">Compliance Officer</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </aside>

        {/* CENTER CHAT AREA */}
        <main className="flex-1 flex flex-col gap-4 lg:gap-5 min-w-0 h-full relative z-10">
          {/* Header */}
          <header className="glass-panel px-4 md:px-6 py-4 flex items-center justify-between rounded-[20px] shadow-lg shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <button className="lg:hidden p-2 -ml-2 text-textMuted hover:text-white" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-primary/20 hidden sm:flex items-center justify-center text-primary shadow-inner-light">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h1 className="font-bold text-white text-[16px] md:text-[18px]">Policy Compliance Assistant</h1>
                <p className="text-[12px] md:text-[13px] text-textMuted mt-0.5">AI-Powered Policy Analysis & Compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 glass-card p-1.5 rounded-full">
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-textMuted hover:text-white transition-colors">
                  <Sun size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full glass shadow-sm text-white">
                  <Sparkles size={16} />
                </button>
              </div>
              <button 
                className="xl:hidden p-2 text-primary hover:text-white bg-primary/10 rounded-xl border border-primary/20" 
                onClick={() => setWorkflowOpen(true)}
              >
                <Activity size={20} />
              </button>
            </div>
          </header>

          {/* Chat Messages Container */}
          <div className="flex-1 glass-panel flex flex-col overflow-hidden rounded-[20px] shadow-lg">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8">
              <AnimatePresence>
                {messages.length === 0 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="m-auto text-center text-textMuted flex flex-col items-center gap-5"
                  >
                    <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-2 shadow-inner-light">
                      <ShieldCheck size={36} className="text-primary/70" />
                    </div>
                    <p className="text-[15px] md:text-[16px] max-w-md leading-relaxed">
                      How can I assist with policy compliance today?
                    </p>
                  </motion.div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mt-1 rounded-full flex items-center justify-center shadow-lg shadow-primary/10">
                      {msg.role === 'user' ? (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-gray-300 shadow-inner-light"><User size={16} className="md:w-[18px] md:h-[18px]" /></div>
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary border border-white/10 flex items-center justify-center text-white shadow-inner-light"><Sparkles size={16} className="fill-white md:w-[18px] md:h-[18px]" /></div>
                      )}
                    </div>

                    <div className={`flex flex-col gap-1.5 w-full min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.role === 'user' ? (
                        <div className="bg-gradient-to-r from-primary to-secondary text-white px-5 py-3.5 md:px-6 md:py-4 rounded-[20px] rounded-tr-[4px] shadow-[0_4px_15px_rgba(59,130,246,0.15)] inline-block max-w-full break-words">
                          <p className="text-[14px] md:text-[15px] leading-relaxed">{msg.text}</p>
                        </div>
                      ) : (
                        <div className="glass-card w-full p-4 md:p-6 flex flex-col gap-5 text-textMain border-white/[0.08] bg-[#11131a]/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-[20px] rounded-tl-[4px]">
                          <p className="text-[14px] md:text-[15px] leading-relaxed tracking-wide text-gray-100">{msg.answer || msg.text}</p>

                          {msg.riskLevel && (
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] md:text-[13px] font-semibold tracking-wide shadow-sm border ${
                                msg.riskLevel.toLowerCase() === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                msg.riskLevel.toLowerCase() === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                'bg-green-500/10 border-green-500/30 text-green-400'
                              }`}>
                                <AlertTriangle size={15} /> Risk Level: <span className="uppercase">{msg.riskLevel}</span>
                              </span>
                            </div>
                          )}

                          {msg.citations && msg.citations.length > 0 && (
                            <div className="glass-card border-white/5 bg-white/[0.02] p-4 md:p-5 flex flex-col gap-3 rounded-[16px]">
                              <p className="text-[12px] md:text-[13px] font-semibold text-textMuted uppercase tracking-wider flex items-center gap-1.5"><ExternalLink size={14} /> Citations</p>
                              <div className="flex flex-col gap-2.5">
                                {msg.citations.map((cit, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/20 border border-white/5 p-3.5 rounded-xl text-[13px] md:text-[14px] hover:bg-black/30 transition-colors gap-3 sm:gap-0">
                                    <span className="font-medium text-gray-200 leading-snug">{cit.title} <span className="text-gray-500 font-normal mx-1 hidden sm:inline">-</span> <span className="text-gray-400 font-normal block sm:inline mt-1 sm:mt-0">{cit.section}</span></span>
                                    <div className="flex items-center gap-3 text-gray-400">
                                      <span className="bg-white/5 px-2.5 py-1 rounded-md text-[11px] md:text-[12px] font-medium text-gray-300 border border-white/5 shadow-inner-light whitespace-nowrap">P. {cit.page}</span>
                                      <ExternalLink size={16} className="cursor-pointer hover:text-white transition-colors" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.retrievedChunks && msg.retrievedChunks.length > 0 && (
                            <div className="glass-card border-secondary/20 bg-secondary/[0.03] p-4 md:p-5 flex flex-col gap-3 rounded-[16px] shadow-[inset_0_0_20px_rgba(139,92,246,0.02)]">
                              <p className="text-[12px] md:text-[13px] font-semibold text-secondary/80 uppercase tracking-wider flex items-center gap-1.5"><FileText size={14} /> Retrieved Policy Chunks</p>
                              <div className="flex flex-col gap-3">
                                {msg.retrievedChunks.map((chunk, idx) => (
                                  <div key={idx} className="bg-black/20 border border-secondary/10 p-4 rounded-xl text-[13px] md:text-[14px]">
                                    <p className="text-gray-300 mb-2.5 leading-relaxed italic">"{chunk.text}"</p>
                                    <p className="text-[11px] md:text-[12px] text-secondary font-medium tracking-wide">{chunk.source}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] md:text-[12px] text-gray-500 px-2 font-medium tracking-wide mt-1">{msg.time}</span>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 md:gap-4 max-w-[85%]"
                  >
                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mt-1 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/10 border border-white/10">
                      <Sparkles size={16} className="fill-white md:w-[18px] md:h-[18px]" />
                    </div>
                    <div className="glass-card px-5 py-4 flex items-center gap-2 mt-1 h-12 bg-[#11131a]/80 rounded-[20px] rounded-tl-[4px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 pt-2 shrink-0 relative z-20">
              <div className="relative pointer-events-auto max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-[20px] blur-md -z-10 pointer-events-none"></div>
                <div className="flex items-end gap-3 glass-card bg-[#1a1c24]/95 p-2 rounded-[20px] shadow-lg border-white/10 focus-within:border-white/20 focus-within:bg-[#1a1c24] transition-all relative z-10 pointer-events-auto">
                  <button className="p-3 text-textMuted hover:text-white rounded-xl hover:bg-white/5 transition-colors hidden sm:block">
                    <Paperclip size={20} />
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask a compliance question..."
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 py-3.5 px-2 text-white placeholder:text-textMuted text-[14px] md:text-[15px] custom-scrollbar"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-3.5 mb-0.5 mr-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-[0_4px_10px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 disabled:transform-none shrink-0"
                  >
                    <Send size={18} className="ml-0.5" />
                  </button>
                </div>
              </div>
              <div className="text-center mt-4 text-[12px] md:text-[13px] text-textMuted tracking-wide font-medium px-4">
                 AI-generated responses may contain errors. Always confirm critical policy details.
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL - AGENT WORKFLOW */}
        <aside className={`
          fixed xl:static top-0 right-0 h-full w-full sm:w-[360px] xl:w-[320px] flex-shrink-0 glass-panel flex flex-col p-5 md:p-6 xl:p-6 shadow-2xl xl:shadow-lg z-50 transition-transform duration-300
          ${workflowOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
          bg-[#0a0b10] xl:bg-transparent rounded-none xl:rounded-[20px]
        `}>
          <div className="flex items-center justify-between mb-8 px-1 mt-2">
            <h3 className="font-bold text-white text-[16px]">Agent Workflow</h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border shadow-sm ${
                workflowStatus?.step === 4 ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10' :
                workflowStatus !== null ? 'bg-primary/10 text-primary border-primary/20 shadow-primary/10 animate-pulse' :
                'bg-white/5 text-gray-400 border-white/10'
              }`}>
                {workflowStatus?.step === 4 ? 'Completed' : workflowStatus !== null ? `Step ${workflowStatus.step + 1}/4 Active` : 'Ready'}
              </span>
              <button className="xl:hidden p-2 -mr-2 text-gray-400 hover:text-white bg-white/5 rounded-full" onClick={() => setWorkflowOpen(false)}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative px-1">
            {/* Vertical Line */}
            <div className="absolute left-[26px] top-4 bottom-10 w-[2px] bg-white/5 z-0"></div>

            <div className="flex flex-col gap-6 relative z-10">
              <WorkflowCard
                icon={<Search size={16} />}
                title="Retrieval Agent"
                isActive={workflowStatus?.step === 0}
                isCompleted={workflowStatus?.step > 0}
                color="bg-primary"
                glow="shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                glowClass="from-primary"
                message="Searching policy database and retrieving relevant documents."
              />
              <WorkflowCard
                icon={<ShieldCheck size={16} />}
                title="Compliance Agent"
                isActive={workflowStatus?.step === 1}
                isCompleted={workflowStatus?.step > 1}
                color="bg-secondary"
                glow="shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                glowClass="from-secondary"
                message="Analyzing policies and evaluating compliance requirements."
              />
              <WorkflowCard
                icon={<AlertTriangle size={16} />}
                title="Risk Analysis Agent"
                isActive={workflowStatus?.step === 2}
                isCompleted={workflowStatus?.step > 2}
                color="bg-orange-500"
                glow="shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                glowClass="from-orange-500"
                message="Assessing policy conflicts and calculating risk severity."
              />
              <WorkflowCard
                icon={<FileText size={16} />}
                title="Summary Agent"
                isActive={workflowStatus?.step === 3}
                isCompleted={workflowStatus?.step > 3}
                color="bg-accent1"
                glow="shadow-[0_0_15px_rgba(244,114,182,0.2)]"
                glowClass="from-accent1"
                message="Generating final response with citations."
              />
            </div>

            {workflowStatus?.step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="mt-10 p-5 rounded-[16px] glass-card border-green-500/30 bg-green-500/5 flex gap-4 items-center shadow-[0_4px_20px_rgba(34,197,94,0.1)]"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white mb-1">Workflow Complete</p>
                  <p className="text-[12px] text-green-400 font-medium">All agents executed successfully</p>
                </div>
              </motion.div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <button className={`flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl transition-all text-[14px] md:text-[15px] font-medium ${active
    ? 'bg-white/10 text-white shadow-inner-light border border-white/5'
    : 'text-textMuted hover:bg-white/5 hover:text-gray-200'
    }`}>
    <span className={`${active ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-textMuted'}`}>
      {icon}
    </span>
    {label}
  </button>
);

const WorkflowCard = ({ icon, title, isActive, isCompleted, color, glow, glowClass, message }) => {
  const showContent = isActive || isCompleted;

  return (
    <div className="flex gap-4">
      <div className="relative mt-2">
        <div className={`w-[20px] h-[20px] rounded-full border-[3px] border-[#0a0b10] shadow-sm flex items-center justify-center relative z-10 transition-colors duration-500 ${isCompleted ? color : isActive ? color + ' animate-pulse ' + glow : 'bg-white/10'
          }`}>
          {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0.5, y: 5 }}
        animate={{ opacity: showContent ? 1 : 0.5, y: 0 }}
        className={`flex-1 glass-card p-4 md:p-5 rounded-[16px] text-[13px] md:text-[14px] transition-all duration-500 ${isActive ? 'shadow-lg border-white/15 bg-white/[0.06] ' + glow : 'bg-white/[0.02] border-white/[0.04]'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm border border-white/10 ${color} ${isActive ? 'opacity-100 ' + glow : isCompleted ? 'opacity-80' : 'opacity-40'}`}>
              {icon}
            </div>
            <h4 className="font-bold text-white tracking-wide">{title}</h4>
          </div>
          {isCompleted ? (
            <span className="text-[11px] text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 font-semibold tracking-wide">Done</span>
          ) : isActive ? (
            <span className="text-[11px] text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 font-semibold tracking-wide animate-pulse">Active</span>
          ) : null}
        </div>
        {showContent && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-gray-300/90 mt-2.5 leading-relaxed text-[13px]">
            {message}
          </motion.div>
        )}

        {/* Glowing bottom line indicator for completed cards */}
        {isCompleted && (
          <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${glowClass} to-transparent opacity-60 shadow-[0_0_8px_currentColor]`}></div>
        )}
      </motion.div>
    </div>
  );
};

export default ChatDashboard;
