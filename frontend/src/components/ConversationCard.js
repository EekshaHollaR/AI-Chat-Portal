import { format } from 'date-fns';
import { 
  ChatBubbleLeftRightIcon, 
  TrashIcon,
  ClockIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const ConversationCard = ({ conversation, onDelete, onClick }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      onClick={onClick}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {conversation.title}
          </h3>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2 mb-3">
        {conversation.status === 'active' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <ClockIcon className="w-3 h-3 mr-1" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Ended
          </span>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {conversation.message_count || 0} messages
        </span>
      </div>

      {/* Summary */}
      {conversation.summary && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {conversation.summary}
        </p>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {format(new Date(conversation.created_at || conversation.start_timestamp), 'PPp')}
      </div>
    </div>
  );
};

export default ConversationCard;
