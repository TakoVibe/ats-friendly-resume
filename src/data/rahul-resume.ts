import type { ResumeSchema } from '../types/resume';

export const initialResume: ResumeSchema = {
    personalInfo: {
        fullName: "Rahul Beniwal",
        email: "rahulbeniwal26119@gmail.com",
        phone: "+91 6398486322",
        location: "Mathura, India",
        title: "Senior Backend Engineer",
        profiles: [
            { network: "LinkedIn", username: "LinkedIn", url: "https://www.linkedin.com/in/rahulbeniwal26119" },
            { network: "GitHub", username: "Github", url: "https://github.com/Rahulbeniwal26119" },
            { network: "Portfolio", username: "Portfolio", url: "https://rahulbeniwal.takovibe.com" }
        ]
    },
    summary: "Senior Backend Engineer with 3+ years of experience specializing in Python (Django/DRF/FastAPI) and Go. Expert in architecting Scalable Microservices, Distributed Workflows (Celery), and LLM-integrated applications. Proven track record of reducing API latency by 90% and leading mission-critical integrations for 50k+ users. Active Open Source contributor to high-profile projects including fastcore and nvm.",
    skills: [
        {
            id: "skill-1",
            name: "Languages",
            items: ["Python (Django, DRF, FastAPI)", "Go", "JavaScript (ReactJS, Astro)", "SQL", "HTML/CSS"]
        },
        {
            id: "skill-2",
            name: "Backend & Architecture",
            items: ["System Design (HLD/LLD)", "PostgreSQL", "Redis", "Celery", "Docker", "Keycloak", "Pydantic", "Pytest"]
        },
        {
            id: "skill-3",
            name: "Intelligent Systems & Data",
            items: ["RAG Pipelines", "LangChain", "Intelligent Agents", "Vector Databases (ChromaDB)", "Model Orchestration", "Pandas"]
        },
        {
            id: "skill-4",
            name: "DevOps & Tools",
            items: ["Git", "Jenkins (CI/CD)", "AWS", "Nginx", "Linux", "REST/GraphQL APIs", "Project Management"]
        }
    ],
    experience: [
        {
            id: "exp-1",
            company: "LiveEasy (Acquired by Appfolio)",
            role: "Software Developer II",
            duration: "Feb 2023 – Present",
            metrics: [
                "Accomplished a <strong>90% reduction in database queries</strong> (from 900 to 86) and slashed API latency from <strong>3 minutes to 3 seconds</strong> by engineering a custom metaclass-based caching layer and optimizing ORM strategies",
                "Reduced authentication-related support tickets by <strong>30%</strong> for a <strong>50k+ user base</strong> by architecting an <strong>OAuth2.0 compliant microservice</strong> using Keycloak SPIs and integrating legacy SSO/RBAC systems",
                "Achieved <strong>100% project delivery</strong> for high-stakes business requirements by partnering directly with the <strong>C-suite (CEO/CFO)</strong> and Head of Engineering to translate complex needs into scalable backend features",
                "Enabled real-time stakeholder insights for <strong>800+ brokerages</strong> by designing a high-concurrency reporting engine featuring server-side filtering and <strong>70+ dynamic visualizations</strong>",
                "Maintained <strong>99.9% uptime</strong> for data synchronization workflows by orchestrating <strong>10+ mission-critical integrations</strong> with providers like Verizon and MoxiWorks using Celery and Redis"
            ],
            techStack: ["Python", "Django", "PostgreSQL", "Celery", "Redis", "Docker", "Keycloak", "Pandas", "System Design"]
        },
        {
            id: "exp-2",
            company: "LendenClub",
            role: "Software Developer",
            duration: "Jul 2022 – Jan 2023",
            metrics: [
                "Engineered the \"PMI\" gateway interface utilizing state-machine logic and automated retries, successfully reducing payment failure rates from <b>60% to 20%</b>",
                "Delivered 30% of \"IM+\" core banking APIs and a Secure E2E-encrypted Proxy, ensuring <b>100% auditable financial data compliance</b> for high-stakes transactions",
                "Optimized 10+ Celery background jobs to maintain data integrity and real-time performance across investor dashboards and critical loan workflows"
            ],
            techStack: ["Python", "Django", "PostgreSQL", "HTML", "CSS", "Cryptography", "Celery", "Redis"]
        }
    ],
    openSource: [
        {
            id: "os-1",
            name: "fastcore (Answer.AI)",
            description: "Core utility improvements & bug fixes (#596)",
            link: "https://github.com/fastai/fastcore/pull/596"
        },
        {
            id: "os-2",
            name: "nvm-sh/nvm",
            description: "Enabled legacy Node.js support for ARM64 macOS users by implementing architecture-specific compatibility fixes, impacting thousands of developers (#3709, #3718)",
            link: "https://github.com/nvm-sh/nvm"
        },
        {
            id: "os-3",
            name: "CRED Propeller",
            description: "Internal tooling & reliability improvements (#67)",
            link: "https://github.com/CRED-CLUB/propeller"
        }
    ],
    projects: [
        {
            id: "proj-1",
            name: "TakoVibe: Full-Stack Tech-Education Platform",
            description: "",
            link: "https://takovibe.com",
            date: "Jan 2024 - Present",
            techStack: ["Astro", "React", "Django", "OpenAI", "Redis", "Jenkins"],
            metrics: [
                "<b>Engineered</b> a production-grade <b>CMS</b> with a custom in-site editor, interactive quizzes, and real-time code execution blocks",
                "<b>Architected</b> a high-performance <b>Hybrid SSR/Static</b> rendering engine with AI-powered reading assistance and <b>Jenkins CI/CD</b> pipelines"
            ]
        },
        {
            id: "proj-2",
            name: "LAAIT Programming Language",
            description: "",
            link: "https://github.com/rahulbeniwal26119/laait",
            date: "Aug 2023 - Dec 2023",
            techStack: ["Golang"],
            metrics: [
                "<strong>Designed</strong> a lightweight interpreter in <strong>Go</strong> featuring a custom Lexer, recursive-descent Parser, AST logic, and <strong>first-class functions</strong>"
            ]
        }
    ],
    education: [
        {
            id: "edu-1",
            institution: "Sanskriti University",
            degree: "B.Tech, Computer Science",
            duration: "Aug 2018 – Aug 2022",
            location: "Chhata, U.P., India",
            score: "Gold Medalist (8.7 CGPA)"
        }
    ],
    achievements: [
        "Recognized by the Engineering Head & Team Leads at LiveEasy for outstanding technical contributions and team collaboration"
    ],
    certifications: [
        {
            id: "cert-1",
            name: "Advanced Generative App Development",
            issuer: "Coursera"
        }
    ],
    customSections: [],
    config: {
        baseFontSize: 10
    },
    sectionOrder: [
        "summary",
        "skills",
        "experience",
        "openSource",
        "projects",
        "achievements",
        "certifications",
        "education"
    ],
    visibleSections: {
        "summary": true,
        "skills": true,
        "experience": true,
        "openSource": true,
        "projects": true,
        "achievements": true,
        "certifications": true,
        "education": true
    },
    sectionTitles: {
        "summary": "Professional Summary",
        "skills": "Key Skills",
        "experience": "Professional Experience",
        "openSource": "Open Source Contributions",
        "projects": "Key Development Projects",
        "achievements": "Achievements",
        "certifications": "Advanced Generative App Development",
        "education": "Education"
    },
    sectionSeparators: {
        "summary": true,
        "skills": true,
        "experience": true,
        "openSource": true,
        "projects": true,
        "achievements": true,
        "certifications": true,
        "education": true
    }
};
