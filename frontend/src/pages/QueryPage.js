import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryService } from '../api/queryService';
import { MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const QueryPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    topK: 5,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await queryService.queryConversations(query, filters);
      setResults(response.conversations || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Query Past Conversations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions about your previous conversations using AI-powered semantic search
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="card">
            {/* Query Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What would you like to know?
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What did we discuss about machine learning?"
                className="input-primary resize-none"
                rows={3}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="input-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="input-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Results
                </label>
                <select
                  value={filters.topK}
                  onChange={(e) => setFilters({ ...filters, topK: parseInt(e.target.value) })}
                  className="input-primary"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2 inline" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Found {results.length} relevant conversation{results.length !== 1 ? 's' : ''}
            </h2>
            
            {results.map((result) => (
              <ResultCard
                key={result.conversation_id}
                result={result}
                onClick={() => navigate(`/chat/${result.conversation_id}`)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && query && (
          <div className="card text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No conversations found matching your query
            </p>
          </div>
        )}

        {/* Example Queries */}
        {!query && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Example Queries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'What topics did we discuss last week?',
                'Show me conversations about Python programming',
                'What decisions were made in recent meetings?',
                'Find discussions about project deadlines',
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="card text-left hover:shadow-md transition-shadow p-4"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {example}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultCard = ({ result, onClick }) => {
  const relevancePercent = (result.score * 100).toFixed(0);
  
  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {result.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          result.score > 0.7 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : result.score > 0.5
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {relevancePercent}% match
        </span>
      </div>

      {/* Summary */}
      {result.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {result.summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {result.message_count} messages
        </span>
        <span>
          {format(new Date(result.created_at), 'PPp')}
        </span>
      </div>
    </div>
  );
};

export default QueryPage;
