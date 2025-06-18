import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EmailGenerator() {
  const [formData, setFormData] = useState({
    emailContent: '',
    tone: 'professional',
    senderName: '',
    recipientName: '',
    includeSignature: true,
    formalGreeting: true,
    desiredLength: 150
  });
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await axios.post('/api/email/generate', formData);
      setGeneratedEmail(response.data);
      setSuccess(true);
      
      // Scroll to the generated email section
      setTimeout(() => {
        const element = document.getElementById('generated-email');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail)
      .then(() => {
        alert('Email copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy email to clipboard');
      });
  };

  const handleNewEmail = () => {
    setFormData({
      emailContent: '',
      tone: 'professional',
      senderName: '',
      recipientName: '',
      includeSignature: true,
      formalGreeting: true,
      desiredLength: 150
    });
    setGeneratedEmail('');
    setSuccess(false);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white rounded-lg shadow-md p-6">
        {!success ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Your Email</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700">
                  Original Email Content
                </label>
                <textarea
                  id="emailContent"
                  name="emailContent"
                  rows={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.emailContent}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                    Tone
                  </label>
                  <select
                    id="tone"
                    name="tone"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData.tone}
                    onChange={handleChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="apologetic">Apologetic</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="desiredLength" className="block text-sm font-medium text-gray-700">
                    Desired Length (words)
                  </label>
                  <input
                    type="number"
                    id="desiredLength"
                    name="desiredLength"
                    min="50"
                    max="500"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.desiredLength}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.senderName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.recipientName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    id="formalGreeting"
                    name="formalGreeting"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.formalGreeting}
                    onChange={handleChange}
                  />
                  <label htmlFor="formalGreeting" className="ml-2 block text-sm text-gray-700">
                    Formal Greeting
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="includeSignature"
                    name="includeSignature"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.includeSignature}
                    onChange={handleChange}
                  />
                  <label htmlFor="includeSignature" className="ml-2 block text-sm text-gray-700">
                    Include Signature
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : 'Generate Email'}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div id="generated-email" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Generated Email</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleNewEmail}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate New Email
                </button>
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Home
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <div className="whitespace-pre-wrap mb-6">{generatedEmail}</div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCopyToClipboard}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy to Clipboard
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print Email
                </button>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Success!</span> Your email has been generated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}