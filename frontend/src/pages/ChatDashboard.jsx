import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, FolderOpen, Clock, AlertTriangle,
  Plus, MoreVertical, Send, ShieldCheck, Search, FileText,
  CheckCircle, ChevronRight, Sun, Moon, User, ExternalLink, Sparkles,
  Menu, Activity, X, ChevronDown, Mic, Volume2, VolumeX
} from 'lucide-react';
import { mockChatRequest } from '../services/mockApi';
import { useTheme } from '../hooks/useTheme';

const ChatDashboard = () => {
  const { theme, toggleTheme } = useTheme();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState('chat'); // 'chat' | 'documents' | 'risk'

  // Sessions and History state
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('complyai-sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem('complyai-current-session-id');
      return saved || '';
    } catch {
      return '';
    }
  });

  const [sessionSearch, setSessionSearch] = useState('');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);

  // Workflow State Controller
  const [workflow, setWorkflow] = useState({
    status: 'idle', // 'idle' | 'running' | 'completed'
    currentStep: -1,
    steps: [
      { id: 0, title: "Retrieval Agent", status: "pending", message: "Searching policy database and retrieving relevant documents." },
      { id: 1, title: "Compliance Evaluation Agent", status: "pending", message: "Analyzing policies and evaluating compliance requirements." },
      { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy conflicts and calculating risk severity." },
      { id: 3, title: "Summary Generation Agent", status: "pending", message: "Generating final response with citations." }
    ]
  });

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Derive messages from active session
  const activeSession = sessions.find(s => s.id === currentSessionId);
  const messages = useMemo(() => activeSession ? activeSession.messages : [], [activeSession]);

  // Sync currentSessionId in localStorage
  useEffect(() => {
    try {
      if (currentSessionId) {
        localStorage.setItem('complyai-current-session-id', currentSessionId);
      } else {
        localStorage.removeItem('complyai-current-session-id');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentSessionId]);

  // Setup Web Speech API SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      rec.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied.');
        } else {
          setSpeechError('Speech recognition error encountered.');
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    // Cleanup SpeechSynthesis
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, workflow]);

  // Auto-resize input textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const saveSessions = (updatedSessions) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem('complyai-sessions', JSON.stringify(updatedSessions));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewSession = () => {
    const newSession = {
      id: `session_${Date.now()}`,
      title: 'New Compliance Chat',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setCurrentSessionId(newSession.id);
    setWorkflow({
      status: 'idle',
      currentStep: -1,
      steps: [
        { id: 0, title: "Retrieval Agent", status: "pending", message: "Searching policy database and retrieving relevant documents." },
        { id: 1, title: "Compliance Evaluation Agent", status: "pending", message: "Analyzing policies and evaluating compliance requirements." },
        { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy conflicts and calculating risk severity." },
        { id: 3, title: "Summary Generation Agent", status: "pending", message: "Generating final response with citations." }
      ]
    });
    setInput('');
    setCurrentTab('chat');
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (currentSessionId === id) {
      if (updated.length > 0) {
        setCurrentSessionId(updated[0].id);
      } else {
        setCurrentSessionId('');
      }
    }
  };

  const addMessageToActiveSession = (newMsg) => {
    let activeId = currentSessionId;
    let updatedSessions;

    if (!activeId) {
      // Create session on first message
      activeId = `session_${Date.now()}`;
      const newSession = {
        id: activeId,
        title: newMsg.role === 'user' ? (newMsg.text.substring(0, 30) + (newMsg.text.length > 30 ? '...' : '')) : 'Compliance Chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [newMsg]
      };
      updatedSessions = [newSession, ...sessions];
      setCurrentSessionId(activeId);
    } else {
      updatedSessions = sessions.map(s => {
        if (s.id === activeId) {
          const updatedMessages = [...s.messages, newMsg];
          let title = s.title;
          if ((s.title === 'New Compliance Chat' || s.title === 'Compliance Chat') && newMsg.role === 'user') {
            title = newMsg.text.substring(0, 30) + (newMsg.text.length > 30 ? '...' : '');
          }
          return {
            ...s,
            title,
            messages: updatedMessages,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return s;
      });
    }

    saveSessions(updatedSessions);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const userText = input;
    const newUserMsg = {
      id: Date.now(),
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addMessageToActiveSession(newUserMsg);
    setInput('');
    setIsTyping(true);

    // Initialize workflow log status
    setWorkflow({
      status: 'running',
      currentStep: 0,
      steps: [
        { id: 0, title: "Retrieval Agent", status: "active", message: "Connecting to vector index..." },
        { id: 1, title: "Compliance Evaluation Agent", status: "pending", message: "Analyzing policies and evaluating compliance requirements." },
        { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy conflicts and calculating risk severity." },
        { id: 3, title: "Summary Generation Agent", status: "pending", message: "Generating final response with citations." }
      ]
    });

    if (window.innerWidth < 1280) {
      setWorkflowOpen(true);
    }

    try {
      const data = await mockChatRequest(userText, (stepIndex, status, message) => {
        setWorkflow(prev => {
          const updatedSteps = prev.steps.map(step => {
            if (step.id === stepIndex) {
              return { ...step, status, message };
            }
            if (step.id < stepIndex) {
              return { ...step, status: 'completed' };
            }
            return step;
          });
          return {
            ...prev,
            currentStep: stepIndex,
            steps: updatedSteps
          };
        });
      });

      setWorkflow(prev => ({
        status: 'completed',
        currentStep: 4,
        steps: prev.steps.map(step => ({ ...step, status: 'completed' }))
      }));

      setIsTyping(false);

      const newAiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        ...data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      addMessageToActiveSession(newAiMsg);

      if (window.innerWidth < 1280) {
        setTimeout(() => setWorkflowOpen(false), 2500);
      }
    } catch {
      setIsTyping(false);
      setWorkflow(prev => ({ ...prev, status: 'idle', currentStep: -1 }));
      const errorMsg = {
        id: Date.now() + 1,
        role: 'ai',
        answer: "Error connecting to the compliance service. Please try again.",
        riskLevel: "High",
        confidence: 0,
        citations: [],
        retrievedChunks: [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessageToActiveSession(errorMsg);
    }
  };

  const toggleRecording = () => {
    if (isTyping) return;

    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setSpeechError('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        setSpeechError('Failed to access microphone.');
      }
    }
  };

  const handleSpeak = (text, messageId) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = (e) => {
      console.error(e);
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Filtered Sessions List based on search
  const filteredSessions = sessions.filter(session => 
    (session.title || '').toLowerCase().includes(sessionSearch.toLowerCase())
  );

  return (
    <div className="h-[100dvh] w-full flex justify-center bg-background text-textMain selection:bg-primary/20 overflow-hidden">
      <div className="w-full max-w-[1600px] h-full flex px-2 sm:px-4 md:px-6 lg:px-8 py-2 md:py-6 lg:py-8 gap-3 sm:gap-5 lg:gap-6 relative">
        
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
          bg-mobile-panel lg:bg-transparent shadow-2xl lg:shadow-none p-4 pb-8 lg:p-0 lg:pb-4
          overflow-y-auto custom-scrollbar
        `}>
          {/* Header / Logo */}
          <div className="glass-panel p-5 flex items-center justify-between rounded-[20px] shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles size={20} className="fill-white" />
              </div>
              <div>
                <h2 className="font-bold text-textMain text-[16px] leading-tight">ComplyAI</h2>
                <p className="text-[12px] text-textMuted font-medium uppercase tracking-wider mt-0.5">Policy Assistant</p>
              </div>
            </div>
            <button className="lg:hidden p-2 text-gray-400 hover:text-textMain" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <div className="glass-panel flex-1 py-5 flex flex-col overflow-hidden rounded-[20px] shadow-lg">
            <div className="px-5 mb-4 shrink-0">
              <button
                onClick={handleNewSession}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus size={18} /> New Chat
              </button>
            </div>

            <div className="px-3 flex flex-col gap-1 shrink-0">
              <NavItem 
                icon={<MessageSquare size={18} />} 
                label="Chat" 
                active={currentTab === 'chat'} 
                onClick={() => { setCurrentTab('chat'); setSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<FolderOpen size={18} />} 
                label="Policy Documents" 
                active={currentTab === 'documents'} 
                onClick={() => { setCurrentTab('documents'); setSidebarOpen(false); }} 
              />
              <NavItem 
                icon={<AlertTriangle size={18} />} 
                label="Risk Dashboard" 
                active={currentTab === 'risk'} 
                onClick={() => { setCurrentTab('risk'); setSidebarOpen(false); }} 
              />
            </div>

            <div className="my-2 border-t border-white/[0.05] dark:border-white/[0.03] mx-4 shrink-0"></div>
            
            <div className="px-5 py-2 text-[11px] font-semibold text-textMuted uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <Clock size={13} /> Recent Sessions
            </div>

            {/* Session Search */}
            <div className="px-4 mb-3 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white/40 dark:bg-black/30 border border-panelBorder rounded-xl text-[13px] text-textMain placeholder:text-textMuted outline-none focus:border-primary/50 focus:bg-white/65 dark:focus:bg-black/40 transition-all"
                />
                {sessionSearch && (
                  <button 
                    onClick={() => setSessionSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textMuted hover:text-textMain transition-colors cursor-pointer"
                    title="Clear Search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Sessions List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 flex flex-col gap-1">
              <AnimatePresence initial={false}>
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      setSidebarOpen(false);
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      session.id === currentSessionId
                        ? 'bg-white/10 dark:bg-white/5 text-textMain border border-white/5 dark:border-white/[0.03] shadow-inner-light font-semibold'
                        : 'text-textMuted hover:bg-white/5 dark:hover:bg-white/[0.02] hover:text-textMain'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare size={15} className={session.id === currentSessionId ? 'text-primary' : 'text-textMuted'} />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-[13px] truncate pr-2">
                          {session.title || 'Compliance Chat'}
                        </span>
                        <span className="text-[10px] text-textMuted font-light mt-0.5">
                          {session.timestamp}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-textMuted hover:text-red-400 rounded-md hover:bg-white/5 dark:hover:bg-white/[0.04] transition-all"
                      title="Delete Session"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredSessions.length === 0 && (
                <div className="text-center py-6 text-[13px] text-textMuted font-light italic">
                  No sessions found
                </div>
              )}
            </div>

            <div className="mt-auto px-5 pt-4 shrink-0">
              <div className="glass-card p-4 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-colors rounded-xl border border-panelBorder">
                <div>
                  <p className="text-[13px] text-green-400 font-medium">Active <span className="text-textMuted font-normal ml-1">Mock Mode</span></p>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  <ChevronRight size={14} className="text-gray-400 group-hover:text-textMain" />
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
                <p className="font-semibold text-textMain leading-tight text-[14px]">Admin User</p>
                <p className="text-[12px] text-textMuted mt-0.5">Compliance Officer</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-textMain transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </aside>

        {/* CENTER MAIN AREA */}
        <main className="flex-1 flex flex-col gap-3 lg:gap-5 min-w-0 h-full relative z-10">
          {/* Header */}
          <header className="glass-panel px-4 md:px-6 py-4 flex items-center justify-between rounded-[20px] shadow-lg shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <button className="lg:hidden p-2 -ml-2 text-textMuted hover:text-textMain" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-primary/20 hidden sm:flex items-center justify-center text-primary shadow-inner-light">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h1 className="font-bold text-textMain text-[15px] md:text-[18px]">Policy Compliance Assistant</h1>
                <p className="text-[11px] md:text-[13px] text-textMuted mt-0.5">AI-Powered Policy Analysis & Compliance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 glass-card p-1 rounded-full border border-panelBorder bg-white/5 dark:bg-black/20">
                <button 
                  onClick={toggleTheme}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    theme === 'light' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-textMuted hover:text-textMain'
                  }`}
                  title="Switch to Light Theme"
                >
                  <Sun size={14} />
                </button>
                <button 
                  onClick={toggleTheme}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    theme === 'dark' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-textMuted hover:text-textMain'
                  }`}
                  title="Switch to Dark Theme"
                >
                  <Moon size={14} />
                </button>
              </div>
              {currentTab === 'chat' && (
                <button 
                  className="xl:hidden p-2 text-primary hover:text-textMain bg-primary/10 rounded-xl border border-primary/20 animate-pulse" 
                  onClick={() => setWorkflowOpen(true)}
                  title="View Agent Workflow"
                >
                  <Activity size={20} />
                </button>
              )}
            </div>
          </header>

          {/* Main Content Body */}
          <div className="flex-1 glass-panel flex flex-col overflow-hidden rounded-[20px] shadow-lg relative">
            
            {/* CHAT TAB CONTENT */}
            {currentTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8">
                  <AnimatePresence>
                    {/* Onboarding Empty State */}
                    {messages.length === 0 && !isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="m-auto text-center text-textMuted flex flex-col items-center gap-5 max-w-2xl px-4 py-6"
                      >
                        <div className="w-16 h-16 rounded-full glass flex items-center justify-center shadow-lg shadow-primary/10 relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
                          <ShieldCheck size={32} className="text-primary relative z-10" />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg md:text-xl font-bold text-textMain tracking-tight">AI Compliance Officer Ready</h3>
                          <p className="text-[13px] md:text-[14px] max-w-md mx-auto leading-relaxed text-textMuted font-light">
                            Ask compliance policy questions regarding leave extensions, code exposure on AI systems, business travel, or out-of-country remote work.
                          </p>
                        </div>

                        {/* Workflow Preview Card */}
                        <div className="w-full glass-card p-4 text-left border-panelBorder bg-white/[0.01]">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-3">Multi-Agent Workflow Protocol</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                            <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                              <span className="font-semibold text-textMain block mb-0.5">1. Retrieval</span>
                              <span className="text-[10px] text-textMuted leading-tight block">Vector scan policy indexes.</span>
                            </div>
                            <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                              <span className="font-semibold text-textMain block mb-0.5">2. Evaluation</span>
                              <span className="text-[10px] text-textMuted leading-tight block">Assess rule constraints.</span>
                            </div>
                            <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                              <span className="font-semibold text-textMain block mb-0.5">3. Risk Analysis</span>
                              <span className="text-[10px] text-textMuted leading-tight block">Classify risk indices.</span>
                            </div>
                            <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                              <span className="font-semibold text-textMain block mb-0.5">4. Summary</span>
                              <span className="text-[10px] text-textMuted leading-tight block">Format citable answers.</span>
                            </div>
                          </div>
                        </div>

                        {/* Suggested Prompts */}
                        <div className="w-full flex flex-col gap-2">
                          <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block text-left">Suggested Compliance Queries</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                            <button 
                              onClick={() => setInput("What is the leave policy limit for consecutive days, and how do I extend it?")}
                              className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                            >
                              "Leave extension approval limits?"
                            </button>
                            <button 
                              onClick={() => setInput("Is it permitted to paste proprietary source code or data into ChatGPT or other public AI models?")}
                              className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                            >
                              "Proprietary code sharing on public AI?"
                            </button>
                            <button 
                              onClick={() => setInput("What are the travel reimbursement meal limits and flight booking guidelines?")}
                              className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                            >
                              "Expense meal caps & business travel rules?"
                            </button>
                            <button 
                              onClick={() => setInput("Can I work remotely from another country? What is the limit and equipment allowance?")}
                              className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                            >
                              "WFH abroad limit & office setups?"
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Message List */}
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
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-gray-300 shadow-inner-light">
                              <User size={16} className="md:w-[18px] md:h-[18px]" />
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary border border-white/10 flex items-center justify-center text-white shadow-inner-light">
                              <Sparkles size={16} className="fill-white md:w-[18px] md:h-[18px]" />
                            </div>
                          )}
                        </div>

                        <div className={`flex flex-col gap-1.5 w-full min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          {msg.role === 'user' ? (
                            <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 md:px-6 md:py-4 rounded-[20px] rounded-tr-[4px] shadow-[0_4px_15px_rgba(59,130,246,0.15)] inline-block max-w-full break-words">
                              <p className="text-[14px] md:text-[15px] leading-relaxed">{msg.text}</p>
                            </div>
                          ) : (
                            <div className="glass-card w-full p-4 md:p-6 flex flex-col gap-5 text-textMain border-panelBorder bg-glass-msg shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-[20px] rounded-tl-[4px]">
                              <p className="text-[14px] md:text-[15px] leading-relaxed tracking-wide text-textMain font-light">
                                {msg.answer || msg.text}
                              </p>

                              {/* Compliance Metrics Badge & Progress Bar */}
                              {msg.riskLevel && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 p-3 bg-white/[0.01] dark:bg-black/10 border border-panelBorder rounded-xl shrink-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-wide border shadow-sm ${
                                      msg.riskLevel.toLowerCase() === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/5' :
                                      msg.riskLevel.toLowerCase() === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-orange-500/5' :
                                      'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-500/5'
                                    }`}>
                                      {msg.riskLevel.toLowerCase() === 'high' || msg.riskLevel.toLowerCase() === 'medium' ? (
                                        <AlertTriangle size={14} className="animate-pulse" />
                                      ) : (
                                        <ShieldCheck size={14} />
                                      )}
                                      <span>Risk Level: {msg.riskLevel}</span>
                                    </span>
                                  </div>
                                  <div className="flex-1 flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[12px] font-semibold text-textMuted">
                                      <span>Compliance Confidence</span>
                                      <span className="font-bold text-textMain">{msg.confidence || 85}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 dark:bg-black/40 rounded-full overflow-hidden relative">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${msg.confidence || 85}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                          msg.riskLevel.toLowerCase() === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' :
                                          msg.riskLevel.toLowerCase() === 'medium' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]' :
                                          'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Citations Expandable Accordions */}
                              {msg.citations && msg.citations.length > 0 && (
                                <div className="flex flex-col gap-2">
                                  <p className="text-[12px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                    <ExternalLink size={13} /> Citations & Policy Details
                                  </p>
                                  <div className="flex flex-col gap-2">
                                    {msg.citations.map((cit, idx) => (
                                      <CitationCard key={cit.id || idx} citation={cit} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Timestamp & Speak playback actions */}
                          <div className="flex items-center gap-3 mt-1 px-2 shrink-0">
                            <span className="text-[11px] text-textMuted font-medium tracking-wide">
                              {msg.time}
                            </span>
                            {msg.role === 'ai' && (
                              <button
                                onClick={() => handleSpeak(msg.answer || msg.text, msg.id)}
                                className={`p-1 rounded-lg transition-colors flex items-center justify-center ${
                                  speakingMessageId === msg.id 
                                    ? 'bg-primary/20 text-primary animate-pulse' 
                                    : 'text-textMuted hover:text-textMain hover:bg-white/5'
                                }`}
                                title={speakingMessageId === msg.id ? "Stop Speaking" : "Speak Response"}
                              >
                                {speakingMessageId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Shimmer skeleton for active typing state */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 md:gap-4 max-w-[85%]"
                      >
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mt-1 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg border border-white/10">
                          <Sparkles size={16} className="fill-white md:w-[18px] md:h-[18px]" />
                        </div>
                        <div className="glass-card w-full p-4 md:p-6 flex flex-col gap-4 text-textMain border-panelBorder bg-glass-msg shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-[20px] rounded-tl-[4px]">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-[12px] text-textMuted font-medium ml-2 uppercase tracking-widest animate-pulse">Running Agents...</span>
                          </div>
                          
                          {/* Loading Shimmer Skeletons */}
                          <div className="flex flex-col gap-2.5 mt-2">
                            <div className="h-4 skeleton w-[90%] rounded-md"></div>
                            <div className="h-4 skeleton w-[80%] rounded-md"></div>
                            <div className="h-4 skeleton w-[50%] rounded-md"></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-4" />
                  </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="p-3 md:p-6 pt-2 shrink-0 relative z-20 border-t border-panelBorder bg-white/[0.01] dark:bg-black/10">
                  <div className="relative pointer-events-auto max-w-4xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-[20px] blur-md -z-10 pointer-events-none"></div>
                    <div className="flex items-end gap-2.5 glass-card bg-glass-input p-2 rounded-[20px] shadow-lg border-panelBorder focus-within:border-primary/30 transition-all relative z-10 pointer-events-auto">
                      <button 
                        onClick={toggleRecording}
                        disabled={isTyping}
                        className={`p-3 rounded-xl transition-all relative shrink-0 ${
                          isRecording 
                            ? 'text-red-400 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse border border-red-500/20' 
                            : 'text-textMuted hover:text-textMain hover:bg-white/5'
                        }`}
                        title={isRecording ? "Stop Recording Voice" : "Record Voice STT"}
                      >
                        <Mic size={20} />
                      </button>
                      
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { 
                          if (e.key === 'Enter' && !e.shiftKey) { 
                            e.preventDefault(); 
                            handleSend(); 
                          } 
                        }}
                        placeholder={isRecording ? "Listening..." : "Ask a compliance or policy question..."}
                        className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 py-3 px-1 text-textMain placeholder:text-textMuted text-[14px] md:text-[15px] custom-scrollbar leading-relaxed"
                        rows={1}
                        disabled={isRecording}
                      />
                      
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping || isRecording}
                        className="p-3 mb-0.5 mr-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-[0_4px_10px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 disabled:transform-none shrink-0 cursor-pointer"
                        title="Send Message"
                      >
                        <Send size={16} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Voice transcript error indicator */}
                  {speechError && (
                    <div className="max-w-4xl mx-auto mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[12px] flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span className="flex-1 truncate">{speechError}</span>
                      <button onClick={() => setSpeechError('')} className="ml-auto hover:text-textMain hover:opacity-80 font-bold shrink-0">Dismiss</button>
                    </div>
                  )}

                  <div className="text-center mt-3 text-[11px] md:text-[12px] text-textMuted tracking-wide font-medium px-4">
                     AI-generated compliance responses. Always confirm critical policy exceptions formally.
                  </div>
                </div>
              </>
            )}

            {/* DOCUMENTS TAB CONTENT */}
            {currentTab === 'documents' && (
              <DocumentsTab />
            )}

            {/* RISK TAB CONTENT */}
            {currentTab === 'risk' && (
              <RiskDashboardTab />
            )}
          </div>
        </main>

        {/* RIGHT PANEL - AGENT WORKFLOW */}
        {currentTab === 'chat' && (
          <aside className={`
            fixed xl:static top-0 right-0 h-full w-full sm:w-[360px] xl:w-[320px] flex-shrink-0 glass-panel flex flex-col p-5 md:p-6 xl:p-6 shadow-2xl xl:shadow-lg z-50 transition-transform duration-300
            ${workflowOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
            bg-mobile-panel xl:bg-transparent rounded-none xl:rounded-[20px]
          `}>
            <div className="flex items-center justify-between mb-6 px-1 mt-2 shrink-0">
              <h3 className="font-bold text-textMain text-[16px]">Agent Workflow</h3>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border shadow-sm ${
                  workflow.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10' :
                  workflow.status === 'running' ? 'bg-primary/10 text-primary border-primary/20 shadow-primary/10 animate-pulse' :
                  'bg-white/5 text-gray-400 border-panelBorder'
                }`}>
                  {workflow.status === 'completed' ? 'Completed' : workflow.status === 'running' ? `Step ${workflow.currentStep + 1}/4` : 'Ready'}
                </span>
                <button className="xl:hidden p-2 -mr-2 text-gray-400 hover:text-textMain bg-white/5 rounded-full" onClick={() => setWorkflowOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative px-1">
              {/* Vertical Line */}
              <div className="absolute left-[26px] top-4 bottom-10 w-[2px] bg-white/5 dark:bg-white/[0.03] z-0"></div>

              <div className="flex flex-col gap-5 relative z-10">
                {workflow.steps.map((step) => {
                  let icon = <Search size={16} />;
                  let color = "bg-primary";
                  let glow = "shadow-[0_0_15px_rgba(59,130,246,0.2)]";
                  let glowClass = "from-primary";

                  if (step.id === 1) {
                    icon = <ShieldCheck size={16} />;
                    color = "bg-secondary";
                    glow = "shadow-[0_0_15px_rgba(139,92,246,0.2)]";
                    glowClass = "from-secondary";
                  } else if (step.id === 2) {
                    icon = <AlertTriangle size={16} />;
                    color = "bg-orange-500";
                    glow = "shadow-[0_0_15px_rgba(249,115,22,0.2)]";
                    glowClass = "from-orange-500";
                  } else if (step.id === 3) {
                    icon = <FileText size={16} />;
                    color = "bg-pink-500";
                    glow = "shadow-[0_0_15px_rgba(244,114,182,0.2)]";
                    glowClass = "from-pink-500";
                  }

                  return (
                    <WorkflowCard
                      key={step.id}
                      icon={icon}
                      title={step.title}
                      status={step.status}
                      color={color}
                      glow={glow}
                      glowClass={glowClass}
                      message={step.message}
                    />
                  );
                })}
              </div>

              {/* Workflow Complete Indicator */}
              {workflow.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 rounded-[16px] glass-card border-green-500/30 bg-green-500/5 flex gap-4 items-center shadow-[0_4px_20px_rgba(34,197,94,0.1)]"
                >
                  <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-textMain mb-0.5">Workflow Complete</p>
                    <p className="text-[11px] text-green-400 font-medium">All agents executed successfully</p>
                  </div>
                </motion.div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all text-[14px] md:text-[15px] font-medium cursor-pointer ${active
      ? 'bg-white/10 dark:bg-white/5 text-textMain shadow-inner-light border border-white/5 dark:border-white/[0.03]'
      : 'text-textMuted hover:bg-white/5 hover:text-textMain'
    }`}
  >
    <span className={`${active ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-textMuted'}`}>
      {icon}
    </span>
    {label}
  </button>
);

const WorkflowCard = ({ icon, title, status, color, glow, glowClass, message }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active' || status === 'processing';
  const showContent = isActive || isCompleted;

  return (
    <div className="flex gap-3">
      <div className="relative mt-2 shrink-0">
        <div className={`w-[18px] h-[18px] rounded-full border-[3px] border-background shadow-sm flex items-center justify-center relative z-10 transition-all duration-500 ${
          isCompleted ? color : isActive ? color + ' animate-pulse ' + glow : 'bg-white/10 dark:bg-white/5 border-panelBorder'
        }`}>
          {isCompleted && <div className="w-1 h-1 bg-white rounded-full"></div>}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0.5, y: 5 }}
        animate={{ opacity: showContent ? 1 : 0.5, y: 0 }}
        className={`flex-1 glass-card p-3 md:p-4 rounded-[16px] text-[12px] md:text-[13px] transition-all duration-500 ${
          isActive ? 'shadow-lg border-white/15 bg-white/[0.06] ' + glow : 'bg-white/[0.02] dark:bg-white/[0.01] border-panelBorder'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm border border-white/10 shrink-0 ${color} ${
              isActive ? 'opacity-100 ' + glow : isCompleted ? 'opacity-80' : 'opacity-30'
            }`}>
              {icon}
            </div>
            <h4 className="font-bold text-textMain tracking-wide truncate max-w-[120px] sm:max-w-[150px]">{title}</h4>
          </div>
          {isCompleted ? (
            <span className="text-[9px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold tracking-wide">Done</span>
          ) : isActive ? (
            <span className="text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 font-bold tracking-wide animate-pulse">
              {status === 'processing' ? 'Processing' : 'Active'}
            </span>
          ) : (
            <span className="text-[9px] text-textMuted bg-white/5 px-2 py-0.5 rounded-full border border-panelBorder font-bold tracking-wide">Pending</span>
          )}
        </div>
        {showContent && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="text-textMuted mt-2 leading-relaxed text-[11px] md:text-[12px]"
          >
            {message}
          </motion.div>
        )}

        {isCompleted && (
          <div className={`mt-3 h-0.5 w-full rounded-full bg-gradient-to-r ${glowClass} to-transparent opacity-60 shadow-[0_0_8px_currentColor]`}></div>
        )}
      </motion.div>
    </div>
  );
};

const CitationCard = ({ citation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-panelBorder bg-black/10 dark:bg-black/20 rounded-xl overflow-hidden transition-all shrink-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] dark:hover:bg-white/[0.01] text-left transition-colors cursor-pointer gap-3"
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-secondary shrink-0" />
          <span className="font-semibold text-textMain text-[13px] truncate leading-tight">
            {citation.title} 
            <span className="text-textMuted font-normal mx-1">—</span> 
            <span className="text-textMuted font-normal">{citation.section}</span>
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-textMuted shrink-0">
          <span className="bg-white/5 dark:bg-black/40 px-2 py-0.5 rounded text-[10px] font-bold border border-panelBorder whitespace-nowrap">
            P. {citation.page}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-3 pb-3 pt-0.5 flex flex-col gap-2.5 border-t border-panelBorder bg-black/[0.05] dark:bg-black/[0.15] text-[12px] leading-relaxed">
              <div className="flex flex-col gap-1 mt-1.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Retrieved Policy Context</span>
                <div className="p-2.5 bg-white/[0.02] dark:bg-black/20 border border-panelBorder rounded-lg text-textMain font-light italic">
                  "{citation.context}"
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-accent1 uppercase tracking-wider">Related Policy Notes</span>
                <div className="p-2.5 bg-white/[0.02] dark:bg-black/20 border border-panelBorder rounded-lg text-textMain font-light">
                  {citation.policyNotes}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   ADDITIONAL VIEW COMPONENTS (TAB PORTALS)
   ───────────────────────────────────────────────────────────── */

const DocumentsTab = () => {
  const docs = [
    {
      title: "Leave & Time Off Policy",
      section: "Section 4.2 - Extended Leaves",
      effective: "Jan 1, 2026",
      classification: "Internal",
      clauses: [
        { title: "Standard Consecutive Leave Limit", text: "Maximum consecutive paid leave is capped at 15 business days without secondary executive approval." },
        { title: "Extension Approvals", text: "Requests exceeding 15 business days must be formally submitted through the HR Portal at least 14 days in advance and approved by both the VP of HR and the Department Head." }
      ]
    },
    {
      title: "Securing Intellectual Property on Public AI Systems",
      section: "Section 8.1 - Proprietary Code Sharing",
      effective: "Oct 15, 2025",
      classification: "Confidential",
      clauses: [
        { title: "General Prohibition", text: "Uploading, pasting, or training proprietary source code, internal dataset structures, or non-public financial documents into third-party AI models (including ChatGPT, Claude, and Gemini public tiers) is strictly prohibited." },
        { title: "Approved Services", text: "Engineering personnel must only utilize enterprise-licensed, zero-data-retention instances (e.g., enterprise copilots or private tenant APIs) for assisting in coding tasks." }
      ]
    },
    {
      title: "Corporate Travel & Expense Guidelines",
      section: "Section 3.5 - Meal Allowances & Booking",
      effective: "Mar 1, 2026",
      classification: "Internal",
      clauses: [
        { title: "Meal Reimbursements Cap", text: "Daily individual meals are reimbursed up to a strict limit of $75 per day. Itemized receipts are mandatory for all transactions exceeding $25." },
        { title: "Flight Bookings", text: "All domestic flights must be booked in economy class. Business class is only permitted for continuous intercontinental flights exceeding 8 hours, subject to CFO sign-off." }
      ]
    },
    {
      title: "Flexible Work & Remote Work Policy",
      section: "Section 2.1 - Working Abroad & Allowances",
      effective: "Dec 1, 2025",
      classification: "Internal",
      clauses: [
        { title: "WFH Out of Country Cap", text: "Employees are permitted to work remotely from outside their home country for a maximum of 30 calendar days per rolling 12-month period to maintain tax compliance." },
        { title: "Home Office Allowance", text: "A one-time home office setup reimbursement of up to $500 is provided for ergonomic furniture and peripheral hardware upon submission of valid receipts." }
      ]
    }
  ];

  const [expandedDoc, setExpandedDoc] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 text-left">
      <div>
        <h3 className="text-[16px] font-bold text-textMain uppercase tracking-wider mb-1">Company Policy Index</h3>
        <p className="text-[13px] text-textMuted">Access active corporate governance documents and risk compliance rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc, idx) => (
          <div key={idx} className="glass-card p-5 border border-panelBorder flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">{doc.classification}</span>
                <h4 className="font-bold text-textMain text-[15px] leading-snug">{doc.title}</h4>
                <p className="text-[12px] text-textMuted mt-0.5">{doc.section}</p>
              </div>
              <span className="text-[11px] text-textMuted bg-white/5 dark:bg-black/20 px-2 py-0.5 rounded border border-panelBorder whitespace-nowrap">
                Eff: {doc.effective}
              </span>
            </div>

            <button
              onClick={() => setExpandedDoc(expandedDoc === idx ? null : idx)}
              className="mt-auto py-2.5 px-4 bg-white/5 dark:bg-white/[0.02] border border-panelBorder hover:border-primary/20 rounded-xl text-[12px] font-medium text-textMain transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {expandedDoc === idx ? "Hide Policy Clauses" : "View Policy Clauses"}
              <ChevronDown size={14} className={`transition-transform duration-200 ${expandedDoc === idx ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {expandedDoc === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col gap-3 pt-3 border-t border-panelBorder mt-2"
                >
                  {doc.clauses.map((clause, cIdx) => (
                    <div key={cIdx} className="p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-panelBorder text-[12px]">
                      <span className="font-bold text-secondary block mb-1">{clause.title}</span>
                      <p className="text-textMuted leading-relaxed">{clause.text}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const RiskDashboardTab = () => {
  const complianceMetrics = [
    { name: "Resource Access Control", score: 94, status: "Secure" },
    { name: "Data Protection & AI Usage", score: 58, status: "Warning" },
    { name: "Reimbursements & Finance", score: 85, status: "Secure" },
    { name: "Remote Worker Tax Compliance", score: 72, status: "Attention" }
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 text-left">
      <div>
        <h3 className="text-[16px] font-bold text-textMain uppercase tracking-wider mb-1">Risk Compliance Dashboard</h3>
        <p className="text-[13px] text-textMuted">Real-time risk scoring, policy violations, and compliance posture analysis.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-panelBorder flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <AlertTriangle size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block">Global Risk Rating</span>
            <span className="text-xl font-bold text-textMain">Medium Variance</span>
          </div>
        </div>
        
        <div className="glass-card p-5 border border-panelBorder flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block">Active Policies</span>
            <span className="text-xl font-bold text-textMain">4 Tracked Systems</span>
          </div>
        </div>

        <div className="glass-card p-5 border border-panelBorder flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block">Audit Score</span>
            <span className="text-xl font-bold text-textMain">77.25% Compliant</span>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        {/* Compliance Posture List */}
        <div className="glass-card p-5 border border-panelBorder flex flex-col gap-4">
          <h4 className="font-bold text-textMain text-[14px] uppercase tracking-wider mb-1">Compliance Domain Posture</h4>
          <div className="flex flex-col gap-4">
            {complianceMetrics.map((m, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[12px] font-semibold">
                  <span className="text-textMain">{m.name}</span>
                  <span className={m.score < 60 ? 'text-red-400' : m.score < 80 ? 'text-orange-400' : 'text-green-400'}>
                    {m.score}% ({m.status})
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 dark:bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${m.score < 60 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : m.score < 80 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Risk Ledger */}
        <div className="glass-card p-5 border border-panelBorder flex flex-col gap-4">
          <h4 className="font-bold text-textMain text-[14px] uppercase tracking-wider mb-1">Scanned Incidents Ledger</h4>
          <div className="flex flex-col gap-2.5 text-[12px]">
            <div className="p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-panelBorder flex items-center justify-between">
              <div>
                <span className="font-bold text-textMain block">ChatGPT Proprietary Code Paste</span>
                <span className="text-[11px] text-textMuted">Triggered by Developer</span>
              </div>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 uppercase">High Risk</span>
            </div>
            
            <div className="p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-panelBorder flex items-center justify-between">
              <div>
                <span className="font-bold text-textMain block">Extended Leave Request (18 days)</span>
                <span className="text-[11px] text-textMuted">Exceeds standard 15-day limit</span>
              </div>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 uppercase">Med Risk</span>
            </div>

            <div className="p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-panelBorder flex items-center justify-between">
              <div>
                <span className="font-bold text-textMain block">Out-of-Country remote work (20 days)</span>
                <span className="text-[11px] text-textMuted">Within 30-day limits</span>
              </div>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 uppercase">Low Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
