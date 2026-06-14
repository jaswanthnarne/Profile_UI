import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Skill icon mapping using inline SVGs
const skillIcons = {
  cpu: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  network: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  ),
  database: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.128 16.556 18 12 18s-8.25-1.872-8.25-4.125v-3.75" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.969 5.969 0 01-5.384-3.182m0 0a5.969 5.969 0 01-5.384 3.182" />
    </svg>
  ),
};

export default function SkillCard({ skillName, description, topics, icon, image, showTopics = true }) {
  const cardRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const rotateX = useTransform(mouseY, [0, 420], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 380], [-8, 8]);

  const springConfig = { stiffness: 260, damping: 20 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const glowX = useTransform(mouseX, [0, 380], [0, 100]);
  const glowY = useTransform(mouseY, [0, 420], [0, 100]);

  const iconElement = skillIcons[icon] || skillIcons.cpu;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative rounded-2xl bg-white border border-surface-200 shadow-soft overflow-hidden transition-shadow duration-300 hover:shadow-elevated cursor-default group"
    >
      {/* Inner card with translated Z for depth */}
      <div
        style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
        className="relative"
      >
        {/* Grid pattern texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

        {/* Glow effect that follows the cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(120px at ${glowX}% ${glowY}%, rgba(59,130,246,0.12), transparent 60%)`,
          }}
        />

        {/* Card Header */}
        <div className="relative z-10 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white p-6 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-brand-200">{iconElement}</span>
              <span className="text-[10px] tracking-widest text-brand-200 font-extrabold uppercase">Skill</span>
            </div>
            <h3
              className="font-display text-2xl font-extrabold tracking-tight"
              style={{ transform: 'translateZ(30px)' }}
            >
              {skillName}
            </h3>
            {description && (
              <p className="text-xs text-brand-100 font-medium mt-1.5 max-w-[85%] leading-relaxed">{description}</p>
            )}
          </div>

          {/* Floating image with 3D depth and hover pop */}
          {image && (
            <motion.img
              src={image}
              alt={skillName}
              style={{ transform: 'translateZ(50px)' }}
              whileHover={{ scale: 1.12, y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -right-3 -bottom-4 w-24 h-24 object-contain opacity-20 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
            />
          )}
        </div>

        {/* Topics / TOC */}
        {showTopics && topics && topics.length > 0 ? (
          <div
            className="relative z-10 p-6 bg-white"
            style={{ transform: 'translateZ(10px)' }}
          >
            <span className="text-[10px] font-extrabold text-surface-400 uppercase tracking-widest block mb-3">Topics Covered</span>
            <ul className="space-y-2.5">
              {topics.map((topic, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-surface-700 text-sm font-medium"
                >
                  <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{topic}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        ) : (
          !showTopics && (
            <div
              className="relative z-10 p-6 bg-white border-t border-surface-100 flex justify-between items-center group-hover:bg-brand-50/10 transition-colors duration-300"
              style={{ transform: 'translateZ(10px)' }}
            >
              <span className="text-xs text-brand-700 font-bold group-hover:text-brand-850 transition-colors duration-200">
                View Full Syllabus & Topics
              </span>
              <svg
                className="w-4 h-4 text-brand-500 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
