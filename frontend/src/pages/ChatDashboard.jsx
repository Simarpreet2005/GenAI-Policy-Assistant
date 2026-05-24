import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Clock, Plus, Send, ShieldCheck, Search,
  CheckCircle, ChevronLeft, ChevronRight, Sun, Moon, User,
  Menu, Activity, X, Mic, Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { mockChatRequest } from '../services/mockApi';
import { useTheme } from '../hooks/useTheme';
import { WorkflowCard } from '../components/WorkflowCard';
import { PlacementVerdictCard } from '../components/PlacementVerdictCard';

const ChatDashboard = () => {
  const { theme, toggleTheme } = useTheme();

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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('complyai-sidebar-collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Workflow State Controller (aligned to LPU placement agent pipeline)
  const [workflow, setWorkflow] = useState({
    status: 'idle', // 'idle' | 'running' | 'completed'
    currentStep: -1,
    steps: [
      { id: 0, title: "Retrieval Agent", status: "pending", message: "Searching LPU placement policies database and retrieving relevant rules." },
      { id: 1, title: "Eligibility Agent", status: "pending", message: "Analyzing policies and evaluating student eligibility constraints." },
      { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy exceptions, offer rejections, or backlog conflicts." },
      { id: 3, title: "Summary Agent", status: "pending", message: "Generating final response with citable guidelines." }
    ]
  });

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

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

  // Mount/Unmount reset & Speech recognition setup
  useEffect(() => {
    setIsTyping(false);
    setWorkflow({
      status: 'idle',
      currentStep: -1,
      steps: [
        { id: 0, title: "Retrieval Agent", status: "pending", message: "Searching LPU placement policies database and retrieving relevant rules." },
        { id: 1, title: "Eligibility Agent", status: "pending", message: "Analyzing policies and evaluating student eligibility constraints." },
        { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy exceptions, offer rejections, or backlog conflicts." },
        { id: 3, title: "Summary Agent", status: "pending", message: "Generating final response with citable guidelines." }
      ]
    });

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

    // Cleanup aborts and speech on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => {
      const newVal = !prev;
      try {
        localStorage.setItem('complyai-sidebar-collapsed', String(newVal));
      } catch (e) {
        console.error(e);
      }
      return newVal;
    });
  };

  const handleNewSession = () => {
    const newSessionId = `session_${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: 'New Placement Chat',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    
    setSessions(prev => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem('complyai-sessions', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setCurrentSessionId(newSessionId);
    setWorkflow({
      status: 'idle',
      currentStep: -1,
      steps: [
        { id: 0, title: "Retrieval Agent", status: "pending", message: "Searching LPU placement policies database and retrieving relevant rules." },
        { id: 1, title: "Eligibility Agent", status: "pending", message: "Analyzing policies and evaluating student eligibility constraints." },
        { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy exceptions, offer rejections, or backlog conflicts." },
        { id: 3, title: "Summary Agent", status: "pending", message: "Generating final response with citable guidelines." }
      ]
    });
    setInput('');
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id) => {
    setSessions(prevSessions => {
      const updated = prevSessions.filter(s => s.id !== id);
      try {
        localStorage.setItem('complyai-sessions', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      if (currentSessionId === id) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
        } else {
          setCurrentSessionId('');
        }
      }
      return updated;
    });
  };

  // Functional session message appender (prevent stale closures and lost messages)
  const addMessageToSession = (sessionId, newMsg) => {
    setSessions(prevSessions => {
      const sessionExists = prevSessions.some(s => s.id === sessionId);
      let updatedSessions;

      if (!sessionExists) {
        const newSession = {
          id: sessionId,
          title: newMsg.role === 'user' ? (newMsg.text.substring(0, 30) + (newMsg.text.length > 30 ? '...' : '')) : 'LPU Placement Chat',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [newMsg]
        };
        updatedSessions = [newSession, ...prevSessions];
      } else {
        updatedSessions = prevSessions.map(s => {
          if (s.id === sessionId) {
            const updatedMessages = [...s.messages, newMsg];
            let title = s.title;
            if ((s.title === 'New Placement Chat' || s.title === 'LPU Placement Chat' || s.title === 'New Chat') && newMsg.role === 'user') {
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

      try {
        localStorage.setItem('complyai-sessions', JSON.stringify(updatedSessions));
      } catch (e) {
        console.error(e);
      }
      return updatedSessions;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const userText = input;
    let sessionId = currentSessionId;
    
    // Explicit session creation prior to calling API (avoids race conditions)
    if (!sessionId) {
      sessionId = `session_${Date.now()}`;
      setCurrentSessionId(sessionId);
    }

    const newUserMsg = {
      id: Date.now(),
      role: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addMessageToSession(sessionId, newUserMsg);
    setInput('');
    setIsTyping(true);

    setWorkflow({
      status: 'running',
      currentStep: 0,
      steps: [
        { id: 0, title: "Retrieval Agent", status: "active", message: "Connecting to policy vector index..." },
        { id: 1, title: "Eligibility Agent", status: "pending", message: "Analyzing policies and evaluating student eligibility constraints." },
        { id: 2, title: "Risk Analysis Agent", status: "pending", message: "Assessing policy exceptions, offer rejections, or backlog conflicts." },
        { id: 3, title: "Summary Agent", status: "pending", message: "Generating final response with citable guidelines." }
      ]
    });

    if (window.innerWidth < 1280) {
      setWorkflowOpen(true);
    }

    // Set up AbortController to support cancellation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

      try {
    const data = await mockChatRequest(
      userText,
      (stepIndex, status, message) => {
        setWorkflow(prev => ({
          ...prev,
          currentStep: stepIndex,
          steps: prev.steps.map(step => {
            if (step.id === stepIndex)
              return { ...step, status, message };

            if (step.id < stepIndex)
              return { ...step, status: 'completed' };

            return step;
          })
        }));
      },
      controller.signal
    );

    const newAiMsg = {
      id: Date.now() + 1,
      role: 'ai',
      answer: data.answer,
      isCompliant: data.isCompliant,
      reasoning: data.reasoning,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    addMessageToSession(sessionId, newAiMsg);

} catch (err) {

    if (err.name !== 'AbortError') {
        addMessageToSession(sessionId,{
            id: Date.now()+1,
            role:'ai',
            answer:'Failed to connect.',
            isCompliant:false,
            reasoning:err.message
        });
    }

} finally {

    // ALWAYS cleanup
    setIsTyping(false);


    abortControllerRef.current = null;

    if(window.innerWidth < 1280){
        setWorkflowOpen(false);
    }
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

        {/* LEFT COLLAPSIBLE SIDEBAR */}
        <aside className={`
          fixed lg:static top-0 left-0 h-full flex-shrink-0 flex flex-col gap-4 lg:gap-5 z-50 transition-all duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-[280px] ${sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'}
          bg-mobile-panel lg:bg-transparent shadow-2xl lg:shadow-none p-4 pb-8 lg:p-0 lg:pb-4
        `}>
          {/* Sidebar Header / Toggle */}
          <div className="glass-panel p-4 flex items-center justify-between rounded-[20px] shadow-lg shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                <Sparkles size={20} className="fill-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 truncate">
                  <h2 className="font-bold text-textMain text-[15px] leading-tight truncate">PlacementAI</h2>
                  <p className="text-[10px] text-textMuted font-medium uppercase tracking-wider mt-0.5 truncate">LPU Assistant</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-textMuted hover:text-textMain hover:bg-white/5 transition-colors shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            
            <button className="lg:hidden p-2 text-gray-400 hover:text-textMain" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation & Sessions */}
          <div className="glass-panel flex-1 py-4 flex flex-col overflow-hidden rounded-[20px] shadow-lg">
            {/* New Chat Button */}
            <div className={`px-4 mb-4 shrink-0 ${sidebarCollapsed ? 'lg:px-2' : ''}`}>
              <button
                onClick={handleNewSession}
                className={`w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                  sidebarCollapsed ? 'px-0 aspect-square rounded-xl' : 'px-4'
                }`}
                title="New Placement Chat"
              >
                <Plus size={18} />
                {!sidebarCollapsed && <span>New Chat</span>}
              </button>
            </div>

            {/* Session Search */}
            {!sidebarCollapsed && (
              <div className="px-4 mb-3 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search chats..."
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
            )}

            {!sidebarCollapsed && (
              <div className="px-5 py-2 text-[11px] font-semibold text-textMuted uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                <Clock size={13} /> Recent Chats
              </div>
            )}

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
                    className={`group flex items-center justify-between rounded-xl cursor-pointer transition-all ${
                      sidebarCollapsed ? 'lg:justify-center lg:px-0 lg:py-3' : 'px-3 py-2.5'
                    } ${
                      session.id === currentSessionId
                        ? 'bg-white/10 dark:bg-white/5 text-textMain border border-white/5 dark:border-white/[0.03] shadow-inner-light font-semibold'
                        : 'text-textMuted hover:bg-white/5 dark:hover:bg-white/[0.02] hover:text-textMain'
                    }`}
                    title={sidebarCollapsed ? (session.title || 'LPU Placement Chat') : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare size={15} className={`shrink-0 ${session.id === currentSessionId ? 'text-primary' : 'text-textMuted'}`} />
                      {!sidebarCollapsed && (
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[13px] truncate pr-2">
                            {session.title || 'LPU Placement Chat'}
                          </span>
                          <span className="text-[10px] text-textMuted font-light mt-0.5">
                            {session.timestamp}
                          </span>
                        </div>
                      )}
                    </div>
                    {!sidebarCollapsed && (
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
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredSessions.length === 0 && (
                <div className="text-center py-6 text-[13px] text-textMuted font-light italic">
                  {!sidebarCollapsed ? 'No chats found' : 'Empty'}
                </div>
              )}
            </div>
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
                <h1 className="font-bold text-textMain text-[15px] md:text-[18px]">LPU Placement Assistant</h1>
                <p className="text-[11px] md:text-[13px] text-textMuted mt-0.5">AI-Powered Placement Eligibility & Policy Evaluation</p>
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
              <button 
                className="xl:hidden p-2 text-primary hover:text-textMain bg-primary/10 rounded-xl border border-primary/20 animate-pulse animate-duration-1000" 
                onClick={() => setWorkflowOpen(true)}
                title="View Agent Workflow"
              >
                <Activity size={20} />
              </button>
            </div>
          </header>

          {/* Main Chat Body */}
          <div className="flex-1 glass-panel flex flex-col overflow-hidden rounded-[20px] shadow-lg relative">
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
                      <h3 className="text-lg md:text-xl font-bold text-textMain tracking-tight">Placement Assistant Ready</h3>
                      <p className="text-[13px] md:text-[14px] max-w-md mx-auto leading-relaxed text-textMuted font-light">
                        Ask placement policy questions regarding CGPA criteria, backlog restrictions, offer rejections, or multiple placement eligibility rules.
                      </p>
                    </div>

                    {/* Workflow Preview Card */}
                    <div className="w-full glass-card p-4 text-left border-panelBorder bg-white/[0.01]">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-3">Multi-Agent Workflow Protocol</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                        <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                          <span className="font-semibold text-textMain block mb-0.5">1. Retrieval</span>
                          <span className="text-[10px] text-textMuted leading-tight block">Scan LPU placement policies.</span>
                        </div>
                        <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                          <span className="font-semibold text-textMain block mb-0.5">2. Eligibility</span>
                          <span className="text-[10px] text-textMuted leading-tight block">Evaluate academic constraints.</span>
                        </div>
                        <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                          <span className="font-semibold text-textMain block mb-0.5">3. Risk Analysis</span>
                          <span className="text-[10px] text-textMuted leading-tight block">Flag exceptions & conflicts.</span>
                        </div>
                        <div className="p-2.5 bg-white/5 dark:bg-black/20 rounded-xl border border-panelBorder">
                          <span className="font-semibold text-textMain block mb-0.5">4. Summary</span>
                          <span className="text-[10px] text-textMuted leading-tight block">Format citable answers.</span>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Prompts */}
                    <div className="w-full flex flex-col gap-2">
                      <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block text-left">Suggested Placement Queries</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        <button 
                          onClick={() => setInput("What is the CGPA eligibility criteria for placements?")}
                          className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                        >
                          "CGPA eligibility criteria?"
                        </button>
                        <button 
                          onClick={() => setInput("What are the rules for backlogs during the placement process?")}
                          className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                        >
                          "Rules for backlogs during placements?"
                        </button>
                        <button 
                          onClick={() => setInput("Are students allowed to reject a placement offer?")}
                          className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                        >
                          "Rejecting an accepted placement offer?"
                        </button>
                        <button 
                          onClick={() => setInput("Can I sit for multiple company drives if I already have an offer?")}
                          className="p-3 bg-white/5 dark:bg-black/20 border border-panelBorder rounded-xl hover:bg-white/10 dark:hover:bg-white/[0.04] hover:border-primary/30 transition-all text-[12px] text-textMain font-medium cursor-pointer"
                        >
                          "Sitting for multiple drives?"
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
                          <p className="text-[14px] md:text-[15px] leading-relaxed tracking-wide text-textMain font-light whitespace-pre-wrap">
                            {msg.answer || msg.text}
                          </p>

                          {/* Live Backend Placement Evaluation Verdict details */}
                          {msg.isCompliant !== undefined && msg.isCompliant !== null && (
                            <PlacementVerdictCard 
                              isCompliant={msg.isCompliant} 
                              reasoning={msg.reasoning} 
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Timestamp & Voice speech playback actions */}
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
                    placeholder={isRecording ? "Listening..." : "Ask a placement policy or CGPA/backlog question..."}
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
                 AI-generated placement compliance evaluations. Always confirm critical policy guidelines officially.
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL - AGENT WORKFLOW */}
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
                  icon = <Activity size={16} />;
                  color = "bg-orange-500";
                  glow = "shadow-[0_0_15px_rgba(249,115,22,0.2)]";
                  glowClass = "from-orange-500";
                } else if (step.id === 3) {
                  icon = <MessageSquare size={16} />;
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
      </div>
    </div>
  );
};

export default ChatDashboard;
