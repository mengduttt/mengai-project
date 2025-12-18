import React from 'react';
import { motion } from 'framer-motion';

// === SKELETON LOADER COMPONENTS ===

// Basic skeleton pulse animation
const shimmer = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1 },
    transition: { repeat: Infinity, repeatType: "reverse", duration: 1 }
};

// Single line skeleton
export const SkeletonLine = ({ width = "100%", height = "16px", className = "" }) => (
    <motion.div
        {...shimmer}
        className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg ${className}`}
        style={{ width, height }}
    />
);

// Message skeleton (for chat loading)
export const SkeletonMessage = ({ isUser = false }) => (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-5xl mx-auto`}>
        {/* Avatar skeleton */}
        <motion.div
            {...shimmer}
            className={`w-10 h-10 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 flex-shrink-0 ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'}`}
        />
        
        {/* Message bubble skeleton */}
        <div className={`px-6 py-4 rounded-3xl ${isUser ? 'rounded-tr-none bg-blue-600/20' : 'rounded-tl-none bg-white/5'} ${isUser ? 'max-w-[60%]' : 'max-w-[80%]'} space-y-3`}>
            <SkeletonLine width={isUser ? "150px" : "200px"} height="14px" />
            {!isUser && (
                <>
                    <SkeletonLine width="90%" height="14px" />
                    <SkeletonLine width="75%" height="14px" />
                    <SkeletonLine width="60%" height="14px" />
                </>
            )}
        </div>
    </div>
);

// History item skeleton (for sidebar)
export const SkeletonHistoryItem = () => (
    <div className="p-3.5 rounded-xl flex items-center gap-3">
        <motion.div
            {...shimmer}
            className="w-4 h-4 rounded bg-gradient-to-r from-white/5 via-white/10 to-white/5 flex-shrink-0"
        />
        <SkeletonLine width="80%" height="14px" />
    </div>
);

// Chat history loading skeleton
export const SkeletonHistory = ({ count = 5 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonHistoryItem key={i} />
        ))}
    </div>
);

// Messages loading skeleton
export const SkeletonMessages = () => (
    <div className="space-y-6 p-6">
        <SkeletonMessage isUser={true} />
        <SkeletonMessage isUser={false} />
        <SkeletonMessage isUser={true} />
        <SkeletonMessage isUser={false} />
    </div>
);

// Card skeleton (generic)
export const SkeletonCard = ({ className = "" }) => (
    <motion.div
        {...shimmer}
        className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl p-6 ${className}`}
    >
        <div className="space-y-3">
            <SkeletonLine width="60%" height="20px" />
            <SkeletonLine width="100%" height="14px" />
            <SkeletonLine width="80%" height="14px" />
        </div>
    </motion.div>
);

export default {
    SkeletonLine,
    SkeletonMessage,
    SkeletonHistoryItem,
    SkeletonHistory,
    SkeletonMessages,
    SkeletonCard
};
