import React from 'react';

// Default/Fallback Icon
const QuestionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);
// --- ICON DEFINITIONS ---

// Vitals & Primary
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.645 20.91l-6.22-6.22a5.5 5.5 0 01.3-7.78l.065-.065a5.5 5.5 0 017.78 0L12 7.783l.892-.892a5.5 5.5 0 017.78 7.78l-6.191 6.191a2.25 2.25 0 01-3.182 0z" /></svg>);
const DropletIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>);
const LightningIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 2.25c-.414 0-.75.336-.75.75v8.25h-3a.75.75 0 00-.75.75 3 3 0 003 3h1.5a.75.75 0 00.75-.75v-8.25h3a.75.75 0 00.75-.75 3 3 0 00-3-3h-1.5z" /></svg>);
const FoodIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75zM12 17.25a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75zM3.75 12a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM15 12a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>);
const WaterBottleIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5h-9zm4.5 3a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z" clipRule="evenodd" /></svg>);
const SwordIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.75 3.75a.75.75 0 00-1.5 0V8.25h-3a.75.75 0 00-1.06 1.06l4.5 4.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 00-1.06-1.06h-3V3.75z" /></svg>);
const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 3a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>);
const MagicShieldIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM21.75 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h18a.75.75 0 01.75.75z" /></svg>);
const WingIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5a.75.75 0 01.75.75V6h4.5a.75.75 0 010 1.5H12v1.5h3.75a.75.75 0 010 1.5H12V12h4.5a.75.75 0 010 1.5H12v1.5h3a.75.75 0 010 1.5H12V18h4.5a.75.75 0 010 1.5H12v4.5a.75.75 0 01-1.5 0V19.5H6a.75.75 0 010-1.5h4.5V15H7.5a.75.75 0 010-1.5H10.5v-1.5H6a.75.75 0 010-1.5h4.5V9H7.5a.75.75 0 010-1.5H10.5V6H6a.75.75 0 010-1.5h4.5V2.25A.75.75 0 0112 1.5z" /></svg>);
const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" /></svg>);
const ExplosionIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.828 2.25c-3.53 0-6.42 2.89-6.42 6.42s2.89 6.42 6.42 6.42 6.42-2.89 6.42-6.42-2.89-6.42-6.42-6.42zM12 3.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM12 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75zM3.75 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM18 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>);
const HourglassIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 1.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3a.75.75 0 01.75-.75zm0 15a.75.75 0 01-.75-.75v-3a.75.75 0 011.5 0v3a.75.75 0 01-.75.75z" clipRule="evenodd" /></svg>);

// General & Xianxia
const GemIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 4.5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5a.75.75 0 01-.75-.75zM5.25 7.5a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM3.75 10.5a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zM3 13.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM6 16.5a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM9 19.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" /></svg>);
const ScrollIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM4.5 3.75a.75.75 0 00-1.5 0v16.5a.75.75 0 001.5 0V3.75zM19.5 3.75a.75.75 0 00-1.5 0v16.5a.75.75 0 001.5 0V3.75z" /></svg>);
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>);
const AuraIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM18.75 6a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM3.75 6a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013.75 6zM12 18a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 18z" /></svg>);
const YinYangIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a9.75 9.75 0 019.75 9.75c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12A9.75 9.75 0 0112 2.25zM12 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>);

// Demonic
const BloodIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>);
const GhostIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3.75A5.25 5.25 0 003.75 9v11.25a.75.75 0 001.5 0V9A3.75 3.75 0 019 5.25h6A3.75 3.75 0 0118.75 9v11.25a.75.75 0 001.5 0V9A5.25 5.25 0 0015 3.75H9z" /></svg>);
const DemonGateIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v3.344c1.18.232 2.21.78 3 1.547a.75.75 0 01-1.06 1.06A3.75 3.75 0 0012 7.5a3.75 3.75 0 00-2.69 1.151.75.75 0 11-1.06-1.06c.79-.766 1.82-1.315 3-1.547V3a.75.75 0 01.75-.75z" /></svg>);
const SkullIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6z" /></svg>);
const SpiderWebIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 5.47a.75.75 0 00-1.06-1.06L12 9.94l-3.22-3.22a.75.75 0 00-1.06 1.06L10.94 12l-3.22 3.22a.75.75 0 101.06 1.06L12 13.06l3.22 3.22a.75.75 0 101.06-1.06L13.06 12l3.22-3.22z" clipRule="evenodd" /></svg>);

// Sect Management
const CoinPouchIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM4.5 9.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM4.5 14.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM15.75 9.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM15.75 14.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" /></svg>);
const GrainIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.25 3.75A1.5 1.5 0 0112.75 2.25h.5a1.5 1.5 0 011.5 1.5v.5a1.5 1.5 0 01-1.5 1.5h-.5A1.5 1.5 0 0111.25 5.25v-.5z" clipRule="evenodd" /></svg>);
const BarracksIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.75a.75.75 0 00-1.5 0v16.5a.75.75 0 001.5 0V3.75zM21 3.75a.75.75 0 00-1.5 0v16.5a.75.75 0 001.5 0V3.75zM9 8.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM16.5 8.25a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5z" /></svg>);
const HeartHandshakeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 3.75a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5V6.75a.75.75 0 01.75-.75z" /></svg>);
const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 9a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zM9 9a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" clipRule="evenodd" /></svg>);

// Post-Apocalyptic
const BottleCapIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 3.75a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>);
const RadiationIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 0112 2.25z" /><path fillRule="evenodd" d="M5.001 6.33a.75.75 0 01.883-.393l3.41 1.462a.75.75 0 010 1.32l-3.41 1.462a.75.75 0 01-.883-.927V6.723a.75.75 0 010-.393zm13.116 2.336a.75.75 0 01.393.883l-1.462 3.41a.75.75 0 01-1.32 0l1.462-3.41a.75.75 0 01.927-.49z" clipRule="evenodd" /></svg>);
const GearsIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" /><path d="M4.125 12a.75.75 0 01.75-.75h14.25a.75.75 0 010 1.5H4.875a.75.75 0 01-.75-.75z" /></svg>);
const BulletIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.75a.75.75 0 01.75.75v15a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75z" /></svg>);
const HandshakeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" /></svg>);

// Urban Fantasy
const MoneyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5V6z" /></svg>);
const CityscapeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2.25a.75.75 0 00-1.5 0v19.5a.75.75 0 001.5 0V2.25zM22.5 2.25a.75.75 0 00-1.5 0v19.5a.75.75 0 001.5 0V2.25z" /></svg>);
const NetworkIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" /><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" /></svg>);
const MaskIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v3.344a6.75 6.75 0 016.906 5.662.75.75 0 01-1.498.088 5.25 5.25 0 00-10.816 0 .75.75 0 01-1.498-.088A6.75 6.75 0 0111.25 6.344V3a.75.75 0 01.75-.75z" /></svg>);
const SparkIcon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" /></svg>);

export const attributeIcons: Record<string, React.FC<{ className?: string }>> = {
    question: QuestionIcon,
    heart: HeartIcon,
    droplet: DropletIcon,
    lightning: LightningIcon,
    food: FoodIcon,
    water_bottle: WaterBottleIcon,
    sword: SwordIcon,
    shield: ShieldIcon,
    magic_shield: MagicShieldIcon,
    wing: WingIcon,
    target: TargetIcon,
    explosion: ExplosionIcon,
    hourglass: HourglassIcon,
    gem: GemIcon,
    scroll: ScrollIcon,
    star: StarIcon,
    aura: AuraIcon,
    yin_yang: YinYangIcon,
    blood: BloodIcon,
    ghost: GhostIcon,
    demon_gate: DemonGateIcon,
    skull: SkullIcon,
    spider_web: SpiderWebIcon,
    coin_pouch: CoinPouchIcon,
    grain: GrainIcon,
    barracks: BarracksIcon,
    heart_handshake: HeartHandshakeIcon,
    crown: CrownIcon,
    bottle_cap: BottleCapIcon,
    radiation: RadiationIcon,
    gears: GearsIcon,
    bullet: BulletIcon,
    handshake: HandshakeIcon,
    money: MoneyIcon,
    cityscape: CityscapeIcon,
    network: NetworkIcon,
    mask: MaskIcon,
    spark: SparkIcon,
};

export const iconList = Object.keys(attributeIcons);

export const GetIconComponent: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
    const Icon = attributeIcons[name] || QuestionIcon;
    return <Icon className={className} />;
};
