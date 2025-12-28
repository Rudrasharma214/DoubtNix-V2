import { FileText, Upload, MessageSquare, Brain } from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-8 py-10 max-w-7xl mx-auto">
      {/* Hero Section - Styled like Homedash Hero */}
      <section className="text-center px-6 py-12 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white rounded-xl shadow-xl">
        <div className="flex justify-center mb-6">
          <Brain className="h-16 w-16 text-white drop-shadow-lg" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow">
          DoubtNix - AI Doubt Solver
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90">
          Upload your documents (PDF, DOC, or images) and get instant AI-powered answers
          to your questions. Powered by Google's Gemini AI.
        </p>
      </section>

      {/* Features - Styled like Homedash Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            Icon: Upload,
            title: "Easy Upload",
            desc: "Drag and drop or click to upload PDF, DOCX, or image files",
            color: "from-pink-500 to-red-400",
          },
          {
            Icon: FileText,
            title: "Smart Processing",
            desc: "Advanced text extraction from documents and OCR for images",
            color: "from-indigo-500 to-blue-400",
          },
          {
            Icon: MessageSquare,
            title: "AI Conversations",
            desc: "Ask questions and get detailed answers about your document content",
            color: "from-emerald-500 to-teal-400",
          },
        ].map(({ Icon, title, desc, color }, i) => (
          <div
            key={i}
            className={`p-6 text-center bg-gradient-to-tr ${color} text-white rounded-lg shadow-lg hover:scale-[1.02] transition duration-200`}
          >
            <Icon className="h-10 w-10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm opacity-90">{desc}</p>
          </div>
        ))}
      </section>

      {/* File Upload Section */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Upload a Document
        </h2>
        {/* FileUpload component will go here */}
      </div>

      {/* Recent Documents Section */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Documents
          </h2>
        </div>

        {/* DocumentList component will go here */}
      </div>
    </div>
  )
}

export default Dashboard;