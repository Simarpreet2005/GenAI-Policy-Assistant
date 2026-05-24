import { motion } from 'framer-motion';

export const WorkflowCard = ({ icon, title, status, color, glow, glowClass, message }) => {
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
