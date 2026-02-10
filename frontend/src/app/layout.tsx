import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import ClientLayout from './ClientLayout'
import { GoogleWrapper } from '../providers/GoogleWrapper'

export const metadata: Metadata = {
  title: 'EventFlow - Event Management System',
  description: 'Microservices-based Event Management Platform',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <GoogleWrapper>
              <ClientLayout>
                {children}
              </ClientLayout>
            </GoogleWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

