import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Upload, Brain } from "lucide-react";
import { useAuth } from "../context/authContext.jsx";

const Welcome = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="space-y-12 px-4 sm:px-8 py-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center px-6 py-12 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black text-white rounded-xl shadow-xl">
        <div className="flex justify-center mb-6">
          <Brain className="h-16 w-16 dark:text-blue-500 text-gray-100" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow">
          Welcome to DoubtNix
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-6 opacity-90">
          Instantly solve your academic doubts using AI — just upload and ask!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-purple-700 hover:bg-gray-100 font-semibold px-6 py-2 text-lg rounded-md transition focus:outline-none"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="bg-purple-900 hover:bg-purple-800 text-white font-semibold px-6 py-2 text-lg rounded-md transition focus:outline-none"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
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

      {/* How It Works */}
      <section className=" p-6 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-black rounded-lg shadow border dark:border-gray-700">

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          How It Works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Upload your academic documents (PDF, DOCX, images)</li>
          <li>AI reads and processes the content</li>
          <li>You can ask any question related to the uploaded content</li>
          <li>Get instant answers powered by advanced AI models</li>
        </ol>
      </section>

      {/* Why Choose Us */}
      <section className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Why Choose DoubtNix?
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Fast, reliable and accurate doubt-solving</li>
          <li>Supports multiple document types and images</li>
          <li>Secure document handling</li>
          <li>Completely free — just sign up and start solving doubts</li>
        </ul>
      </section>

      {/* Stats Section */}
      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center bg-gradient-to-r from-blue-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow border dark:border-gray-700">
        <div>
          <h3 className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-400">
            12K+
          </h3>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Active Students
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Learning with DoubtNix daily
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            80K+
          </h3>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Study Hours
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Logged by learners
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-extrabold text-pink-600 dark:text-pink-400">
            98%
          </h3>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Satisfaction Rate
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on student feedback
          </p>
        </div>
      </section>


      {/* FAQ */}
      <section className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <strong>Q: Is DoubtNix really free?</strong>
            <p>A: Yes! Just sign up and use all features without paying.</p>
          </div>
          <div>
            <strong>Q: What file types can I upload?</strong>
            <p>A: PDF, DOCX, JPG, and PNG are supported.</p>
          </div>
          <div>
            <strong>Q: Can I ask questions in Hindi or regional language?</strong>
            <p>A: Yes, DoubtNix supports multilingual inputs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;