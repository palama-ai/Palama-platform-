export type NewsSource = {
  outlet: string;
  date: string;
  title: string;
  url: string;
};

export type NewsArticle = {
  slug: string;
  tag: "Company" | "Product" | "Press";
  date: string;
  eventDate: string;
  title: string;
  summary: string;
  image: string;
  imagePosition?: string;
  gallery: Array<{ src: string; caption: string }>;
  paragraphs: string[];
  highlights: Array<{ label: string; value: string }>;
  sources: NewsSource[];
};

export const PRESS_SOURCES: NewsSource[] = [
  {
    outlet: "Al Akhawayn University (AUI)",
    date: "April 2026",
    title: "Ventures Adventure 2026 — AUI Official Report",
    url: "https://aui.ma/news/ventures-adventure-2026",
  },
  {
    outlet: "HIBAPRESS (MAP)",
    date: "April 27, 2026",
    title: "L'Université Al Akhawayn d'Ifrane : Remise des prix de la 9è compétition entrepreneuriale « Ventures Adventure »",
    url: "https://fr.hibapress.com/news-247288.html",
  },
  {
    outlet: "allAfrica / Libération",
    date: "April 28, 2026",
    title: "Maroc : Remise des prix de la 9ème compétition entrepreneuriale 'Ventures Adventure'",
    url: "https://fr.allafrica.com/stories/202604280641.html",
  },
  {
    outlet: "Aujourd'hui le Maroc",
    date: "April 27, 2026",
    title: "Ventures Adventure : Les gagnants de la 9ème édition révélés",
    url: "https://aujourdhui.ma/economie/ventures-adventure-les-gagnants-de-la-9eme-edition-reveles",
  },
  {
    outlet: "Dpress.ma",
    date: "April 25, 2026",
    title: "Université Al Akhawayn d'Ifrane : session de coaching individuel pour les étudiants-entrepreneurs",
    url: "https://dpress.ma/fr/2026/04/25/universite-al-akhawayn-difrane-session-de-coaching-individuel-pour-les-etudiants-entrepreneurs/?noamp=mobile",
  },
  {
    outlet: "2M.ma",
    date: "April 24, 2026",
    title: "Université Al Akhawayn d'Ifrane : session de coaching individuel pour les étudiants-entrepreneurs",
    url: "https://2m.ma/fr/news/Universit%C3%A9-Al-Akhawayn-d-Ifrane-session-de-coaching-individuel-20260424",
  },
  {
    outlet: "LinkedIn — Palama Co-worker",
    date: "May 21, 2026",
    title: "Ventures Adventure 2026 — Palama Persona (NeuradeepAI) Official Recap",
    url: "https://www.linkedin.com/posts/venturesadventure2026-palamapersona-palamapersona-ugcPost-7463324333973598208-ROMJ/",
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "palama-co-worker-formerly-palama-persona-ventures-adventure-2026",
    tag: "Company",
    date: "Apr 27, 2026",
    eventDate: "April 23–25, 2026 • Al Akhawayn University, Ifrane",
    title: "Palama Co-Worker (formerly Palama Persona) earns investment proposal at Ventures Adventure 2026",
    summary:
      "During the 9th edition of Ventures Adventure at Al Akhawayn University in Ifrane, Palama Persona was recognized among promising student-led ventures receiving potential equity investment proposals — marking a foundational milestone toward today's Palama Co-Worker platform.",
    image: "/news/aui-ventures-2026.jpg",
    imagePosition: "center center",
    gallery: [
      {
        src: "/news/aui-ventures-2026.jpg",
        caption: "Founders, finalists, and mentors gathered at Al Akhawayn University during Ventures Adventure 2026 (AUI News).",
      },
      {
        src: "/news/linkedin-palama-persona.jpg",
        caption: "Original Palama Persona architecture poster presented at Ventures Adventure 2026.",
      },
      {
        src: "/news/dpress-coaching.jpg",
        caption: "Al Akhawayn University campus in Ifrane during the individual coaching sessions (Dpress.ma, Apr 25, 2026).",
      },
    ],
    highlights: [
      { label: "Former Brand", value: "Palama Persona" },
      { label: "Current Product", value: "Palama Co-Worker" },
      { label: "Competition Dates", value: "Apr 23–25, 2026" },
      { label: "Program Scale", value: "40 Startups • 12 Equity Proposals" },
    ],
    paragraphs: [
      "Before evolving into Palama Co-Worker, the project originally launched under the name Palama Persona — an autonomous AI system initiated with NeuradeepAI to move software beyond passive chat boxes toward real interface comprehension and task execution.",
      "From April 23 to 25, 2026, Al Akhawayn University in Ifrane (AUI) hosted the 9th edition of its flagship entrepreneurship competition, Ventures Adventure, organized by AUI's Office of Employability and Entrepreneurship (EEO) as the closing highlight of its Entrepreneurship Month.",
      "Across three days of individual coaching, speed mentoring with nearly 50 to 70 mentors, and Angel Rounds featuring 40 student-led startups and over 60 entrepreneurs, the 2026 edition generated 157 ecosystem contributions including 12 equity investment proposals.",
      "At the closing awards ceremony held Saturday, April 25, 2026 on campus — reported by HIBAPRESS (April 27, 2026), Aujourd'hui le Maroc (April 27, 2026), and allAfrica / Libération (April 28, 2026) — Palama Persona was explicitly recognized alongside top participating ventures with a potential equity investment proposal to support its growth and market execution.",
      "Following the competition's investor feedback and product acceleration, Palama Persona matured into Palama Co-Worker: our unified desktop and cloud co-worker designed to operate files, terminal commands, web browsers, and multi-model workflows autonomously.",
    ],
    sources: PRESS_SOURCES,
  },
  {
    slug: "from-palama-persona-to-palama-co-worker",
    tag: "Product",
    date: "May 21, 2026",
    eventDate: "May 21, 2026 • Official Brand Evolution",
    title: "From Palama Persona to Palama Co-Worker: The Large Action Model built beyond the chat box",
    summary:
      "How the Palama Persona vision unveiled during Ventures Adventure 2026 evolved into an integrated Windows desktop assistant and multi-provider AI platform.",
    image: "/news/linkedin-palama-persona.jpg",
    imagePosition: "center top",
    gallery: [
      {
        src: "/news/linkedin-palama-persona.jpg",
        caption: "The Palama Persona launch showcase highlighting multi-step agentic planning, visual context analysis, and native GUI control.",
      },
      {
        src: "/news/aui-ventures-2026.jpg",
        caption: "Ventures Adventure 2026 cohorts and mentors at Al Akhawayn University in Ifrane.",
      },
    ],
    highlights: [
      { label: "Announcement Date", value: "May 21, 2026" },
      { label: "Core Engine", value: "Large Action Model (LAM)" },
      { label: "Initiators", value: "Ayoub Alioui, Nouhaila Lakhchaf, Rolando Soto" },
      { label: "Mentors Credited", value: "Mahmoud Tatari & Touria Benlafqih" },
    ],
    paragraphs: [
      "On May 21, 2026, following the Ventures Adventure 2026 showcase at Al Akhawayn University, the team behind Palama shared the vision powering the transition from Palama Persona to Palama Co-Worker: 'What if tomorrow your computer could work on your behalf?'",
      "As presented in the showcase materials developed with NeuradeepAI, Palama Persona was architected around three pillars beyond standard chatbots: multi-step agentic planning, real-time visual contextual understanding of user interfaces, and native desktop control across files and applications.",
      "By combining sandboxed local execution on Windows with server-verified cloud quotas and intelligent multi-model routing, Palama Persona laid the exact architectural foundation that now powers Palama Co-Worker v1.2.2.",
    ],
    sources: [PRESS_SOURCES[6], PRESS_SOURCES[0], PRESS_SOURCES[1]],
  },
  {
    slug: "aui-ventures-adventure-coaching-mentorship-2026",
    tag: "Press",
    date: "Apr 25, 2026",
    eventDate: "April 24–25, 2026 • Al Akhawayn University, Ifrane",
    title: "Moroccan press highlights Ventures Adventure coaching & AUI's 9th entrepreneurship edition",
    summary:
      "Coverage from Dpress.ma, 2M.ma, and Aujourd'hui le Maroc chronicles the intensive coaching sessions bridging student startups with investors.",
    image: "/news/dpress-coaching.jpg",
    imagePosition: "center center",
    gallery: [
      {
        src: "/news/dpress-coaching.jpg",
        caption: "Al Akhawayn University campus in Ifrane (Dpress.ma, April 25, 2026).",
      },
      {
        src: "/news/aui-ventures-2026.jpg",
        caption: "Finalist startups and ecosystem partners at Ventures Adventure 2026.",
      },
    ],
    highlights: [
      { label: "Coverage Dates", value: "Apr 24 – Apr 28, 2026" },
      { label: "Location", value: "Ifrane, Morocco (AUI)" },
      { label: "Mentors Mobilized", value: "50–70 Industry Experts" },
      { label: "Outlets", value: "2M, Dpress, HIBAPRESS, ALM, allAfrica" },
    ],
    paragraphs: [
      "Ahead of the Saturday awards ceremony, Moroccan media outlets including 2M.ma (April 24, 2026) and Dpress.ma (April 25, 2026) highlighted the individual coaching sessions hosted on the Al Akhawayn University campus in Ifrane.",
      "Featuring insights from Hanene Duprat (Director of Employability and Entrepreneurship at AUI), Mahmoud Tatari (Lead Coach of Entrepreneurship), Redallah Idrissi Kaitouni (CRI Fès-Meknès), and Dr. Hind Salih (ABCURR Entrepreneurial Institute, Dubai), the program guided founders through structuring business models, stress-testing real market demand, and pitching directly to business angels.",
      "Preparatory workshops covered investor pricing and valuation, legal foundations for founders, rapid prototyping with AI, and pitch storytelling — preparing teams like Palama Persona to transition rapidly from prototype to execution.",
    ],
    sources: [PRESS_SOURCES[4], PRESS_SOURCES[5], PRESS_SOURCES[3], PRESS_SOURCES[2]],
  },
];

export function getNewsArticle(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((a) => a.slug === slug);
}
