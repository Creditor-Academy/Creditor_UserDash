import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart, PieChart, Settings, Star, TrendingUp } from 'lucide-react';
import { BaseFeature } from '../../FeatureComponents';

const ProTip = ({ children, emoji = "💡" }) => (
  <div className="relative bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 rounded-2xl p-8 border border-amber-300/50 shadow-lg overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-16 translate-x-16"></div>
    
    <div className="relative z-10 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
        <span className="text-xl">{emoji}</span>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-amber-800 font-bold text-lg">Pro Tip</span>
          <div className="px-2 py-1 bg-amber-200/50 rounded-full">
            <span className="text-amber-700 text-sm font-medium">Expert Advice</span>
          </div>
        </div>
        <p className="text-amber-900 leading-relaxed font-medium">{children}</p>
      </div>
    </div>
  </div>
);

const StepCard = ({ icon: Icon, title, items, color, index }) => (
  <div className={`
    relative bg-white rounded-2xl p-8 shadow-xl border-l-4 border-${color}-500 
    hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300
    group overflow-hidden
  `}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-full -translate-y-16 translate-x-16`}></div>
    
    <div className="relative z-10 flex items-center gap-4 mb-6">
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <span className={`text-${color}-600 text-xs font-bold`}>{index + 1}</span>
        </div>
      </div>
      <h4 className={`text-xl font-bold text-${color}-800`}>{title}</h4>
    </div>
    
    <ul className="relative z-10 space-y-4">
      {items.map((item, itemIndex) => (
        <li key={itemIndex} className="flex items-start gap-4 group/item hover:transform hover:translate-x-1 transition-transform duration-200">
          <div className={`w-2 h-2 rounded-full bg-${color}-400 mt-2 flex-shrink-0`}></div>
          <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
        </li>
      ))}
    </ul>
    
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
  </div>
);

const IntroSection = () => (
  <div className="space-y-10">
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-10 rounded-3xl shadow-2xl"
    >
      <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
      
      <div className="relative z-10 flex items-center gap-6 mb-8">
        <motion.div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <BarChart className="w-10 h-10 text-white" />
          </div>
          <motion.div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Course Analytics
          </h3>
          <div className="flex items-center gap-2">
            <motion.div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-blue-100 text-sm font-medium">Instructor Tools</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 text-blue-50 text-lg leading-relaxed max-w-3xl space-y-4">
        <p>
          Gain valuable <span className="text-yellow-300 font-semibold">insights into course performance</span> and student engagement.
          Track progress, analyze trends, and make data-driven decisions to improve learning outcomes.
        </p>
        <p>
          Use the <span className="text-yellow-300 font-semibold">Overview</span> dashboard for high-level metrics like the total number of courses created
          and total user enrollments, along with visual activity breakdowns. Switch to <span className="text-yellow-300 font-semibold">All Courses</span> for
          course-by-course statistics that highlight performance at a granular level.
        </p>
      </div>
    </motion.div>
  </div>
);

const CourseAnalyticsGuide = () => {
  const featureData = {
    id: 'course_analytics',
    icon: BarChart,
    title: 'Course Analytics',
    introduction: <IntroSection />,
    videos: [
      {
        url: 'https://www.youtube.com/embed/example1',
        title: 'Course Analytics Overview',
        description: 'Learn how to use analytics to track course performance and student engagement.'
      }
    ],
    steps: [
      {
        title: 'Accessing Course Analytics',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={Settings}
                title="Navigation Path"
                color="indigo"
                items={[
                  'From the main sidebar, select the Instructor Portal',
                  'Within Instructor Tools, choose Course Analytics',
                  'Confirm you are on the Course Analytics tab to begin exploring data'
                ]}
                index={0}
              />
            </motion.div>
          </div>
        )
      },
      {
        title: 'Overview Dashboard',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={BarChart}
                title="Graphical Insights"
                color="blue"
                items={[
                  'Review total courses created in the LMS',
                  'Track total users enrolled across all courses',
                  'Visualize trends through interactive charts',
                  'Spot key metrics at a glance'
                ]}
                index={0}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={LineChart}
                title="Activity & Engagement"
                color="emerald"
                items={[
                  'Monitor activity distribution across courses',
                  'Identify most active and least active courses',
                  'Stay alerted to engagement spikes or dips',
                  'Use insights to plan interventions'
                ]}
                index={1}
              />
            </motion.div>
          </div>
        )
      },
      {
        title: 'All Courses View',
        renderDescription: () => (
          <div className="space-y-8 ml-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StepCard
                icon={PieChart}
                title="Course-Level Stats"
                color="purple"
                items={[
                  'View detailed statistics per course',
                  'Compare enrollment and activity side-by-side',
                  'Filter or search to focus on specific courses',
                  'Track changes in performance over time'
                ]}
                index={2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StepCard
                icon={TrendingUp}
                title="Actionable Follow-Up"
                color="indigo"
                items={[
                  'Identify courses needing support or updates',
                  'Highlight successes to replicate across the LMS',
                  'Create targeted plans for instructors or cohorts',
                  'Share findings with stakeholders'
                ]}
                index={3}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ProTip emoji="📊">
                <span className="font-bold">Stay Consistent:</span> Schedule regular reviews of both Overview and All Courses data to keep pace with growth and respond quickly to engagement shifts.
              </ProTip>
            </motion.div>
          </div>
        )
      }
    ]
  };

  return <BaseFeature feature={featureData} />;
};

export default CourseAnalyticsGuide;
