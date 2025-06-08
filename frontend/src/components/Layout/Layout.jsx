import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AdminSidebar from './AdminSidebar'

const Layout = ({ children }) => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {children}
      </div>
    )
  }

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-64 p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout