// Portfolio Data - All content extracted from the original portfolio
export const siteConfig = {
  fullName: 'Satya Ganesh',
  firstName: 'Satya',
  role: 'Performance Test Engineer',
  email: 'rsganesh2088@gmail.com',
  github: 'https://github.com/satyaganesh',
  linkedin: 'https://www.linkedin.com/in/rs-ganesh-bb349b246',
  location: 'Hyderabad, India',
  phone: '+91 90438 44723',
  summary: 'Engineering performance. Revealing bottlenecks. Building resilience.',
  nativeGreeting: 'నమస్తే', // Telugu greeting in Devanagari
  graduationYear: 2014,
  degree: 'B.Com',
  college: 'Dravidian University',
};

export const projects = [
  {
    id: 1,
    title: 'Simpplr Performance Engineering',
    shortTitle: 'Simpplr',
    category: 'AI Performance',
    description: 'Centralized K6 performance testing framework with reusable TypeScript modules, automated reporting, and CI/CD integration for AI-powered applications.',
    tech: ['K6', 'TypeScript', 'InfluxDB', 'Grafana', 'GitHub Actions', 'Jenkins'],
    repoLink: 'https://github.com/satyaganesh',
    featured: true,
  },
  {
    id: 2,
    title: 'United Airlines — Cloud Migration Performance',
    shortTitle: 'United Airlines',
    category: 'Cloud Migration',
    description: 'Performance testing of on-premises to AWS migration. Comparative testing across environments to support migration readiness decisions.',
    tech: ['LoadRunner', 'ALM', 'Datadog', 'Dynatrace', 'AWS'],
    repoLink: 'https://github.com/satyaganesh',
    featured: true,
  },
  {
    id: 3,
    title: 'Mitchell 1 — Automotive Performance',
    shortTitle: 'Mitchell 1',
    category: 'Performance Testing',
    description: 'Comprehensive performance testing for automotive repair software platform. Load, stress, and endurance scenarios.',
    tech: ['LoadRunner', 'Performance Center', 'Dynatrace', 'Splunk', 'Oracle AWR'],
    repoLink: 'https://github.com/satyaganesh',
    featured: false,
  },
  {
    id: 4,
    title: 'RSuite — CCMS Performance',
    shortTitle: 'RSuite',
    category: 'Performance Testing',
    description: 'Performance testing for Component Content Management System (CCMS) platform. Web and web services testing.',
    tech: ['LoadRunner', 'AppDynamics', 'ALM'],
    repoLink: 'https://github.com/satyaganesh',
    featured: false,
  },
  {
    id: 5,
    title: 'AI & LLM Performance Testing',
    shortTitle: 'AI / LLM',
    category: 'AI Performance',
    description: 'Performance testing and experimentation for AI/LLM-powered applications. Concurrency, burst traffic, latency, and resource utilization analysis.',
    tech: ['K6', 'JMeter', 'Langfuse', 'Kubernetes', 'Grafana', 'Coralogix'],
    repoLink: 'https://github.com/satyaganesh',
    featured: true,
  },
];

export const skills = {
  Languages: ['TypeScript', 'JavaScript', 'Python', 'Groovy', 'Shell Scripting'],
  Frontend: ['React', 'HTML5', 'CSS3', 'Responsive Design'],
  Backend: ['Node.js', 'REST APIs', 'WebSocket', 'Microservices'],
  Databases: ['InfluxDB', 'Oracle', 'PostgreSQL', 'Redis'],
  Tools: ['K6', 'LoadRunner', 'JMeter', 'Gatling', 'Locust', 'Artillery', 'Performance Center', 'Grafana', 'InfluxDB', 'Datadog', 'AppDynamics', 'Dynatrace', 'CloudWatch', 'Coralogix', 'GroundCover', 'Langfuse', 'Prometheus', 'Splunk', 'Jenkins', 'GitHub Actions', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Linux', 'Fiddler', 'Postman', 'ALM'],
  Core: ['Performance Analysis', 'Workload Modelling', 'Bottleneck Analysis', 'Capacity Planning', 'Baseline Analysis', 'Stress Testing', 'Endurance Testing', 'Scalability Testing', 'Regression Testing', 'AI Application Performance', 'Concurrency Testing', 'Burst Testing', 'Mock-Based Testing', 'AI Agent Performance', 'LLM Testing'],
};

export const codingPlatforms = {
  leetcode: 0,
  codechef: 0,
  geeksforgeeks: 0,
  hackerrankStars: 0,
  cgpa: 'N/A',
  hackathonRank: 'N/A',
  totalProblems: '0',
};

export const education = [
  {
    degree: 'B.Com',
    college: 'Dravidian University',
    year: 2014,
    cgpa: 'N/A',
  },
];

export const experience = [
  {
    role: 'Test Engineer',
    company: 'Simpplr',
    period: '2023 — Present',
    location: 'Remote',
    description: 'Spearheading AI performance testing initiatives for LLM-powered applications. Managing Kubernetes architecture for pod auto-scaling and response time optimization. Building comprehensive observability stacks for AI/ML workloads.',
    technologies: ['JMeter', 'K6', 'Kubernetes', 'Langfuse', 'Jenkins', 'AWS', 'GitHub', 'Coralogix', 'GroundCover', 'Grafana', 'CloudWatch', 'Jira'],
    achievements: [
      'Established new K6 performance testing framework for AI applications, reducing test creation time by 60%',
      'Identified and resolved critical bottlenecks including connection pinning issues and RDS Proxy misconfigurations',
      'Discovered and fixed memory leak in LLM orchestrator application, improving stability by 40%',
      'Designed and implemented auto-scaling policies for Kubernetes pods handling variable AI inference loads',
      'Built end-to-end observability pipeline using Coralogix, GroundCover, and Grafana for real-time performance insights',
    ],
  },
  {
    role: 'SQA Analyst',
    company: 'RSI Content Solutions India Pvt Ltd',
    period: 'Aug 2022 — Jun 2023',
    location: 'Chennai, India',
    description: 'Led performance testing and engineering initiatives for on-premise infrastructure. Conducted deep bottleneck analysis across application and database layers, establishing performance baselines and optimization strategies.',
    technologies: ['JMeter', 'Grafana', 'JUnit', 'PerfMon', 'AppDynamics', 'Linux'],
    achievements: [
      'Built performance testing practice from scratch, defining processes, templates, and standards',
      'Independently managed end-to-end performance engineering lifecycle for multiple applications',
      'Identified and resolved critical infrastructure bottlenecks on-premise, improving throughput by 35%',
      'Established continuous performance monitoring with Grafana and PerfMon for production visibility',
      'Designed and executed complex workload models simulating peak production traffic patterns',
    ],
  },
  {
    role: 'Senior Quality Assurance Engineer',
    company: 'Genisys Group',
    period: '2021 — 2022',
    location: 'Remote',
    description: 'Maintained and extended enterprise performance testing framework using LoadRunner. Developed complex test scripts for business-critical applications and collaborated with stakeholders on AWS migration performance validation.',
    technologies: ['LoadRunner', 'Fiddler', 'DataDog', 'AppDynamics', 'Postman', 'AWS'],
    achievements: [
      'Created and maintained performance scripts for complex business scenarios with 95%+ accuracy',
      'Received client commendation for well-structured, maintainable test scripts and comprehensive reporting',
      'Delivered on-time performance test reports with detailed root cause analysis and optimization recommendations',
      'Validated application performance during AWS migration, ensuring zero regression in response times',
      'Integrated AppDynamics and DataDog for real-time performance monitoring during test execution',
    ],
  },
];

export const certifications = [
  { name: 'Prompt Engineering', issuer: 'LinkedIn Learning' },
  { name: 'Performance Testing Fundamentals', issuer: 'Coursera' },
  { name: 'K6 Performance Testing', issuer: 'Grafana Labs' },
  { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services' },
];

export const journeyMilestones = [
  { year: '2023', title: 'Test Engineer at Simpplr', place: 'Remote', meta: 'AI Performance & Observability' },
  { year: '2022', title: 'SQA Analyst at RSI Content Solutions', place: 'Chennai, India', meta: 'On-premise Performance Engineering' },
  { year: '2021', title: 'Senior QA Engineer at Genisys Group', place: 'Remote', meta: 'LoadRunner & AWS Migration' },
];

export const aboutChapters = [
  { num: '01', label: 'Hello', heading: "Hi, I'm", subheading: 'Satya' },
  { num: '02', label: 'Builder', heading: 'I build', subheading: 'the whole stack' },
  { num: '03', label: 'Student', heading: 'I study', subheading: 'Performance Engineering' },
  { num: '04', label: 'Solver', heading: 'I solve', subheading: 'problems daily' },
];

export const numbersText = `I've solved [0] problems on LeetCode, [0] on CodeChef and [0] on GeeksforGeeks. I earned [0] HackerRank stars, hold a [N/A] CGPA, topped my department and made the [N/A] at [hackathon]`;

export const marqueeItems = [
  'Performance Test Engineer',
  'K6 • LoadRunner • JMeter • TypeScript',
  'Open to opportunities',
  'Performance Engineering',
  'Builder of things',
];

export const workVisuals = [
  { type: 'scan', title: 'Security Scan Visual' },
  { type: 'heatmap', title: 'Performance Heatmap' },
  { type: 'orbit', title: 'Tech Stack Orbit' },
];

// FRAMES data - populated by build_frames.py
export const FRAMES = {
  SEQ: { run: 0, wave: 0, rot: 0, rotc: 0 },
  RUN: { stand: 0, startFrom: 0, startTo: 0, loopFrom: 0, loopLen: 0, loopEntry: 0, scale: 1 },
  ROT: { front: 0, end: 0, left: 0, right: 0 },
  BG: [255, 255, 255],
};