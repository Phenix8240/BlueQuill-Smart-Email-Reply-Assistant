import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/">
                  <span className="text-xl font-bold text-indigo-600">EmailWriter</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Home
              </Link>
              <Link
                to="/generate"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Generate Email
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}