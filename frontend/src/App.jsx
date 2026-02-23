import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

import Landing from './pages/public/landing'
import Login from './pages/public/login'
import Signup from './pages/public/Signup'
import ForgotPassword from './pages/public/forgot-password/forgot-password'
import ResetPassword from './pages/public/reset-password/reset-password'
// TODO: Enable when backend verify-email endpoint is implemented
// import VerifyEmail from './pages/public/verify-email'
import NotFound from './pages/public/error-page'
import AuthCallback from './pages/public/AuthCallback'
import PublicLayout from './Layouts/PublicLayout'
import ProtectedLayout from './Layouts/ProtectedLayout'
import Dashboard from './pages/protected/dashboard'
import Library from './pages/protected/Library'
import PodcastDetail from './pages/protected/PodcastDetail'
import PodcastGenerate from './pages/protected/PodcastGenerate'
import Profile from './pages/protected/Profile'
import YouTubeSummarize from './pages/protected/YouTubeSummarize'
import WebSummarize from './pages/protected/WebSummarize'
import PdfSummarize from './pages/protected/PdfSummarize'
import TextSummarize from './pages/protected/TextSummarize'
import BatchSummarize from './pages/protected/BatchSummarize'
import SummaryView from './pages/protected/SummaryView'
import DeepExplain from './pages/protected/DeepExplain'
import DeepExplainView from './pages/protected/DeepExplainView'
import QuizGenerate from './pages/protected/QuizGenerate'
import QuizAttempt from './pages/protected/QuizAttempt'
import QuizLibrary from './pages/protected/QuizLibrary'
import PublicSummaryView from './pages/public/PublicSummaryView'
import PublicPodcastView from './pages/public/PublicPodcastView'
import NotesGenerate from './pages/protected/NotesGenerate'
import NotesLibrary from './pages/protected/NotesLibrary'
import NotesView from './pages/protected/NotesView'
import VisualizerGenerate from './pages/protected/VisualizerGenerate'
import VisualizerLibrary from './pages/protected/VisualizerLibrary'
import VisualizerView from './pages/protected/VisualizerView'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes - redirect to dashboard if logged in */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* GitHub OAuth callback — no layout chrome needed */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes - redirect to login if not authenticated */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/deep-explain" element={<DeepExplain />} />
          <Route path="/dashboard/deep-explain/:id" element={<DeepExplainView />} />
          <Route path="/dashboard/quiz" element={<QuizLibrary />} />
          <Route path="/dashboard/quiz/generate" element={<QuizGenerate />} />
          <Route path="/dashboard/quiz/:id" element={<QuizAttempt />} />
          <Route path="/dashboard/podcast/generate" element={<PodcastGenerate />} />
          <Route path="/dashboard/podcast/:id" element={<PodcastDetail />} />
          <Route path="/dashboard/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard/youtube-summarize" element={<YouTubeSummarize />} />
          <Route path="/dashboard/web-summarize" element={<WebSummarize />} />
          <Route path="/dashboard/pdf-summarize" element={<PdfSummarize />} />
          <Route path="/dashboard/text-summarize" element={<TextSummarize />} />
          <Route path="/dashboard/batch-summarize" element={<BatchSummarize />} />
          <Route path="/dashboard/summary/:id" element={<SummaryView />} />
          <Route path="/dashboard/notes" element={<NotesLibrary />} />
          <Route path="/dashboard/notes/generate" element={<NotesGenerate />} />
          <Route path="/dashboard/notes/:id" element={<NotesView />} />
          <Route path="/dashboard/visualizer" element={<VisualizerLibrary />} />
          <Route path="/dashboard/visualizer/generate" element={<VisualizerGenerate />} />
          <Route path="/dashboard/visualizer/:id" element={<VisualizerView />} />
        </Route>

        {/* Public Share Routes */}
        <Route path="/share/summary/:id" element={<PublicSummaryView />} />
        <Route path="/share/podcast/:id" element={<PublicPodcastView />} />

        {/* Landing page - accessible to all */}
        <Route path="/" element={<Landing />} />

        {/* 404 - Catch all undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App
