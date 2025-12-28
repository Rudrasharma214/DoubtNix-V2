import React from 'react'
import { Search } from 'lucide-react'
import ConversationCard from '../components/ConversationCard';

const Conversation = () => {

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-8 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2 drop-shadow">Your Conversations</h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto-none">
          Browse and search through your AI-powered document conversations.
        </p>
      </div>

      {/* Stats Section - Styled like Homedash Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 text-center bg-gradient-to-tr from-purple-500 to-indigo-400 text-white rounded-lg shadow-lg hover:scale-[1.02] transition duration-200">
          <div className="text-4xl font-extrabold drop-shadow mb-1">5</div>
          <div className="text-sm font-medium opacity-90">Total Conversations</div>
        </div>

        <div className="p-6 text-center bg-gradient-to-tr from-green-500 to-emerald-400 text-white rounded-lg shadow-lg hover:scale-[1.02] transition duration-200">
          <div className="text-4xl font-extrabold drop-shadow mb-1">3</div>
          <div className="text-sm font-medium opacity-90">Documents Processed</div>
        </div>

        <div className="p-6 text-center bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-lg shadow-lg hover:scale-[1.02] transition duration-200">
          <div className="text-4xl font-extrabold drop-shadow mb-1">2</div>
          <div className="text-sm font-medium opacity-90">Conversations This Week</div>
        </div>

        <div className="p-6 text-center bg-gradient-to-tr from-yellow-500 to-orange-400 text-white rounded-lg shadow-lg hover:scale-[1.02] transition duration-200">
          <div className="text-4xl font-extrabold drop-shadow mb-1">1</div>
          <div className="text-sm font-medium opacity-90">Active Documents</div>
        </div>
      </section>

      {/* Search Input - Styled like content sections */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations by title or message content..."
            className="flex-1 border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <ConversationCard key={index} />
        ))}
      </div>
    </div>
  );
};


export default Conversation