import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Professional Email Generator</h1>
        <p className="text-gray-600 mb-6">
          Create polished, professional email responses in seconds with our AI-powered tool.
        </p>
        <Link
          to="/generate"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Generate Email Now
        </Link>
      </div>
    </div>
  );
}