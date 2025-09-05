import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import PWAInstaller from '../components/PWAInstaller'

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <PWAInstaller />
      </AuthProvider>
    </LanguageProvider>
  )
}
