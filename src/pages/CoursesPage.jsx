import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SkillCard from '../components/SkillCard';
import { socket } from '../services/socket';

const defaultSkills = [
  {
    _id: 'sk-cybersecurity',
    skillName: 'Cyber Security',
    description: 'Ethical hacking, penetration testing, and enterprise security frameworks.',
    icon: 'lock',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    topics: ['Network Security & Firewalls', 'Ethical Hacking & Pen Testing', 'OWASP Top 10', 'Security Auditing', 'Cryptography Fundamentals']
  },
  {
    _id: 'sk-cloud',
    skillName: 'Cloud Computing',
    description: 'AWS, Azure, GCP architecture and DevOps workflows.',
    icon: 'globe',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    topics: ['AWS / Azure / GCP Fundamentals', 'Cloud Architecture & Deployment', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Serverless Computing']
  },
  {
    _id: 'sk-networking',
    skillName: 'Networking',
    description: 'TCP/IP, routing, switching, and infrastructure design.',
    icon: 'network',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    topics: ['TCP/IP & OSI Model', 'Routing & Switching', 'Network Administration', 'Wireless Networks', 'VPN & Network Security']
  },
  {
    _id: 'sk-webdev',
    skillName: 'Web Development',
    description: 'Full stack with HTML, CSS, JavaScript, React, and Node.js.',
    icon: 'code',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    topics: ['HTML5 & Semantic Markup', 'CSS3 & Responsive Design', 'JavaScript ES6+', 'React & Next.js', 'Node.js & Express.js', 'REST API Design']
  },
  {
    _id: 'sk-python',
    skillName: 'Python Programming',
    description: 'Core Python, automation, data analysis, and Django.',
    icon: 'cpu',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    topics: ['Core Python & OOP', 'Data Structures & Algorithms', 'NumPy, Pandas & Matplotlib', 'Django & Flask Frameworks', 'Automation & Scripting']
  },
  {
    _id: 'sk-java',
    skillName: 'Java Programming',
    description: 'Core Java programming, object-oriented concepts, exception handling, and collections.',
    icon: 'cpu',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    topics: ['Java Language Basics & Syntax', 'Object-Oriented Programming (OOP)', 'Exception Handling & Packages', 'Java Collections Framework', 'Multithreading & Concurrency']
  },
  {
    _id: 'sk-datasci',
    skillName: 'Data Science',
    description: 'Analytics, ML models, and business intelligence.',
    icon: 'database',
    image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80',
    topics: ['Exploratory Data Analysis', 'Machine Learning Algorithms', 'Deep Learning Foundations', 'Data Visualization (Tableau/PowerBI)', 'Statistical Modeling']
  }
];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    socket.on('courses_changed', fetchCourses);

    return () => {
      socket.off('courses_changed', fetchCourses);
    };
  }, []);

  const displaySkills = courses.length > 0 ? courses : defaultSkills;

  return (
    <div className="pt-20 bg-surface-50 min-h-screen">
      <section className="section py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs text-brand-700 font-bold mb-4">
            Detailed Syllabi & Curriculum
          </div>
          <h1 className="section-title text-4xl md:text-5xl font-extrabold tracking-tight">
            Courses Handled & <span className="text-brand-600">Syllabi</span>
          </h1>
          <p className="section-subtitle mx-auto">
            Deep dive into the comprehensive curriculum, modules, and topics covered under each professional program.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            style={{ perspective: '1200px' }}
          >
            {displaySkills.map((skill) => (
              <SkillCard
                key={skill._id}
                skillName={skill.skillName}
                description={skill.description}
                topics={skill.topics || []}
                icon={skill.icon}
                image={skill.image}
                showTopics={true}
              />
            ))}
          </div>
        )}

        {/* CTA back button */}
        <div className="text-center mt-16 animate-slide-up">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
