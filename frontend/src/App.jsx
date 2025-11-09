import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import QueryPage from './pages/QueryPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/query" element={<QueryPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
