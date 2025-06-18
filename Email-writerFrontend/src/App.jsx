import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EmailGenerator from './pages/EmailGenerator';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generate" element={<EmailGenerator />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;