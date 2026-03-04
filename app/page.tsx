'use client';
import { useState, useCallback, useEffect } from 'react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Step = 'platform' | 'intention' | 'form' | 'result';
type Status = 'pass' | 'fail' | 'warn';

interface ProfileCheck { id:string; section:string; title:string; status:Status; current:string; issue:string; fix:string; }
interface GigCheck { area:string; status:Status; issue:string; fix:string; }
interface GigResult { gigNumber:number; title:string; overallScore:number; titleScore:number; descScore:number; tagsScore:number; pricingScore:number; thumbnailScore:number; topFix:string; optimizedTitle:string; betterTags:string[]; pricingAdvice:string; thumbnailAdvice:string; checks:GigCheck[]; }
interface NextActions { today:string[]; thisWeek:string[]; thisMonth:string[]; }
interface FullAuditData { overallScore:number; visibilityScore:number; conversionScore:number; firstClientReadiness:number; summary:string; profileChecks:ProfileCheck[]; gigResults:GigResult[]; topPriorities:string[]; strengths:string[]; missingKeywords:string[]; firstClientTips:string[]; nextActions:NextActions; }
interface ProfileAuditData { overallScore:number; visibilityScore:number; conversionScore:number; firstClientReadiness:number; summary:string; checks:ProfileCheck[]; topPriorities:string[]; strengths:string[]; missingKeywords:string[]; firstClientTips:string[]; nextActions:NextActions; }
interface GigAuditData { gigs:GigResult[]; crossGigAdvice:string; missingGigIdeas:string[]; }
interface CreateGigData { gigTitle:string; tags:string[]; description:string; pricing:{basic:PriceTier;standard:PriceTier;premium:PriceTier}; faq:{question:string;answer:string}[]; thumbnailDesignBrief:string|Record<string,string>; thumbnailConcept?:string; thumbnailChecklist?:string[]; seoTips:string[]; firstOrderTips:string[]; }
interface PriceTier { name:string; price:string; delivery:number|string; revisions:number|string; includes:string[]; }
interface RewriteData { rewrittenHeadline:string; rewrittenBio:string; wordCount:number; improvements:string[]; keywordsAdded:string[]; }
interface ProposalData { subject:string; proposal:string; keyStrengths:string[]; customizeTips:string[]; }
interface TemplatesData { templates:{scenario:string;template:string;tips:string;avoid:string}[]; }
interface MessageData { clientType:string; budgetSignal:string; urgency:string; seriousness:string; redFlags:string[]; greenFlags:string[]; strategy:string; suggestedResponse:string; negotiationTips:string[]; doNot:string[]; }
interface KeywordsData { missing:{keyword:string;searchVolume:string;competition:string;howToUse:string}[]; using:string[]; longTail:{keyword:string;reason:string}[]; localKeywords:string[]; }
interface RoadmapData { estimatedDays:number; checklist:{phase:string;tasks:{task:string;done:boolean;priority:'high'|'medium'|'low';detail:string}[]}[]; bidStrategy:string; pricingForFirstClient:string; mistakes:string[]; successSigns:string[]; }

type ResultData = FullAuditData | ProfileAuditData | GigAuditData | CreateGigData | RewriteData | ProposalData | TemplatesData | MessageData | KeywordsData | RoadmapData;

// ─────────────────────────────────────────────
// PLATFORM DATA — only 2 platforms
// ─────────────────────────────────────────────
const PLATFORMS = [
    {
        id: 'fiverr', name: 'Fiverr', color: '#1dbf73', desc: 'Sell services as gigs',
        logo: (
            <svg viewBox="0 0 100 100" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="16" fill="#1dbf73"/>
                <text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">f</text>
                <circle cx="74" cy="26" r="8" fill="white"/>
            </svg>
        ),
    },
    {
        id: 'upwork', name: 'Upwork', color: '#14a800', desc: 'Hourly & fixed contracts',
        logo: (
            <svg viewBox="0 0 100 100" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="16" fill="#14a800"/>
                <text x="50" y="65" textAnchor="middle" fontSize="44" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">U</text>
                <path d="M62 52 Q75 35 82 52 Q75 48 68 52 Q75 65 62 65" fill="white" stroke="white" strokeWidth="1"/>
            </svg>
        ),
    },
];

// ─────────────────────────────────────────────
// INTENTIONS — pricing removed from fiverr
// ─────────────────────────────────────────────
interface Intention { id:string; icon:string; label:string; desc:string; color:string; platforms:string[]; skillsRequired:boolean; }

const ALL_INTENTIONS: Intention[] = [
    { id:'full_audit',    icon:'🔍', label:'Full Audit',           desc:'Profile + all gigs scored with every fix',          color:'#6366f1', platforms:['fiverr'],           skillsRequired:true  },
    { id:'profile_audit', icon:'📊', label:'Profile Audit',        desc:'Full Upwork profile score with every fix',          color:'#6366f1', platforms:['upwork'],           skillsRequired:true  },
    { id:'gig_audit',     icon:'🎯', label:'Gig Analyser',         desc:'Score existing gigs, get exact improvements',       color:'#ec4899', platforms:['fiverr'],           skillsRequired:true  },
    { id:'create_gig',    icon:'✨', label:'Create a New Gig',     desc:'Build a complete professional gig from scratch',    color:'#f59e0b', platforms:['fiverr'],           skillsRequired:true  },
    { id:'rewrite_bio',   icon:'✦',  label:'Rewrite Bio',          desc:'AI rewrites your bio/overview perfectly',           color:'#10b981', platforms:['fiverr','upwork'], skillsRequired:true  },
    { id:'proposal',      icon:'📝', label:'Write a Proposal',     desc:'Paste job, get a winning proposal instantly',       color:'#f97316', platforms:['upwork'],          skillsRequired:true  },
    { id:'keywords',      icon:'🔑', label:'Keyword Research',     desc:'Find missing high-value search terms',              color:'#06b6d4', platforms:['fiverr','upwork'], skillsRequired:true  },
    { id:'templates',     icon:'💬', label:'Reply Templates',      desc:'6 winning messages for every client scenario',      color:'#14b8a6', platforms:['fiverr','upwork'], skillsRequired:false },
    { id:'message',       icon:'✉',  label:'Message Analyser',     desc:'Paste any client message and get the perfect reply',color:'#60a5fa', platforms:['fiverr','upwork'], skillsRequired:false },
    { id:'roadmap',       icon:'🗺', label:'First Client Roadmap', desc:'Step-by-step checklist to get hired fast',          color:'#a78bfa', platforms:['fiverr','upwork'], skillsRequired:false },
];

// ─────────────────────────────────────────────
// SKILL CATEGORIES
// ─────────────────────────────────────────────
const SKILL_GROUPS: Record<string,string[]> = {
    'Development': ['Web Development','React / Next.js','Vue.js','Node.js','PHP / Laravel','Python','WordPress','Shopify','Mobile Apps','iOS','Android','Flutter'],
    'Design': ['UI/UX Design','Graphic Design','Logo Design','Branding','Figma','Illustration','Motion Graphics','Video Editing','3D Modeling'],
    'Marketing': ['SEO','Digital Marketing','Social Media','Email Marketing','PPC / Google Ads','Content Writing','Copywriting','Blog Writing'],
    'Business': ['Virtual Assistant','Data Entry','Customer Support','Project Management','Business Analysis','Translation'],
};

// ─────────────────────────────────────────────
// FORM FIELDS
// ─────────────────────────────────────────────
interface Field { key:string; label:string; type:'text'|'textarea'|'select'; placeholder:string; hint?:string; required?:boolean; options?:string[]; }

function getFields(platform:string, intention:string): Field[] {
    if (intention==='proposal') return [
        { key:'jobDescription', label:'Job Description / Project Details', type:'textarea', placeholder:'Paste the full job posting here...', hint:'The more detail, the more targeted the proposal', required:true },
        { key:'clientBudget',   label:'Client Budget (if mentioned)',      type:'text',     placeholder:'e.g. $500 fixed, $25/hr, or "not mentioned"' },
        { key:'background',     label:'Your Relevant Experience (optional)',type:'textarea', placeholder:'Brief summary of your related experience...' },
    ];
    if (intention==='message') return [
        { key:'messageText', label:'Paste the Client Message', type:'textarea', placeholder:'Paste the exact message from the client here...', hint:'Copy and paste the full message for best analysis', required:true },
    ];
    if (intention==='keywords') return [
        { key:'bio',     label:'Current Bio / Description (paste it)', type:'textarea', placeholder:'Paste your current profile bio or description...' },
        { key:'tagline', label:'Current Headline / Tagline',           type:'text',     placeholder:'Your current headline...' },
    ];
    if (intention==='templates') return [];
    if (intention==='roadmap') return [
        { key:'yearsExperience', label:'Years of Experience',  type:'text',   placeholder:'e.g. 1 or "complete beginner"' },
        { key:'profileStatus',   label:'Profile Status',       type:'select', placeholder:'', options:['Just created profile','Have profile but 0 orders','Have 1-5 orders'] },
    ];
    if (intention==='rewrite_bio') {
        if (platform==='fiverr') return [
            { key:'tagline', label:'Current Tagline ★',           type:'text',     placeholder:'Your current profile tagline...', hint:'Max 130 chars — the #1 Fiverr search field', required:true },
            { key:'bio',     label:'Current Profile Description ★',type:'textarea', placeholder:'Paste your current bio here...',    hint:'150-600 words ideal',                    required:true },
            { key:'skills',  label:'Skills Listed',                type:'text',     placeholder:'e.g. React, WordPress, Shopify...' },
        ];
        return [
            { key:'headline', label:'Current Headline ★',   type:'text',     placeholder:'Your current headline...',  required:true },
            { key:'bio',      label:'Current Bio / Overview ★', type:'textarea', placeholder:'Paste your current bio...', required:true },
            { key:'skills',   label:'Skills Listed',         type:'text',     placeholder:'e.g. React, Node.js...' },
        ];
    }
    if (intention==='create_gig') return [
        { key:'serviceType',     label:'What service will this gig offer? ★', type:'text',   placeholder:'e.g. WordPress website, React development, SEO audit...', required:true },
        { key:'targetClient',    label:'Who is your ideal client?',           type:'text',   placeholder:'e.g. Small business owners, SaaS startups...' },
        { key:'usp',             label:'What makes you different?',           type:'text',   placeholder:'e.g. Fast 24hr delivery, 5 years experience...' },
        { key:'experienceLevel', label:'Your Experience Level',               type:'select', placeholder:'', options:['Beginner (0-1 year)','Intermediate (1-3 years)','Expert (3+ years)'] },
    ];
    if (intention==='gig_audit') return [];
    // Full audit + profile audit
    if (platform==='fiverr') return [
        { key:'tagline',       label:'Profile Tagline ★',      type:'text',     placeholder:'e.g. Expert React Developer | Shopify Specialist | Fast Delivery', hint:'Max 130 chars — #1 Fiverr search factor', required:true },
        { key:'bio',           label:'Profile Description ★',  type:'textarea', placeholder:'Paste your full profile bio here...',                               hint:'First 2 lines show in search results',    required:true },
        { key:'skills',        label:'Skills Listed',           type:'text',     placeholder:'e.g. React, WordPress, Shopify, CSS...',                            hint:'Fiverr allows 15 — list all' },
        { key:'languages',     label:'Languages',               type:'text',     placeholder:'e.g. English (Fluent), Sinhala (Native)' },
        { key:'certifications',label:'Certifications',          type:'text',     placeholder:'e.g. Google Analytics, AWS...' },
        { key:'yearsExperience',label:'Years of Experience',   type:'text',     placeholder:'e.g. 3' },
        { key:'responseTime',  label:'Avg Response Time',       type:'text',     placeholder:'e.g. 1 hour',                                                       hint:'Faster = higher ranking' },
    ];
    if (platform==='upwork') return [
        { key:'headline',     label:'Profile Headline ★',   type:'text',     placeholder:'e.g. Full-Stack React Developer | Next.js | Fast Delivery', hint:'Max 70 chars', required:true },
        { key:'overview',     label:'Profile Overview ★',   type:'textarea', placeholder:'Paste your full overview here...',                          hint:'200-400 words ideal',               required:true },
        { key:'hourlyRate',   label:'Hourly Rate',           type:'text',     placeholder:'e.g. $25/hr' },
        { key:'skills',       label:'Skills Listed',         type:'text',     placeholder:'e.g. React.js, Node.js, TypeScript...',                    hint:'Upwork allows 15' },
        { key:'completeness', label:'Profile Completeness %',type:'text',     placeholder:'e.g. 85%',                                                 hint:'Must reach 100%' },
        { key:'yearsExperience',label:'Years of Experience', type:'text',     placeholder:'e.g. 3' },
    ];
    if (platform==='peopleperhour') return [
        { key:'headline',    label:'Profile Headline ★',type:'text',     placeholder:'e.g. WordPress Developer Delivering Fast SEO-Ready Websites', required:true },
        { key:'bio',         label:'Profile Bio ★',     type:'textarea', placeholder:'Paste your bio here...',                                        required:true },
        { key:'hourlyRate',  label:'Hourly Rate',        type:'text',     placeholder:'e.g. £35/hr' },
        { key:'skills',      label:'Skills',             type:'text',     placeholder:'e.g. WordPress, PHP, SEO, WooCommerce...' },
        { key:'hourlies',    label:'Hourlies (fixed services)',type:'textarea',placeholder:'List your fixed-price service titles...' },
    ];
    return [];
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const scoreColor = (n:number) => n>=80?'#10b981':n>=55?'#f59e0b':'#ef4444';
const statusColor = (s:string) => s==='pass'?'#10b981':s==='fail'?'#ef4444':'#f59e0b';
const statusIcon  = (s:string) => s==='pass'?'✓':s==='fail'?'✗':'⚠';
const scoreLabel  = (n:number) => n>=80?'Excellent':n>=65?'Good':n>=45?'Needs Work':'Critical';

// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────
function Blob() {
    return (
        <>
            <div style={{position:'fixed',top:'-20%',left:'-15%',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.07) 0%,transparent 65%)',pointerEvents:'none',zIndex:0}}/>
            <div style={{position:'fixed',bottom:'-15%',right:'-10%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 65%)',pointerEvents:'none',zIndex:0}}/>
        </>
    );
}

function TopBar({ step, onHome }:{ step:number; onHome:()=>void }) {
    const steps = ['Platform','Intention','Details','Result'];
    return (
        <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 40px',borderBottom:'1px solid #1e1e35',position:'relative',zIndex:10,background:'rgba(3,3,5,.9)',backdropFilter:'blur(12px)'}}>
            <button onClick={onHome} style={{display:'flex',alignItems:'center',gap:10,background:'none',border:'none',cursor:'pointer'}}>
                <div style={{width:32,height:32,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'#fff',boxShadow:'0 0 16px rgba(99,102,241,.4)'}}>P</div>
                <span style={{fontFamily:"'Lexend',sans-serif",fontSize:17,fontWeight:800,color:'#eeeeff',letterSpacing:'-.5px'}}>ProfilePro</span>
            </button>
            <div style={{display:'flex',alignItems:'center',gap:0}}>
                {steps.map((s,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center'}}>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                            <div style={{width:30,height:30,borderRadius:'50%',background:i+1<step?'#6366f1':i+1===step?'linear-gradient(135deg,#6366f1,#8b5cf6)':'transparent',border:`2px solid ${i+1<=step?'#6366f1':'#1e1e35'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:i+1<=step?'#fff':'#2a2a45',boxShadow:i+1===step?'0 0 16px rgba(99,102,241,.4)':'none',transition:'all .3s'}}>
                                {i+1<step?'✓':i+1}
                            </div>
                            <div style={{fontSize:10,color:i+1<=step?'#9898bb':'#2a2a45',fontWeight:i+1===step?700:400}}>{s}</div>
                        </div>
                        {i<steps.length-1 && <div style={{width:48,height:2,background:i+1<step?'#6366f1':'#1e1e35',margin:'0 6px',marginBottom:16,transition:'background .3s'}}/>}
                    </div>
                ))}
            </div>
            <div style={{display:'flex',gap:6}}>
                {['Free','AI-Powered','Fiverr & Upwork'].map(t=>(
                    <span key={t} style={{fontSize:10,color:'#4a4a6a',background:'#08080f',border:'1px solid #1e1e35',borderRadius:20,padding:'3px 10px'}}>{t}</span>
                ))}
            </div>
        </nav>
    );
}

function ScoreRing({score,size=120,label}:{score:number;size?:number;label?:string}) {
    const r=42; const c=2*Math.PI*r; const off=c-(score/100)*c; const col=scoreColor(score);
    return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <svg width={size} height={size} viewBox="0 0 100 100" style={{transform:'rotate(-90deg)',flexShrink:0}}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="#1e1e35" strokeWidth="8"/>
                <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{transition:'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)',filter:`drop-shadow(0 0 10px ${col}88)`}}/>
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central" style={{transform:'rotate(90deg)',transformOrigin:'50% 50%',fontFamily:"'Lexend',sans-serif",fontSize:24,fontWeight:800,fill:col}}>{score}</text>
            </svg>
            {label && <div style={{fontSize:10,color:'#4a4a6a',letterSpacing:1,textTransform:'uppercase'}}>{label}</div>}
        </div>
    );
}

function CopyBtn({text,label='⎘ Copy'}:{text:string;label?:string}) {
    const [done,setDone] = useState(false);
    const go = () => { navigator.clipboard.writeText(text); setDone(true); setTimeout(()=>setDone(false),2000); };
    return (
        <button onClick={go} style={{fontSize:12,padding:'6px 14px',background:done?'rgba(16,185,129,.1)':'rgba(99,102,241,.08)',border:`1px solid ${done?'rgba(16,185,129,.3)':'rgba(99,102,241,.2)'}`,borderRadius:8,color:done?'#10b981':'#818cf8',cursor:'pointer',fontFamily:"'Lexend',sans-serif",transition:'all .2s',flexShrink:0,whiteSpace:'nowrap'}}>
            {done?'✓ Copied!':label}
        </button>
    );
}

function FixBlock({fix}:{fix:string}) {
    const [open,setOpen] = useState(false);
    if(!fix) return null;
    return (
        <div style={{marginTop:10}}>
            <button onClick={()=>setOpen(!open)} style={{fontSize:12,padding:'5px 14px',background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.18)',borderRadius:8,color:'#818cf8',cursor:'pointer',fontFamily:"'Lexend',sans-serif"}}>
                {open?'▲ Hide fix':'💡 See exact fix'}
            </button>
            {open && (
                <div style={{marginTop:8,background:'rgba(99,102,241,.03)',border:'1px solid rgba(99,102,241,.14)',borderRadius:12,overflow:'hidden'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',borderBottom:'1px solid rgba(99,102,241,.1)'}}>
                        <span style={{fontSize:11,color:'#6366f1',letterSpacing:1,fontWeight:600}}>COPY &amp; PASTE INTO YOUR PROFILE</span>
                        <CopyBtn text={fix}/>
                    </div>
                    <pre style={{padding:'16px',fontFamily:"'Fira Code',monospace",fontSize:13,color:'#c8c8e8',whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:1.85}}>{fix}</pre>
                </div>
            )}
        </div>
    );
}

function CheckCard({c}:{c:ProfileCheck|GigCheck}) {
    const check = c as ProfileCheck;
    const col = statusColor(check.status);
    const bord = check.status==='fail'?'rgba(239,68,68,.18)':check.status==='warn'?'rgba(245,158,11,.18)':'rgba(16,185,129,.1)';
    return (
        <div style={{background:'#08080f',border:`1px solid ${bord}`,borderRadius:14,padding:'18px 20px',marginBottom:10}}>
            <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:32,height:32,borderRadius:10,background:`${col}18`,color:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,flexShrink:0}}>{statusIcon(check.status)}</div>
                <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                        <span style={{fontSize:15,fontWeight:700,color:'#eeeeff'}}>{check.title||(c as GigCheck).area}</span>
                        {check.section && <span style={{fontSize:10,color:'#2a2a45',background:'#0f0f1a',border:'1px solid #1e1e35',borderRadius:4,padding:'2px 8px'}}>{check.section}</span>}
                    </div>
                    {check.current && <div style={{fontSize:12,color:'#4a4a6a',fontStyle:'italic',marginBottom:6,lineHeight:1.5}}>&ldquo;{check.current}&rdquo;</div>}
                    <div style={{fontSize:14,color:col,lineHeight:1.6,marginBottom:4}}>{check.status==='pass'?`✓ ${check.issue||'Looking good!'}`:`→ ${check.issue||(c as GigCheck).issue}`}</div>
                    {(check.fix||(c as GigCheck).fix) && check.status!=='pass' && <FixBlock fix={check.fix||(c as GigCheck).fix}/>}
                </div>
                <div style={{fontSize:10,fontWeight:800,padding:'3px 10px',borderRadius:20,border:`1px solid ${col}44`,background:`${col}0d`,color:col,whiteSpace:'nowrap',letterSpacing:.5,flexShrink:0}}>{check.status?.toUpperCase()}</div>
            </div>
        </div>
    );
}

function InfoBox({title,children}:{title:string;children:React.ReactNode}) {
    return <div style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:16,padding:'22px 24px',marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:'#4a4a6a',letterSpacing:1.5,marginBottom:14}}>{title}</div>{children}</div>;
}
function BigBox({title,children,action}:{title:string;children:React.ReactNode;action?:React.ReactNode}) {
    return <div style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:16,padding:'24px',marginBottom:16,overflow:'hidden'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><span style={{fontFamily:"'Lexend',sans-serif",fontSize:17,fontWeight:700,color:'#eeeeff'}}>{title}</span>{action}</div>{children}</div>;
}
function PreText({text}:{text:string}) {
    return <pre style={{fontFamily:"'Fira Code',monospace",fontSize:13,color:'#c8c8e8',whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:1.9,background:'#030305',border:'1px solid #1e1e35',borderRadius:10,padding:'18px',marginBottom:12}}>{text}</pre>;
}
function Tag({children,color='#6366f1'}:{children:React.ReactNode;color?:string}) {
    return <span style={{fontSize:12,color,background:`${color}0e`,border:`1px solid ${color}33`,borderRadius:6,padding:'4px 10px'}}>{children}</span>;
}
function ListRow({children,color}:{children:React.ReactNode;color?:string}) {
    return <div style={{fontSize:14,color:color||'#9898bb',padding:'8px 0',borderBottom:'1px solid #1e1e35',lineHeight:1.6}}>{children}</div>;
}
function PrioRow({n,text}:{n:number;text:string}) {
    return <div style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid #1e1e35',alignItems:'flex-start'}}><div style={{width:24,height:24,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,flexShrink:0,marginTop:2}}>{n}</div><div style={{fontSize:14,color:'#c8c8e8',lineHeight:1.6}}>{text}</div></div>;
}
function NextActionsBox({actions}:{actions:NextActions}) {
    return (
        <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.08))',border:'1px solid rgba(99,102,241,.25)',borderRadius:16,padding:'24px',marginTop:8}}>
            <div style={{fontSize:13,fontWeight:700,color:'#6366f1',marginBottom:16,letterSpacing:1}}>⚡ YOUR ACTION PLAN</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                {([['🔴 DO TODAY',actions?.today||[],'#ef4444'],['🟡 THIS WEEK',actions?.thisWeek||[],'#f59e0b'],['🟢 THIS MONTH',actions?.thisMonth||[],'#10b981']] as [string,string[],string][]).map(([label,items,color])=>(
                    <div key={label}>
                        <div style={{fontSize:11,fontWeight:700,color,letterSpacing:1,marginBottom:10}}>{label}</div>
                        {items.map((item,i)=><div key={i} style={{fontSize:13,color:'#9898bb',padding:'6px 0',borderBottom:'1px solid #1e1e35',lineHeight:1.5}}>→ {item}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// RESULT RENDERERS
// ─────────────────────────────────────────────
function AuditResult({data,platform,isFullAudit}:{data:FullAuditData|ProfileAuditData;platform:string;isFullAudit:boolean}) {
    const [tab,setTab] = useState('All');
    const fd = data as FullAuditData;
    const pd = data as ProfileAuditData;
    const checks: ProfileCheck[] = isFullAudit ? (fd.profileChecks||[]) : (pd.checks||[]);
    const sections = ['All',...Array.from(new Set(checks.map(c=>c.section).filter(Boolean)))];
    const shown = tab==='All'?checks:checks.filter(c=>c.section===tab);
    const passes = checks.filter(c=>c.status==='pass').length;
    const fails  = checks.filter(c=>c.status==='fail').length;
    const warns  = checks.filter(c=>c.status==='warn').length;
    const selP   = PLATFORMS.find(p=>p.id===platform);
    return (
        <div>
            <div style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:22,padding:'32px 36px',marginBottom:20,display:'flex',gap:32,alignItems:'flex-start',flexWrap:'wrap'}}>
                <div style={{display:'flex',gap:24,alignItems:'center',flex:1,minWidth:280}}>
                    <ScoreRing score={data.overallScore||0} size={160}/>
                    <div>
                        <div style={{display:'inline-block',fontSize:13,fontWeight:700,padding:'5px 16px',borderRadius:20,border:`1px solid ${scoreColor(data.overallScore||0)}44`,background:`${scoreColor(data.overallScore||0)}10`,color:scoreColor(data.overallScore||0),marginBottom:10,letterSpacing:.5}}>{scoreLabel(data.overallScore||0)} Profile</div>
                        <div style={{fontSize:13,color:'#4a4a6a',marginBottom:8}}>{selP?.name} Profile Audit</div>
                        <div style={{fontSize:15,color:'#9898bb',lineHeight:1.75,maxWidth:360}}>{data.summary}</div>
                    </div>
                </div>
                <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                    <ScoreRing score={data.visibilityScore||0}       size={88} label="Visibility"/>
                    <ScoreRing score={data.conversionScore||0}       size={88} label="Conversion"/>
                    <ScoreRing score={data.firstClientReadiness||0}  size={88} label="Readiness"/>
                </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                {([[passes,'Passed','#10b981'],[fails,'Failed','#ef4444'],[warns,'Warnings','#f59e0b'],[checks.length,'Total','#6366f1']] as [number,string,string][]).map(([n,l,c])=>(
                    <div key={l} style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:14,padding:'18px',textAlign:'center'}}>
                        <div style={{fontFamily:"'Lexend',sans-serif",fontSize:30,fontWeight:900,color:c,marginBottom:4}}>{n}</div>
                        <div style={{fontSize:12,color:'#2a2a45'}}>{l}</div>
                    </div>
                ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
                <InfoBox title="🎯 FIX THESE FIRST">
                    {(data.topPriorities||[]).map((p,i)=><PrioRow key={i} n={i+1} text={p}/>)}
                </InfoBox>
                <InfoBox title="💪 WHAT'S STRONG">
                    {(data.strengths||[]).map((s,i)=><ListRow key={i} color="#10b981">✓ {s}</ListRow>)}
                    {(data.firstClientTips||[]).length>0 && <>
                        <div style={{fontSize:11,fontWeight:700,color:'#6366f1',letterSpacing:1.5,margin:'14px 0 8px'}}>🚀 GET FIRST CLIENT FAST</div>
                        {data.firstClientTips.map((t,i)=><ListRow key={i} color="#6366f1">→ {t}</ListRow>)}
                    </>}
                </InfoBox>
                <InfoBox title="🔑 MISSING KEYWORDS">
                    <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{(data.missingKeywords||[]).map((kw,i)=><Tag key={i}>{kw}</Tag>)}</div>
                </InfoBox>
            </div>
            {isFullAudit && (fd.gigResults||[]).length>0 && (
                <div style={{marginBottom:20}}>
                    <div style={{fontFamily:"'Lexend',sans-serif",fontSize:20,fontWeight:800,color:'#eeeeff',marginBottom:14,letterSpacing:'-.5px'}}>🎯 Gig Analysis</div>
                    {fd.gigResults.map((gig,gi)=><GigCard key={gi} gig={gig}/>)}
                </div>
            )}
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                {sections.map(s=>(
                    <button key={s} onClick={()=>setTab(s)} style={{fontSize:12,padding:'6px 14px',background:tab===s?'rgba(99,102,241,.08)':'transparent',border:`1px solid ${tab===s?'rgba(99,102,241,.3)':'#1e1e35'}`,borderRadius:8,color:tab===s?'#818cf8':'#2a2a45',cursor:'pointer',transition:'all .2s'}}>{s}</button>
                ))}
            </div>
            {shown.map((c,i)=><CheckCard key={i} c={c}/>)}
            {data.nextActions && <NextActionsBox actions={data.nextActions}/>}
        </div>
    );
}

function GigCard({gig}:{gig:GigResult}) {
    const [open,setOpen] = useState(false);
    return (
        <div style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:18,padding:'24px',marginBottom:14}}>
            <div style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap',marginBottom:16}}>
                <ScoreRing score={gig.overallScore||0} size={90}/>
                <div style={{flex:1,minWidth:200}}>
                    <div style={{fontSize:11,color:'#6366f1',fontWeight:700,letterSpacing:1,marginBottom:4}}>GIG {gig.gigNumber}</div>
                    <div style={{fontSize:16,fontWeight:800,color:'#eeeeff',marginBottom:10,lineHeight:1.3}}>{gig.title}</div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {([['Title',gig.titleScore],['Desc',gig.descScore],['Tags',gig.tagsScore],['Pricing',gig.pricingScore],['Thumbnail',gig.thumbnailScore]] as [string,number][]).map(([l,sc])=>(
                            <div key={l} style={{textAlign:'center',padding:'6px 10px',background:'#050507',border:'1px solid #1e1e35',borderRadius:8}}>
                                <div style={{fontSize:15,fontWeight:800,color:scoreColor(sc||0)}}>{sc||0}</div>
                                <div style={{fontSize:10,color:'#4a4a6a'}}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.18)',borderRadius:10,padding:'14px',marginBottom:14}}>
                <div style={{fontSize:11,color:'#6366f1',fontWeight:700,marginBottom:6}}>🏆 TOP FIX FOR THIS GIG</div>
                <div style={{fontSize:15,color:'#eeeeff',lineHeight:1.6}}>{gig.topFix}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div style={{background:'#050507',border:'1px solid #1e1e35',borderRadius:10,padding:'14px'}}>
                    <div style={{fontSize:11,color:'#10b981',fontWeight:700,marginBottom:8}}>✦ OPTIMIZED TITLE</div>
                    <div style={{fontSize:14,color:'#eeeeff',marginBottom:8,lineHeight:1.4}}>{gig.optimizedTitle}</div>
                    <CopyBtn text={gig.optimizedTitle||''}/>
                </div>
                <div style={{background:'#050507',border:'1px solid #1e1e35',borderRadius:10,padding:'14px'}}>
                    <div style={{fontSize:11,color:'#f59e0b',fontWeight:700,marginBottom:8}}>🏷 BETTER TAGS</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>{(gig.betterTags||[]).map((t,i)=><Tag key={i} color="#f59e0b">{t}</Tag>)}</div>
                    <CopyBtn text={(gig.betterTags||[]).join(', ')}/>
                </div>
            </div>
            {gig.pricingAdvice   && <div style={{padding:'12px 16px',background:'rgba(139,92,246,.06)',border:'1px solid rgba(139,92,246,.18)',borderRadius:10,fontSize:14,color:'#9898bb',lineHeight:1.6,marginBottom:10}}>💰 <b style={{color:'#8b5cf6'}}>Pricing:</b> {gig.pricingAdvice}</div>}
            {gig.thumbnailAdvice && <div style={{padding:'12px 16px',background:'rgba(236,72,153,.06)',border:'1px solid rgba(236,72,153,.18)',borderRadius:10,fontSize:14,color:'#9898bb',lineHeight:1.6,marginBottom:10}}>🖼 <b style={{color:'#ec4899'}}>Thumbnail:</b> {gig.thumbnailAdvice}</div>}
            <button onClick={()=>setOpen(!open)} style={{fontSize:12,color:'#4a4a6a',background:'none',border:'none',cursor:'pointer',marginTop:4}}>{open?'▲ Hide detailed checks':'▼ Show all checks'}</button>
            {open && (gig.checks||[]).map((chk,i)=><CheckCard key={i} c={chk as unknown as ProfileCheck}/>)}
        </div>
    );
}

// ─────────────────────────────────────────────
// GIG FORM
// ─────────────────────────────────────────────
interface GigEntry { title:string; description:string; tags:string; basicPrice:string; basicDelivery:string; basicIncludes:string; standardPrice:string; standardDelivery:string; standardIncludes:string; premiumPrice:string; premiumDelivery:string; premiumIncludes:string; faq:string; thumbnailDesc:string; }
function emptyGig(): GigEntry { return {title:'',description:'',tags:'',basicPrice:'',basicDelivery:'',basicIncludes:'',standardPrice:'',standardDelivery:'',standardIncludes:'',premiumPrice:'',premiumDelivery:'',premiumIncludes:'',faq:'',thumbnailDesc:''}; }

function GigForm({gigs,setGigs,count,setCount}:{gigs:GigEntry[];setGigs:(g:GigEntry[])=>void;count:number;setCount:(n:number)=>void}) {
    const update = (idx:number, key:keyof GigEntry, val:string) => {
        const next = gigs.map((g:GigEntry,i:number)=>i===idx?{...g,[key]:val}:g);
        setGigs(next);
    };
    return (
        <div>
            <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
                <div style={{fontSize:13,color:'#9898bb',marginRight:8}}>How many gigs?</div>
                {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                    <button key={n} onClick={()=>{setCount(n);if(n>gigs.length)setGigs([...gigs,...Array(n-gigs.length).fill(null).map(emptyGig)]);}}
                            style={{width:36,height:36,borderRadius:8,background:count===n?'rgba(99,102,241,.15)':'#08080f',border:`1px solid ${count===n?'rgba(99,102,241,.5)':'#1e1e35'}`,color:count===n?'#818cf8':'#4a4a6a',cursor:'pointer',fontWeight:700,fontSize:13}}>
                        {n}
                    </button>
                ))}
            </div>
            {Array.from({length:count}).map((_,gi)=>(
                <div key={gi} style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:16,padding:'24px',marginBottom:16}}>
                    <div style={{fontSize:14,fontWeight:800,color:'#6366f1',marginBottom:16}}>GIG {gi+1}{count>1?` of ${count}`:''}</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                        <div style={{gridColumn:'1/-1'}}>
                            <label style={FS.lbl}>Gig Title <span style={{color:'#6366f1'}}>*</span></label>
                            <div style={{fontSize:12,color:'#2a2a45',marginBottom:6}}>Must start with &quot;I will&quot; — main keyword in first 3 words — max 80 chars</div>
                            <input value={gigs[gi]?.title||''} onChange={e=>update(gi,'title',e.target.value)} placeholder="e.g. I will build a professional React website for your business" style={FS.inp}/>
                        </div>
                        <div style={{gridColumn:'1/-1'}}>
                            <label style={FS.lbl}>Gig Description <span style={{color:'#6366f1'}}>*</span></label>
                            <div style={{fontSize:12,color:'#2a2a45',marginBottom:6}}>Minimum 1200 chars recommended</div>
                            <textarea value={gigs[gi]?.description||''} onChange={e=>update(gi,'description',e.target.value)} placeholder="Paste your full gig description here..." style={FS.ta} rows={5}/>
                        </div>
                        <div>
                            <label style={FS.lbl}>Tags (comma-separated)</label>
                            <div style={{fontSize:12,color:'#2a2a45',marginBottom:6}}>Use all 5 tags — match buyer search terms exactly</div>
                            <input value={gigs[gi]?.tags||''} onChange={e=>update(gi,'tags',e.target.value)} placeholder="e.g. react developer, website design, landing page..." style={FS.inp}/>
                        </div>
                        <div>
                            <label style={FS.lbl}>Thumbnail Description</label>
                            <div style={{fontSize:12,color:'#2a2a45',marginBottom:6}}>Describe your thumbnail for AI visual advice</div>
                            <input value={gigs[gi]?.thumbnailDesc||''} onChange={e=>update(gi,'thumbnailDesc',e.target.value)} placeholder="e.g. White background, my photo, text says React Expert..." style={FS.inp}/>
                        </div>
                        {(['basic','standard','premium'] as const).map(tier=>(
                            <div key={tier} style={{background:'#050507',border:`1px solid ${{basic:'#10b981',standard:'#6366f1',premium:'#8b5cf6'}[tier]}22`,borderRadius:12,padding:'14px'}}>
                                <div style={{fontSize:12,fontWeight:700,color:{basic:'#10b981',standard:'#6366f1',premium:'#8b5cf6'}[tier],marginBottom:10}}>{tier.charAt(0).toUpperCase()+tier.slice(1)} Tier</div>
                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                                    <div><label style={FS.lbl}>Price ($)</label><input value={gigs[gi]?.[`${tier}Price` as keyof GigEntry]||''} onChange={e=>update(gi,`${tier}Price` as keyof GigEntry,e.target.value)} placeholder="e.g. 15" style={FS.inp}/></div>
                                    <div><label style={FS.lbl}>Delivery (days)</label><input value={gigs[gi]?.[`${tier}Delivery` as keyof GigEntry]||''} onChange={e=>update(gi,`${tier}Delivery` as keyof GigEntry,e.target.value)} placeholder="e.g. 3" style={FS.inp}/></div>
                                    <div style={{gridColumn:'1/-1'}}><label style={FS.lbl}>Includes</label><input value={gigs[gi]?.[`${tier}Includes` as keyof GigEntry]||''} onChange={e=>update(gi,`${tier}Includes` as keyof GigEntry,e.target.value)} placeholder="e.g. 1 page, responsive, 3 revisions..." style={FS.inp}/></div>
                                </div>
                            </div>
                        ))}
                        <div style={{gridColumn:'1/-1'}}>
                            <label style={FS.lbl}>FAQ Section</label>
                            <div style={{fontSize:12,color:'#2a2a45',marginBottom:6}}>Gigs with 5+ FAQ questions rank higher</div>
                            <textarea value={gigs[gi]?.faq||''} onChange={e=>update(gi,'faq',e.target.value)} placeholder="Q: How long does it take? A: 3-5 days.&#10;Q: Do you offer revisions? A: Yes, unlimited." style={FS.ta} rows={4}/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const FS = {
    inp: {width:'100%',padding:'12px 14px',background:'#030305',border:'1px solid #1e1e35',borderRadius:10,color:'#eeeeff',fontSize:14,outline:'none'} as React.CSSProperties,
    ta:  {width:'100%',padding:'12px 14px',background:'#030305',border:'1px solid #1e1e35',borderRadius:10,color:'#eeeeff',fontSize:14,outline:'none',resize:'vertical',lineHeight:1.7} as React.CSSProperties,
    lbl: {fontSize:11,color:'#4a4a6a',letterSpacing:1.5,display:'block',marginBottom:6,fontWeight:700} as React.CSSProperties,
    sel: {width:'100%',padding:'12px 14px',background:'#030305',border:'1px solid #1e1e35',borderRadius:10,color:'#eeeeff',fontSize:14,outline:'none'} as React.CSSProperties,
};

// ─────────────────────────────────────────────
// ROADMAP CHECKLIST COMPONENT
// ─────────────────────────────────────────────
interface ChecklistTask { task:string; done:boolean; priority:'high'|'medium'|'low'; detail:string; }

function RoadmapChecklist({data}:{data:RoadmapData}) {
    const [checked, setChecked] = useState<Record<string,boolean>>({});
    const toggle = (key:string) => setChecked(prev=>({...prev,[key]:!prev[key]}));
    const allTasks = (data.checklist||[]).flatMap(p=>p.tasks||[]);
    const doneCount = allTasks.filter((_,i)=>checked[i.toString()]).length;
    const pct = allTasks.length ? Math.round((doneCount/allTasks.length)*100) : 0;
    let taskIdx = 0;

    return (
        <div>
            {/* Progress */}
            <div style={{background:'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.08))',border:'1px solid rgba(99,102,241,.25)',borderRadius:22,padding:'28px 32px',marginBottom:20,display:'flex',alignItems:'center',gap:28}}>
                <ScoreRing score={pct} size={110}/>
                <div>
                    <div style={{fontSize:28,fontWeight:900,color:'#eeeeff',marginBottom:6}}>{data.estimatedDays} days to your first client</div>
                    <div style={{fontSize:15,color:'#4a4a6a',marginBottom:12}}>Follow every step. Tick as you go. Don&apos;t skip anything.</div>
                    <div style={{width:320,height:8,background:'#1e1e35',borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#6366f1,#10b981)',borderRadius:4,transition:'width .4s'}}/>
                    </div>
                    <div style={{fontSize:13,color:'#4a4a6a',marginTop:6}}>{doneCount} of {allTasks.length} tasks completed</div>
                </div>
            </div>

            {/* Phase checklists */}
            {(data.checklist||[]).map((phase,pi)=>(
                <div key={pi} style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:16,padding:'22px 24px',marginBottom:14}}>
                    <div style={{fontSize:16,fontWeight:800,color:'#eeeeff',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff',flexShrink:0}}>{pi+1}</div>
                        {phase.phase}
                    </div>
                    {(phase.tasks||[]).map((task)=>{
                        const key = taskIdx.toString();
                        const isDone = checked[key]||false;
                        const priColor = task.priority==='high'?'#ef4444':task.priority==='medium'?'#f59e0b':'#10b981';
                        taskIdx++;
                        return (
                            <div key={key} onClick={()=>toggle(key)}
                                 style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'1px solid #1e1e35',cursor:'pointer',opacity:isDone?.6:1,transition:'opacity .2s'}}>
                                <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${isDone?'#6366f1':'#1e1e35'}`,background:isDone?'#6366f1':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,transition:'all .2s'}}>
                                    {isDone && <span style={{color:'#fff',fontSize:14,fontWeight:900}}>✓</span>}
                                </div>
                                <div style={{flex:1}}>
                                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                                        <span style={{fontSize:14,fontWeight:700,color:isDone?'#2a2a45':'#eeeeff',textDecoration:isDone?'line-through':'none'}}>{task.task}</span>
                                        <span style={{fontSize:10,fontWeight:700,color:priColor,background:`${priColor}12`,border:`1px solid ${priColor}33`,borderRadius:4,padding:'2px 7px',letterSpacing:.5}}>{task.priority.toUpperCase()}</span>
                                    </div>
                                    {task.detail && <div style={{fontSize:13,color:'#4a4a6a',lineHeight:1.6}}>{task.detail}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <InfoBox title="💰 BID STRATEGY">
                    <div style={{fontSize:14,color:'#9898bb',lineHeight:1.75}}>{data.bidStrategy}</div>
                </InfoBox>
                <InfoBox title="💵 PRICING FOR FIRST CLIENT">
                    <div style={{fontSize:14,color:'#9898bb',lineHeight:1.75}}>{data.pricingForFirstClient}</div>
                </InfoBox>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <InfoBox title="🚫 MISTAKES TO AVOID">
                    {(data.mistakes||[]).map((m,i)=><ListRow key={i} color="#ef4444">✗ {m}</ListRow>)}
                </InfoBox>
                <InfoBox title="✅ YOU'RE ON TRACK WHEN">
                    {(data.successSigns||[]).map((s,i)=><ListRow key={i} color="#10b981">✓ {s}</ListRow>)}
                </InfoBox>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// CREATE GIG RESULT — fully editable
// ─────────────────────────────────────────────
function EditField({value,onChange,multiline=false,fontSize=14}:{value:string;onChange:(v:string)=>void;multiline?:boolean;fontSize?:number}) {
    const base:React.CSSProperties = {width:'100%',background:'#030305',border:'1px solid #1e1e35',borderRadius:10,color:'#eeeeff',fontSize,outline:'none',padding:'12px 14px',lineHeight:1.75,fontFamily:"'Fira Code',monospace",resize:'vertical'};
    return multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} style={{...base,minHeight:180}} rows={8}/>
        : <input type="text" value={value} onChange={e=>onChange(e.target.value)} style={base}/>;
}

function EditableSection({label,labelColor='#6366f1',children}:{label:string;labelColor?:string;children:React.ReactNode}) {
    return (
        <div style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:16,padding:'22px 24px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:labelColor,letterSpacing:1.5,marginBottom:12}}>{label}</div>
            {children}
        </div>
    );
}

function CreateGigResult({d}:{d:CreateGigData}) {
    const [title,    setTitle]    = useState(d.gigTitle||'');
    const [tags,     setTags]     = useState<string[]>(d.tags||[]);
    const [desc,     setDesc]     = useState(d.description||'');
    const [faq,      setFaq]      = useState<{question:string;answer:string}[]>(d.faq||[]);
    const [pricing,  setPricing]  = useState(d.pricing||{basic:{name:'',price:'',delivery:'',revisions:'',includes:[]},standard:{name:'',price:'',delivery:'',revisions:'',includes:[]},premium:{name:'',price:'',delivery:'',revisions:'',includes:[]}});
    const rawThumb = d.thumbnailDesignBrief || d.thumbnailConcept || '';
    const thumbInit = typeof rawThumb === 'object' ? JSON.stringify(rawThumb, null, 2) : (rawThumb as string);
    const [thumbConcept, setThumbConcept] = useState(thumbInit);

    const updateTag  = (i:number,v:string) => { const t=[...tags]; t[i]=v; setTags(t); };
    const updateFaqQ = (i:number,v:string) => { const f=[...faq]; f[i]={...f[i],question:v}; setFaq(f); };
    const updateFaqA = (i:number,v:string) => { const f=[...faq]; f[i]={...f[i],answer:v}; setFaq(f); };
    const updateTierField = (tier:'basic'|'standard'|'premium', field:keyof PriceTier, val:string) => {
        setPricing(prev=>({...prev,[tier]:{...prev[tier],[field]:val}}));
    };
    const updateTierInclude = (tier:'basic'|'standard'|'premium', idx:number, val:string) => {
        const inc = [...(pricing[tier].includes||[])]; inc[idx]=val;
        setPricing(prev=>({...prev,[tier]:{...prev[tier],includes:inc}}));
    };

    const faqText  = faq.map(qa=>`Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
    const tierText = (tier:'basic'|'standard'|'premium') => {
        const t = pricing[tier];
        return `${tier.toUpperCase()} — ${t.name}\nPrice: ${t.price}\nDelivery: ${t.delivery} days\nRevisions: ${t.revisions}\nIncludes:\n${(t.includes||[]).map((x:string)=>`• ${x}`).join('\n')}`;
    };

    const tierColors:Record<string,string> = {basic:'#10b981',standard:'#6366f1',premium:'#8b5cf6'};

    return (
        <div>
            {/* TITLE */}
            <EditableSection label="✦ GIG TITLE — edit then copy" labelColor="#6366f1">
                <EditField value={title} onChange={setTitle}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                    <div style={{fontSize:12,color:title.length>80?'#ef4444':'#2a2a45'}}>{title.length}/80 chars {title.length>80?'⚠ TOO LONG':''}</div>
                    <CopyBtn text={title} label="⎘ Copy Title"/>
                </div>
            </EditableSection>

            {/* TAGS */}
            <EditableSection label="🏷 GIG TAGS — edit each tag then copy all" labelColor="#f59e0b">
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:12}}>
                    {tags.map((t,i)=>(
                        <div key={i}>
                            <div style={{fontSize:10,color:'#2a2a45',marginBottom:4}}>Tag {i+1}</div>
                            <input value={t} onChange={e=>updateTag(i,e.target.value)}
                                   style={{width:'100%',background:'#030305',border:'1px solid #1e1e35',borderRadius:8,color:'#f59e0b',fontSize:13,padding:'8px 10px',outline:'none'}}/>
                        </div>
                    ))}
                </div>
                <CopyBtn text={tags.join(', ')} label="⎘ Copy All Tags"/>
            </EditableSection>

            {/* DESCRIPTION */}
            <EditableSection label="📄 GIG DESCRIPTION — edit then copy" labelColor="#10b981">
                <EditField value={desc} onChange={setDesc} multiline fontSize={13}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                    <div style={{fontSize:12,color:desc.length<1200?'#f59e0b':'#10b981'}}>{desc.length} chars {desc.length<1200?'⚠ Recommended: 1200+':'✓ Good length'}</div>
                    <CopyBtn text={desc} label="⎘ Copy Description"/>
                </div>
            </EditableSection>

            {/* PRICING */}
            <div style={{fontFamily:"'Lexend',sans-serif",fontSize:15,fontWeight:700,color:'#eeeeff',marginBottom:12}}>💰 Pricing Tiers — edit and copy each</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:14}}>
                {(['basic','standard','premium'] as const).map(tier=>{
                    const t = pricing[tier]; if(!t) return null;
                    const tc = tierColors[tier];
                    return (
                        <div key={tier} style={{background:'#08080f',border:`1px solid ${tc}33`,borderRadius:16,padding:'20px',boxShadow:tier==='standard'?`0 0 24px ${tc}15`:'none'}}>
                            {tier==='standard'&&<div style={{fontSize:9,fontWeight:800,color:tc,letterSpacing:2,marginBottom:8}}>★ RECOMMENDED</div>}
                            <div style={{fontSize:11,color:tc,letterSpacing:2,marginBottom:10,fontWeight:700}}>{tier.toUpperCase()}</div>
                            <div style={{display:'grid',gap:8,marginBottom:10}}>
                                {[['Package Name','name'],['Price (e.g. $25)','price'],['Delivery (days)','delivery'],['Revisions','revisions']].map(([lbl,field])=>(
                                    <div key={field}>
                                        <div style={{fontSize:10,color:'#2a2a45',marginBottom:3}}>{lbl}</div>
                                        <input value={String(t[field as keyof PriceTier]||'')} onChange={e=>updateTierField(tier,field as keyof PriceTier,e.target.value)}
                                               style={{width:'100%',background:'#030305',border:'1px solid #1e1e35',borderRadius:8,color:'#eeeeff',fontSize:13,padding:'8px 10px',outline:'none'}}/>
                                    </div>
                                ))}
                                <div>
                                    <div style={{fontSize:10,color:'#2a2a45',marginBottom:4}}>Includes (one per line)</div>
                                    {(t.includes||[]).map((inc:string,i:number)=>(
                                        <input key={i} value={inc} onChange={e=>updateTierInclude(tier,i,e.target.value)}
                                               style={{width:'100%',background:'#030305',border:'1px solid #1e1e35',borderRadius:8,color:'#9898bb',fontSize:12,padding:'6px 10px',outline:'none',marginBottom:4}}/>
                                    ))}
                                </div>
                            </div>
                            <CopyBtn text={tierText(tier)} label="⎘ Copy Tier"/>
                        </div>
                    );
                })}
            </div>

            {/* FAQ */}
            <EditableSection label="❓ FREQUENTLY ASKED QUESTIONS — what clients will ask you" labelColor="#a78bfa">
                {faq.map((qa,i)=>(
                    <div key={i} style={{padding:'12px 0',borderBottom:'1px solid #1e1e35'}}>
                        <div style={{fontSize:11,color:'#4a4a6a',marginBottom:4}}>Q{i+1} Question</div>
                        <input value={qa.question} onChange={e=>updateFaqQ(i,e.target.value)}
                               style={{width:'100%',background:'#030305',border:'1px solid #1e1e35',borderRadius:8,color:'#eeeeff',fontSize:13,padding:'8px 10px',outline:'none',marginBottom:8}}/>
                        <div style={{fontSize:11,color:'#4a4a6a',marginBottom:4}}>Answer</div>
                        <textarea value={qa.answer} onChange={e=>updateFaqA(i,e.target.value)} rows={2}
                                  style={{width:'100%',background:'#030305',border:'1px solid #1e1e35',borderRadius:8,color:'#9898bb',fontSize:13,padding:'8px 10px',outline:'none',resize:'vertical',lineHeight:1.6}}/>
                    </div>
                ))}
                <div style={{marginTop:12}}><CopyBtn text={faqText} label="⎘ Copy All FAQ"/></div>
            </EditableSection>

            {/* THUMBNAIL */}
            <div style={{background:'rgba(236,72,153,.04)',border:'1px solid rgba(236,72,153,.25)',borderRadius:16,padding:'22px 24px',marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:'#ec4899',letterSpacing:1.5,marginBottom:4}}>🖼 THUMBNAIL DESIGN BRIEF — Your Canva Blueprint</div>
                <div style={{fontSize:12,color:'#2a2a45',marginBottom:12}}>Canva size: 1280 × 769px — edit the concept below, then follow the checklist</div>
                <EditField value={thumbConcept} onChange={setThumbConcept} multiline fontSize={13}/>
                <div style={{marginTop:14}}>
                    <div style={{fontSize:11,color:'#4a4a6a',fontWeight:700,letterSpacing:1,marginBottom:8}}>DESIGN CHECKLIST</div>
                    {(d.thumbnailChecklist||[]).map((item,i)=>(
                        <div key={i} style={{fontSize:13,color:'#9898bb',padding:'7px 0',borderBottom:'1px solid rgba(236,72,153,.1)',display:'flex',gap:8,alignItems:'flex-start'}}>
                            <span style={{color:'#ec4899',flexShrink:0}}>☐</span> {item}
                        </div>
                    ))}
                </div>
                <div style={{marginTop:14,padding:'14px',background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.15)',borderRadius:10}}>
                    <div style={{fontSize:11,color:'#6366f1',fontWeight:700,marginBottom:6}}>💡 FREE THUMBNAIL TOOLS</div>
                    <div style={{fontSize:13,color:'#9898bb',lineHeight:1.7}}>
                        → <b style={{color:'#eeeeff'}}>Canva.com</b> — Free, easiest option. Search &quot;Fiverr gig thumbnail&quot; for ready-made templates.<br/>
                        → <b style={{color:'#eeeeff'}}>Adobe Express</b> — Free tier available, professional quality.<br/>
                        → <b style={{color:'#eeeeff'}}>Size:</b> 1280×769px · <b style={{color:'#eeeeff'}}>Format:</b> JPG or PNG · <b style={{color:'#eeeeff'}}>Max file size:</b> 5MB
                    </div>
                </div>
                <div style={{marginTop:10}}><CopyBtn text={thumbConcept} label="⎘ Copy Concept"/></div>
            </div>

            {/* SEO + First Order */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <InfoBox title="📈 SEO TIPS">
                    {(d.seoTips||[]).map((t,i)=><ListRow key={i} color="#6366f1">→ {t}</ListRow>)}
                </InfoBox>
                <InfoBox title="🚀 GET FIRST ORDER FAST">
                    {(d.firstOrderTips||[]).map((t,i)=><ListRow key={i} color="#10b981">✓ {t}</ListRow>)}
                </InfoBox>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function Home() {
    const [step,      setStep]      = useState<Step>('platform');
    const [platform,  setPlatform]  = useState('');
    const [intention, setIntention] = useState('');
    const [skills,    setSkills]    = useState<string[]>([]);
    const [formData,  setFormData]  = useState<Record<string,string>>({});
    const [gigs,      setGigs]      = useState<GigEntry[]>([emptyGig()]);
    const [gigCount,  setGigCount]  = useState(1);
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState('');
    const [result,    setResult]    = useState<ResultData|null>(null);
    const [mounted,   setMounted]   = useState(false);

    useEffect(()=>{ setMounted(true); },[]);

    const selP  = PLATFORMS.find(p=>p.id===platform);
    const selI  = ALL_INTENTIONS.find(i=>i.id===intention);
    const fields = getFields(platform, intention);
    const platformIntentions = ALL_INTENTIONS.filter(i=>i.platforms.includes(platform));

    const toggleSkill = (s:string) => setSkills((prev:string[])=>prev.includes(s)?prev.filter((x:string)=>x!==s):[...prev,s]);
    const setForm = (k:string,v:string) => setFormData((prev:Record<string,string>)=>({...prev,[k]:v}));
    const reset = () => { setStep('platform'); setPlatform(''); setIntention(''); setSkills([]); setFormData({}); setGigs([emptyGig()]); setGigCount(1); setResult(null); setError(''); };

    // Skills required only when the intention needs them
    const needsSkills = selI?.skillsRequired ?? true;

    const canRun = !needsSkills || skills.length > 0;

    const run = useCallback(async () => {
        setLoading(true); setError(''); setResult(null);
        try {
            const body: Record<string,unknown> = { intention, platform, skills };
            if (intention==='gig_audit'||intention==='full_audit') {
                body.gigs = gigs.slice(0,gigCount);
                body.formData = formData;
            } else if (intention==='message') {
                body.messageText = formData.messageText||'';
            } else {
                body.formData = formData;
            }
            const res  = await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
            const json = await res.json();
            if (!json.ok) throw new Error(json.error||'Analysis failed');
            setResult(json.data);
            setStep('result');
        } catch(e:unknown) {
            setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
        }
        setLoading(false);
    }, [intention, platform, skills, gigs, gigCount, formData]);

    if (!mounted) return null;

    // ── LOADING ──
    if (loading) return (
        <div style={{minHeight:'100vh',background:'#030305',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Blob/>
            <div style={{textAlign:'center',position:'relative',zIndex:1}}>
                <div style={{width:80,height:80,border:'3px solid #1e1e35',borderTop:`3px solid ${selI?.color||'#6366f1'}`,borderRadius:'50%',animation:'spin .9s linear infinite',margin:'0 auto 28px',boxShadow:`0 0 40px ${selI?.color||'#6366f1'}44`}}/>
                <h2 style={{fontSize:28,fontWeight:800,color:'#eeeeff',marginBottom:10,letterSpacing:'-1px'}}>Analysing with AI...</h2>
                <p style={{fontSize:15,color:'#4a4a6a',marginBottom:24}}>{selI?.label} · {selP?.name} · Please wait 15-30 seconds</p>
                <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'center'}}>
                    {['Scanning every field','Checking platform algorithm','Finding all issues','Writing your exact fixes','Building your action plan'].map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#4a4a6a',animation:`pulse 1.5s ease ${i*.4}s infinite`}}>
                            <div style={{width:6,height:6,borderRadius:'50%',background:selI?.color||'#6366f1',flexShrink:0}}/>
                            {s}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── STEP 1: PLATFORM ──
    if (step==='platform') return (
        <div style={{minHeight:'100vh',background:'#030305',position:'relative',overflow:'hidden'}}>
            <Blob/>
            <TopBar step={1} onHome={reset}/>
            <div style={{maxWidth:860,margin:'0 auto',padding:'60px 24px 80px',position:'relative',zIndex:1}}>
                <div style={{textAlign:'center',marginBottom:48}}>
                    <div style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:13,color:'#6366f1',background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:20,padding:'7px 18px',marginBottom:24}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:'#6366f1',boxShadow:'0 0 8px #6366f1',display:'inline-block',animation:'pulse 2s ease infinite'}}/>
                        The #1 Free Freelancer Success Platform
                    </div>
                    <h1 style={{fontSize:'clamp(40px,6vw,72px)',fontWeight:900,color:'#eeeeff',letterSpacing:'-3px',lineHeight:1.05,marginBottom:18}}>
                        Stop losing clients.<br/>
                        <span style={{background:'linear-gradient(135deg,#6366f1,#ec4899,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Start winning them.</span>
                    </h1>
                    <p style={{fontSize:18,color:'#4a4a6a',lineHeight:1.75,maxWidth:520,margin:'0 auto'}}>
                        AI-powered profile optimization, gig creation, proposal writing and more — tailored to your platform&apos;s algorithm.
                    </p>
                </div>
                <div style={{marginBottom:20,textAlign:'center'}}>
                    <div style={{fontSize:13,color:'#4a4a6a',marginBottom:16,letterSpacing:1}}>SELECT YOUR PLATFORM TO GET STARTED</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:14,maxWidth:780,margin:'0 auto'}}>
                        {PLATFORMS.map(p=>(
                            <button key={p.id} onClick={()=>{setPlatform(p.id);setStep('intention');}}
                                    style={{background:'#08080f',border:'2px solid #1e1e35',borderRadius:20,padding:'28px 20px',cursor:'pointer',textAlign:'center',transition:'all .25s',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}
                                    onMouseEnter={e=>{(e.currentTarget).style.borderColor=p.color;(e.currentTarget).style.boxShadow=`0 0 30px ${p.color}22`;(e.currentTarget).style.background=`${p.color}08`;}}
                                    onMouseLeave={e=>{(e.currentTarget).style.borderColor='#1e1e35';(e.currentTarget).style.boxShadow='none';(e.currentTarget).style.background='#08080f';}}>
                                {p.logo}
                                <div style={{fontSize:17,fontWeight:800,color:'#eeeeff'}}>{p.name}</div>
                                <div style={{fontSize:13,color:'#4a4a6a'}}>{p.desc}</div>
                                <div style={{fontSize:11,color:p.color,fontWeight:600,letterSpacing:1}}>SELECT →</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginTop:32}}>
                    {['Profile Score /100','Copy-Paste Fixes','Gig Creator','Proposal Writer','First Client Checklist','100% Free'].map(c=>(
                        <div key={c} style={{fontSize:13,color:'#10b981',background:'rgba(16,185,129,.06)',border:'1px solid rgba(16,185,129,.15)',borderRadius:20,padding:'6px 16px'}}>✓ {c}</div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── STEP 2: INTENTION ──
    if (step==='intention') return (
        <div style={{minHeight:'100vh',background:'#030305',position:'relative',overflow:'hidden'}}>
            <Blob/>
            <TopBar step={2} onHome={reset}/>
            <div style={{maxWidth:860,margin:'0 auto',padding:'48px 24px 80px',position:'relative',zIndex:1}}>
                <button onClick={()=>setStep('platform')} style={{fontSize:13,color:'#4a4a6a',background:'none',border:'none',cursor:'pointer',marginBottom:24,padding:'4px 0'}}>← Back</button>
                <div style={{textAlign:'center',marginBottom:36}}>
                    <div style={{marginBottom:12}}>{selP?.logo}</div>
                    <h2 style={{fontSize:36,fontWeight:900,color:'#eeeeff',letterSpacing:'-1.5px',marginBottom:8}}>What do you want to do on {selP?.name}?</h2>
                    <p style={{fontSize:16,color:'#4a4a6a'}}>Select your goal — we&apos;ll show only what you need</p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
                    {platformIntentions.map(i=>(
                        <button key={i.id}
                                onClick={()=>{setIntention(i.id);setStep('form');}}
                                style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:16,padding:'22px 20px',cursor:'pointer',textAlign:'left',transition:'all .2s',display:'flex',gap:16,alignItems:'flex-start'}}
                                onMouseEnter={e=>{(e.currentTarget).style.borderColor=`${i.color}55`;(e.currentTarget).style.background=`${i.color}08`;(e.currentTarget).style.boxShadow=`0 0 24px ${i.color}15`;}}
                                onMouseLeave={e=>{(e.currentTarget).style.borderColor='#1e1e35';(e.currentTarget).style.background='#08080f';(e.currentTarget).style.boxShadow='none';}}>
                            <div style={{fontSize:28,flexShrink:0,marginTop:2}}>{i.icon}</div>
                            <div>
                                <div style={{fontSize:15,fontWeight:800,color:'#eeeeff',marginBottom:6,lineHeight:1.3}}>{i.label}</div>
                                <div style={{fontSize:13,color:'#4a4a6a',lineHeight:1.6}}>{i.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── STEP 3: FORM ──
    if (step==='form') {
        const needsGigs = intention==='gig_audit'||intention==='full_audit';
        const noForm    = intention==='templates';

        return (
            <div style={{minHeight:'100vh',background:'#030305',position:'relative',overflow:'hidden'}}>
                <Blob/>
                <TopBar step={3} onHome={reset}/>
                <div style={{maxWidth:860,margin:'0 auto',padding:'40px 24px 80px',position:'relative',zIndex:1}}>
                    <button onClick={()=>setStep('intention')} style={{fontSize:13,color:'#4a4a6a',background:'none',border:'none',cursor:'pointer',marginBottom:24,padding:'4px 0'}}>← Back</button>
                    <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:28}}>
                        <div style={{fontSize:32}}>{selI?.icon}</div>
                        <div>
                            <h2 style={{fontSize:26,fontWeight:900,color:'#eeeeff',letterSpacing:'-1px',marginBottom:4}}>{selI?.label}</h2>
                            <div style={{fontSize:14,color:'#4a4a6a'}}>{selP?.name} · {selI?.desc}</div>
                        </div>
                    </div>

                    <div style={{background:'rgba(8,8,15,.95)',border:'1px solid #1e1e35',borderRadius:22,padding:'36px',backdropFilter:'blur(16px)'}}>

                        {/* Skills selector — only shown when needed */}
                        {needsSkills && (
                            <div style={{marginBottom:28}}>
                                <div style={{fontSize:11,color:'#4a4a6a',letterSpacing:2,fontWeight:700,marginBottom:8}}>YOUR SKILLS <span style={{color:'#6366f1'}}>(select all that apply)</span></div>
                                {skills.length>0 && (
                                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                                        {skills.map(s=>(
                                            <span key={s} onClick={()=>toggleSkill(s)} style={{fontSize:12,fontWeight:600,color:'#6366f1',background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.3)',borderRadius:20,padding:'5px 12px',cursor:'pointer'}}>
                        {s} ×
                      </span>
                                        ))}
                                    </div>
                                )}
                                {Object.entries(SKILL_GROUPS).map(([group,list])=>(
                                    <div key={group} style={{marginBottom:12}}>
                                        <div style={{fontSize:10,color:'#2a2a45',letterSpacing:1.5,fontWeight:700,marginBottom:6}}>{group.toUpperCase()}</div>
                                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                                            {list.map(s=>(
                                                <button key={s} onClick={()=>toggleSkill(s)}
                                                        style={{fontSize:12,padding:'7px 13px',background:skills.includes(s)?'rgba(99,102,241,.1)':'#050507',border:`1px solid ${skills.includes(s)?'rgba(99,102,241,.4)':'#1e1e35'}`,borderRadius:8,color:skills.includes(s)?'#818cf8':'#4a4a6a',cursor:'pointer',transition:'all .15s',fontWeight:skills.includes(s)?700:400}}>
                                                    {skills.includes(s)?'✓ ':''}{s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Dynamic fields */}
                        {!noForm && fields.length>0 && (
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
                                {fields.map(f=>(
                                    <div key={f.key} style={f.type==='textarea'?{gridColumn:'1/-1'}:{}}>
                                        <label style={FS.lbl}>{f.label}{f.required&&<span style={{color:'#6366f1'}}> *</span>}</label>
                                        {f.hint&&<div style={{fontSize:12,color:'#2a2a45',marginBottom:6,lineHeight:1.5}}>{f.hint}</div>}
                                        {f.type==='select'
                                            ? <select value={formData[f.key]||''} onChange={e=>setForm(f.key,e.target.value)} style={FS.sel}>
                                                <option value="">Select...</option>
                                                {(f.options||[]).map(o=><option key={o} value={o}>{o}</option>)}
                                            </select>
                                            : f.type==='textarea'
                                                ? <textarea value={formData[f.key]||''} onChange={e=>setForm(f.key,e.target.value)} placeholder={f.placeholder} style={FS.ta} rows={5}/>
                                                : <input type="text" value={formData[f.key]||''} onChange={e=>setForm(f.key,e.target.value)} placeholder={f.placeholder} style={FS.inp}/>
                                        }
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Gig form */}
                        {needsGigs && (
                            <div style={{marginBottom:24}}>
                                <div style={{fontSize:11,color:'#4a4a6a',letterSpacing:2,fontWeight:700,marginBottom:16}}>
                                    {intention==='full_audit'?'YOUR GIGS (add all your existing gigs)':'YOUR GIGS TO ANALYSE'}
                                </div>
                                <GigForm gigs={gigs} setGigs={setGigs} count={gigCount} setCount={setGigCount}/>
                            </div>
                        )}

                        {noForm && (
                            <div style={{textAlign:'center',padding:'24px 0',color:'#4a4a6a',fontSize:15}}>
                                No details needed — just click run and we&apos;ll generate your templates! 🚀
                            </div>
                        )}

                        {error && <div style={{padding:'14px 18px',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.25)',borderRadius:12,color:'#ef4444',fontSize:14,marginBottom:16}}>⚠ {error}</div>}

                        <button onClick={run} disabled={!canRun}
                                style={{width:'100%',fontSize:16,fontWeight:800,padding:'18px 28px',background:`linear-gradient(135deg,${selI?.color||'#6366f1'},${selI?.color||'#6366f1'}cc)`,color:'#fff',border:'none',borderRadius:14,cursor:canRun?'pointer':'not-allowed',opacity:canRun?1:.4,display:'flex',alignItems:'center',justifyContent:'center',gap:12,boxShadow:`0 8px 32px ${selI?.color||'#6366f1'}33`,letterSpacing:'-.3px',marginTop:8}}>
                            <span style={{fontSize:20}}>{selI?.icon}</span>
                            Run {selI?.label} →
                        </button>
                        {!canRun && needsSkills && <p style={{textAlign:'center',color:'#2a2a45',fontSize:13,marginTop:10}}>Select at least one skill above to continue</p>}
                    </div>
                </div>
            </div>
        );
    }

    // ── STEP 4: RESULT ──
    if (step==='result' && result) {
        return (
            <div style={{minHeight:'100vh',background:'#030305',position:'relative',display:'flex',flexDirection:'column'}}>
                <Blob/>
                <TopBar step={4} onHome={reset}/>
                <div style={{display:'flex',flex:1}}>
                    {/* Sidebar */}
                    <aside style={{width:256,background:'rgba(3,3,5,.98)',borderRight:'1px solid #1e1e35',padding:'24px 14px',display:'flex',flexDirection:'column',gap:3,position:'sticky',top:0,height:'calc(100vh - 73px)',overflowY:'auto',flexShrink:0}}>
                        <div style={{padding:'10px 12px',background:'#08080f',border:`1px solid ${selP?.color||'#1e1e35'}33`,borderRadius:12,marginBottom:8}}>
                            <div style={{fontSize:12,color:selP?.color,fontWeight:700,marginBottom:2}}>{selP?.name}</div>
                            <div style={{fontSize:11,color:'#2a2a45',lineHeight:1.4}}>{skills.length>0?`${skills.slice(0,3).join(', ')}${skills.length>3?` +${skills.length-3} more`:''}`:selI?.label}</div>
                        </div>
                        <div style={{height:1,background:'#1e1e35',margin:'4px 0'}}/>
                        <div style={{fontSize:10,color:'#2a2a45',letterSpacing:2,padding:'0 4px',marginBottom:4,fontWeight:700}}>RUN ANOTHER TOOL</div>
                        {platformIntentions.map(i=>(
                            <button key={i.id} onClick={()=>{setIntention(i.id);setStep('form');setResult(null);}}
                                    style={{display:'flex',alignItems:'center',gap:8,padding:'9px 10px',background:intention===i.id?`${i.color}0a`:'transparent',border:`1px solid ${intention===i.id?`${i.color}44`:'transparent'}`,borderRadius:10,cursor:'pointer',width:'100%',transition:'all .2s'}}>
                                <span style={{fontSize:13,color:i.color,width:18,textAlign:'center',flexShrink:0}}>{i.icon}</span>
                                <span style={{fontSize:12,fontWeight:600,color:intention===i.id?'#eeeeff':'#4a4a6a',textAlign:'left'}}>{i.label}</span>
                            </button>
                        ))}
                        <div style={{height:1,background:'#1e1e35',margin:'8px 0',marginTop:'auto'}}/>
                        <button onClick={reset} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 10px',background:'transparent',border:'1px solid #1e1e35',borderRadius:10,cursor:'pointer',color:'#4a4a6a',fontSize:12,width:'100%',fontFamily:"'Lexend',sans-serif"}}>↺ New Analysis</button>
                    </aside>

                    {/* Main */}
                    <main style={{flex:1,padding:'36px 44px',overflowY:'auto',minWidth:0}}>
                        <div style={{maxWidth:980}}>
                            <div style={{marginBottom:24}}>
                                <h1 style={{fontSize:34,fontWeight:900,color:'#eeeeff',letterSpacing:'-1.5px',marginBottom:4}}>{selI?.icon} {selI?.label}</h1>
                                <div style={{fontSize:14,color:'#4a4a6a'}}>{selP?.name}{skills.length>0?` · ${skills.slice(0,3).join(', ')}${skills.length>3?` +${skills.length-3} more`:''}`:''}</div>
                            </div>

                            {/* FULL AUDIT & PROFILE AUDIT */}
                            {(intention==='full_audit'||intention==='profile_audit') && (
                                !(result as FullAuditData).overallScore
                                    ? <div style={{padding:'40px',textAlign:'center',color:'#ef4444'}}>⚠ No data returned. Please try again.</div>
                                    : <AuditResult data={result as FullAuditData|ProfileAuditData} platform={platform} isFullAudit={intention==='full_audit'}/>
                            )}

                            {/* GIG AUDIT */}
                            {intention==='gig_audit' && (()=>{
                                const d = result as GigAuditData;
                                return (
                                    <div>
                                        {(d.gigs||[]).map((gig,i)=><GigCard key={i} gig={gig}/>)}
                                        {d.crossGigAdvice && (
                                            <InfoBox title="🔗 HOW YOUR GIGS WORK TOGETHER">
                                                <div style={{fontSize:15,color:'#9898bb',lineHeight:1.75}}>{d.crossGigAdvice}</div>
                                            </InfoBox>
                                        )}
                                        {(d.missingGigIdeas||[]).length>0 && (
                                            <InfoBox title="💡 GIGS YOU SHOULD CREATE NEXT">
                                                {d.missingGigIdeas.map((g,i)=><ListRow key={i} color="#6366f1">→ {g}</ListRow>)}
                                            </InfoBox>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* CREATE GIG */}
                            {intention==='create_gig' && (()=>{
                                const d = result as CreateGigData;
                                if (!d || !d.gigTitle) return (
                                    <div style={{padding:'40px',textAlign:'center',color:'#ef4444',fontSize:15}}>
                                        ⚠ No gig data returned. Please try again.
                                    </div>
                                );
                                return <CreateGigResult d={d}/>;
                            })()}

                            {/* REWRITE BIO */}
                            {intention==='rewrite_bio' && (()=>{
                                const d = result as RewriteData;
                                return (
                                    <div>
                                        <BigBox title="✦ Optimized Headline" action={<CopyBtn text={d.rewrittenHeadline||''} label="⎘ Copy Headline"/>}>
                                            <PreText text={d.rewrittenHeadline||''}/>
                                        </BigBox>
                                        <BigBox title={`✦ Optimized Bio (${d.wordCount||0} words)`} action={<CopyBtn text={d.rewrittenBio||''} label="⎘ Copy Bio"/>}>
                                            <PreText text={d.rewrittenBio||''}/>
                                        </BigBox>
                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                                            <InfoBox title="✅ IMPROVEMENTS MADE">
                                                {(d.improvements||[]).map((imp,i)=><ListRow key={i} color="#10b981">→ {imp}</ListRow>)}
                                            </InfoBox>
                                            <InfoBox title="🔑 KEYWORDS ADDED">
                                                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(d.keywordsAdded||[]).map((kw,i)=><Tag key={i}>{kw}</Tag>)}</div>
                                            </InfoBox>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* PROPOSAL */}
                            {intention==='proposal' && (()=>{
                                const d = result as ProposalData;
                                return (
                                    <div>
                                        {d.subject && (
                                            <div style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.2)',borderRadius:14,padding:'16px 20px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                                <div><div style={{fontSize:11,color:'#6366f1',fontWeight:700,marginBottom:4}}>SUBJECT LINE</div><div style={{fontSize:16,fontWeight:700,color:'#eeeeff'}}>{d.subject}</div></div>
                                                <CopyBtn text={d.subject} label="⎘ Copy Subject"/>
                                            </div>
                                        )}
                                        <BigBox title="📝 Your Winning Proposal" action={<CopyBtn text={d.proposal||''} label="⎘ Copy Proposal"/>}>
                                            <PreText text={d.proposal||''}/>
                                        </BigBox>
                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                                            <InfoBox title="💪 WHY THIS WINS">
                                                {(d.keyStrengths||[]).map((s,i)=><ListRow key={i} color="#10b981">✓ {s}</ListRow>)}
                                            </InfoBox>
                                            <InfoBox title="✏️ PERSONALISE BEFORE SENDING">
                                                {(d.customizeTips||[]).map((t,i)=><ListRow key={i}>→ {t}</ListRow>)}
                                            </InfoBox>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* REPLY TEMPLATES */}
                            {intention==='templates' && (()=>{
                                const d = result as TemplatesData;
                                return (
                                    <div>
                                        {(d.templates||[]).map((t,i)=>(
                                            <BigBox key={i} title={`${i+1}. ${t.scenario}`} action={<CopyBtn text={t.template||''} label="⎘ Copy Template"/>}>
                                                <PreText text={t.template||''}/>
                                                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                                                    <div style={{padding:'10px 14px',background:'rgba(16,185,129,.06)',border:'1px solid rgba(16,185,129,.15)',borderRadius:8,fontSize:13,color:'#10b981',lineHeight:1.6}}>💡 {t.tips}</div>
                                                    <div style={{padding:'10px 14px',background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.15)',borderRadius:8,fontSize:13,color:'#ef4444',lineHeight:1.6}}>🚫 {t.avoid}</div>
                                                </div>
                                            </BigBox>
                                        ))}
                                    </div>
                                );
                            })()}

                            {/* MESSAGE ANALYSER */}
                            {intention==='message' && (()=>{
                                const d = result as MessageData;
                                const bCol = d.budgetSignal==='high'?'#10b981':d.budgetSignal==='low'?'#ef4444':'#f59e0b';
                                const uCol = d.urgency==='high'?'#ef4444':d.urgency==='low'?'#10b981':'#f59e0b';
                                return (
                                    <div>
                                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
                                            {([['Budget Signal',d.budgetSignal||'?',bCol],['Urgency',d.urgency||'?',uCol],['Seriousness',d.seriousness||'?','#8b5cf6']] as [string,string,string][]).map(([lbl,val,col])=>(
                                                <div key={lbl} style={{background:'#08080f',border:'1px solid #1e1e35',borderRadius:14,padding:'20px',textAlign:'center'}}>
                                                    <div style={{fontSize:24,fontWeight:900,color:col,marginBottom:4,textTransform:'uppercase'}}>{val}</div>
                                                    <div style={{fontSize:12,color:'#2a2a45'}}>{lbl}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
                                            <InfoBox title="🟢 GREEN FLAGS">
                                                {(d.greenFlags||[]).length===0?<div style={{fontSize:14,color:'#4a4a6a'}}>None detected</div>:(d.greenFlags||[]).map((f,i)=><ListRow key={i} color="#10b981">✓ {f}</ListRow>)}
                                            </InfoBox>
                                            <InfoBox title="🔴 RED FLAGS">
                                                {(d.redFlags||[]).length===0?<div style={{fontSize:14,color:'#10b981'}}>✓ No red flags</div>:(d.redFlags||[]).map((f,i)=><ListRow key={i} color="#ef4444">⚠ {f}</ListRow>)}
                                            </InfoBox>
                                        </div>
                                        <InfoBox title="🧠 YOUR STRATEGY">
                                            <div style={{fontSize:15,color:'#9898bb',lineHeight:1.75}}>{d.strategy}</div>
                                            {(d.negotiationTips||[]).length>0 && <>
                                                <div style={{fontSize:11,color:'#6366f1',fontWeight:700,letterSpacing:1.5,margin:'14px 0 8px'}}>💰 NEGOTIATION TIPS</div>
                                                {d.negotiationTips.map((t,i)=><ListRow key={i} color="#6366f1">→ {t}</ListRow>)}
                                            </>}
                                        </InfoBox>
                                        <BigBox title="✉ Your Professional Reply" action={<CopyBtn text={d.suggestedResponse||''} label="⎘ Copy Reply"/>}>
                                            <PreText text={d.suggestedResponse||''}/>
                                        </BigBox>
                                        <InfoBox title="🚫 DO NOT DO THIS">
                                            {(d.doNot||[]).map((d2,i)=><ListRow key={i} color="#ef4444">✗ {d2}</ListRow>)}
                                        </InfoBox>
                                    </div>
                                );
                            })()}

                            {/* KEYWORDS */}
                            {intention==='keywords' && (()=>{
                                const d = result as KeywordsData;
                                return (
                                    <div>
                                        <InfoBox title="🚨 HIGH-VALUE KEYWORDS YOU'RE MISSING">
                                            {(d.missing||[]).map((kw,i)=>(
                                                <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 90px 90px 2fr',gap:14,padding:'12px 0',borderBottom:'1px solid #1e1e35',alignItems:'start'}}>
                                                    <div style={{fontSize:15,fontWeight:700,color:'#eeeeff'}}>{kw.keyword}</div>
                                                    <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:kw.searchVolume==='high'?'#10b981':kw.searchVolume==='medium'?'#f59e0b':'#4a4a6a'}}>{kw.searchVolume} vol</div>
                                                    <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',color:kw.competition==='low'?'#10b981':kw.competition==='high'?'#ef4444':'#f59e0b'}}>{kw.competition} comp</div>
                                                    <div style={{fontSize:13,color:'#4a4a6a',lineHeight:1.5}}>{kw.howToUse}</div>
                                                </div>
                                            ))}
                                        </InfoBox>
                                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
                                            <InfoBox title="✅ ALREADY USING">
                                                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(d.using||[]).map((kw,i)=><Tag key={i} color="#10b981">{kw}</Tag>)}</div>
                                            </InfoBox>
                                            <InfoBox title="💎 LONG-TAIL OPPORTUNITIES">
                                                {(d.longTail||[]).map((lt,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid #1e1e35'}}><div style={{fontSize:13,fontWeight:700,color:'#eeeeff'}}>{lt.keyword}</div><div style={{fontSize:12,color:'#4a4a6a',marginTop:2}}>{lt.reason}</div></div>)}
                                            </InfoBox>
                                            <InfoBox title="📍 LOCAL KEYWORDS">
                                                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{(d.localKeywords||[]).map((kw,i)=><Tag key={i} color="#06b6d4">{kw}</Tag>)}</div>
                                            </InfoBox>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ROADMAP — interactive checklist */}
                            {intention==='roadmap' && <RoadmapChecklist data={result as RoadmapData}/>}

                            {/* WHAT TO DO NEXT */}
                            <div style={{background:'linear-gradient(135deg,rgba(16,185,129,.06),rgba(6,182,212,.06))',border:'1px solid rgba(16,185,129,.2)',borderRadius:16,padding:'24px 28px',marginTop:24}}>
                                <div style={{fontSize:13,fontWeight:700,color:'#10b981',letterSpacing:1.5,marginBottom:10}}>⚡ WHAT TO DO NEXT</div>
                                <div style={{fontSize:15,color:'#9898bb',lineHeight:1.7,marginBottom:16}}>Applied the fixes? Run another tool to keep improving.</div>
                                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                                    {platformIntentions.filter(i=>i.id!==intention).slice(0,4).map(i=>(
                                        <button key={i.id} onClick={()=>{setIntention(i.id);setStep('form');setResult(null);}}
                                                style={{fontSize:13,padding:'8px 16px',background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.2)',borderRadius:8,color:'#10b981',cursor:'pointer',fontFamily:"'Lexend',sans-serif"}}>
                                            {i.icon} {i.label} →
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return null;
}