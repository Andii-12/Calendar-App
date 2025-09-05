import { useAuth } from '../contexts/AuthContext';
import AuthWrapper from '../components/AuthWrapper';
import Dashboard from '../components/Dashboard';
import Head from 'next/head';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Calendar & Tasks App</title>
        <meta name="description" content="A modern calendar and task management application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {user ? <Dashboard /> : <AuthWrapper />}
    </>
  );
}
