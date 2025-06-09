import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import AdminSidebar from './AdminSidebar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout