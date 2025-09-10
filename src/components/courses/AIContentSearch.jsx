import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Wand2, 
  Download, 
  Copy, 
  Trash2, 
  Plus,
  MessageSquare,
  Brain,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  Clock,
  Sparkles,
  ExternalLink,
  Loader2,
  Code,
  FileText
} from 'lucide-react';
import LoadingBuffer from '../LoadingBuffer';
import bytezAPI from '../../services/bytezAPI';
import { useAIFeatureAccess, withAIFeatureAccess } from './AIFeatureAccess';

const AIContentSearch = ({ onFeatureUse, usageInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const { hasAccess, trackUsage } = useAIFeatureAccess();

  const quickPrompts = [
    { text: 'What is React?', category: 'Programming' },
    { text: 'Explain machine learning basics', category: 'AI/ML' },
    { text: 'How to create effective presentations?', category: 'Skills' },
    { text: 'Database design principles', category: 'Database' },
    { text: 'Project management methodologies', category: 'Management' },
    { text: 'Digital marketing strategies', category: 'Marketing' }
  ];

  const performSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Add to search history
    if (!searchHistory.includes(query)) {
      setSearchHistory([query, ...searchHistory.slice(0, 9)]);
    }

    try {
      // Use Bytez API for real content search
      const response = await bytezAPI.answerQuestion(query, '', {
        max_answer_length: 300
      });

      // Extract answer text properly from response object
      let answer;
      if (typeof response.answer === 'string') {
        answer = response.answer;
      } else if (response.answer && typeof response.answer === 'object' && response.answer.answer) {
        answer = response.answer.answer;
      } else if (response.generated_text) {
        answer = response.generated_text;
      } else {
        answer = `Information about ${query}`;
      }
      
      // Create structured results based on AI response
      const results = [
        {
          id: 1,
          title: `Understanding ${query}`,
          type: 'concept',
          content: answer,
          keyPoints: [
            'Core definition and principles',
            'Real-world applications',
            'Best practices and guidelines',
            'Common use cases and examples'
          ],
          difficulty: 'Beginner',
          readTime: '5 min',
          source: 'Bytez AI Knowledge Base'
        }
      ];

      // Generate additional content variations
      if (answer.length > 100) {
        results.push({
          id: 2,
          title: `${query} - Practical Guide`,
          type: 'tutorial',
          content: `Step-by-step guide to implementing and working with ${query}. ${answer.substring(0, 150)}...`,
          keyPoints: [
            'Getting started guide',
            'Implementation examples',
            'Common patterns and solutions',
            'Troubleshooting tips'
          ],
          difficulty: 'Intermediate',
          readTime: '10 min',
          source: 'Bytez AI Knowledge Base'
        });
      }

      setSearchResults(results);

    } catch (error) {
      console.error('Search failed:', error);
      
      // Fallback results
      const fallbackResults = [
        {
          id: Date.now(),
          title: `About ${query}`,
          type: 'concept',
          content: `Here's what I found about "${query}": This topic involves key concepts and principles that are important for understanding the subject matter. Consider exploring related resources and materials to gain deeper insights.`,
          keyPoints: [
            'Basic overview and introduction',
            'Key concepts to understand',
            'Practical applications',
            'Further learning resources'
          ],
          difficulty: 'Beginner',
          readTime: '3 min',
          source: 'Fallback Content',
          error: 'AI search failed, showing fallback'
        }
      ];
      
      setSearchResults(fallbackResults);
    }

    setIsSearching(false);
  };

  const deleteResult = (id) => {
    setSearchResults(searchResults.filter(result => result.id !== id));
  };

  const copyResult = (content) => {
    navigator.clipboard.writeText(content);
  };

  const downloadResult = (content, query) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-result-${query.slice(0, 20).replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertIntoCourse = (result) => {
    // This would integrate with the course content editor
    console.log('Inserting search result into course:', result);
    // Implementation would depend on the course editor structure
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'concept': return BookOpen;
      case 'tutorial': return Code;
      case 'advanced': return Lightbulb;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">AI Content Search</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              placeholder="Ask anything... (e.g., 'What is React?', 'Explain machine learning')"
              className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={() => performSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-orange-600 hover:text-orange-700 disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(prompt.text);
                    performSearch(prompt.text);
                  }}
                  className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 transition-colors"
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(query);
                      performSearch(query);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="bg-white rounded-lg border">
          <LoadingBuffer 
            type="ai" 
            message="Searching for answers..." 
            showSparkles={true}
          />
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !isSearching && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Search Results</h4>
          {searchResults.map((result) => {
            const TypeIcon = getTypeIcon(result.type);
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TypeIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-lg mb-1">{result.title}</h5>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>
                          {result.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {result.readTime}
                        </span>
                        <span>{result.source}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyContent(result.content)}
                      className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                      title="Copy content"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToCourse(result)}
                      className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                      title="Add to course"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{result.content}</p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h6 className="font-medium text-sm mb-2">Key Points:</h6>
                  <ul className="space-y-1">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <button
                    onClick={() => addToCourse(result)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Course
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    View Full Content
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Search for any topic</p>
          <p className="text-sm">Get AI-powered content snippets for your course</p>
        </div>
      )}
    </div>
  );
};

// Export with AI Feature Access protection
export default withAIFeatureAccess(AIContentSearch, 'CONTENT_QA');
