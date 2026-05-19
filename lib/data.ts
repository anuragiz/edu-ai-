export interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'interactive';
  duration: number; // in minutes
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  tags: string[];
  modules: CourseModule[];
}

export const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "Advanced React Patterns & Next.js",
    description: "Master modern React 19 features, Server Components, and the App Router to build scalable applications. You will learn data fetching, caching, and streaming.",
    instructor: "Sarah Drasner",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    progress: 45,
    tags: ["React", "Next.js", "Frontend"],
    modules: [
      { id: "m1", title: "Introduction to Server Components", type: "video", duration: 15, completed: true },
      { id: "m2", title: "Data Fetching Strategies", type: "reading", duration: 10, completed: true },
      { id: "m3", title: "Server Actions Deep Dive", type: "interactive", duration: 25, completed: false },
      { id: "m4", title: "Knowledge Check", type: "quiz", duration: 10, completed: false }
    ]
  },
  {
    id: "c2",
    title: "Machine Learning Foundations",
    description: "Understand the math and algorithms behind modern AI models including Neural Networks, Gradient Descent, and Backpropagation.",
    instructor: "Andrew Ng",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800&auto=format&fit=crop",
    progress: 10,
    tags: ["AI", "Python", "Math"],
    modules: [
      { id: "m1", title: "Linear Algebra Refresher", type: "reading", duration: 20, completed: true },
      { id: "m2", title: "Gradient Descent Intuition", type: "interactive", duration: 30, completed: false },
      { id: "m3", title: "Building your first Neural Network", type: "video", duration: 45, completed: false }
    ]
  },
  {
    id: "c3",
    title: "System Design Masterclass",
    description: "Learn how to architect large-scale distributed systems that handle millions of users. Covers load balancing, caching, databases, and microservices.",
    instructor: "Alex Xu",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    progress: 0,
    tags: ["Backend", "Architecture"],
    modules: [
      { id: "m1", title: "Networking Basics & Protocols", type: "video", duration: 12, completed: false },
      { id: "m2", title: "Load Balancing Strategies", type: "reading", duration: 15, completed: false },
      { id: "m3", title: "Database Sharding & Replication", type: "reading", duration: 20, completed: false },
      { id: "m4", title: "Design a URL Shortener", type: "interactive", duration: 40, completed: false }
    ]
  }
];
