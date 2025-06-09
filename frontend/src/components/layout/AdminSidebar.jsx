import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const AdminSidebar = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const sidebarItems = [
    {
      name: t('nav.dashboard'),
      href: '/admin',
      icon: HomeIcon,
      current: location.pathname === '/admin',
    },
    {
      name: t('nav.courses'),
      href: '/admin/courses',
      icon: AcademicCapIcon,
      current: location.pathname === '/admin/courses',
    },
    {
      name: t('nav.categories'),
      href: '/admin/categories',
      icon: FolderIcon,
      current: location.pathname === '/admin/categories',
    },
    {
      name: 'Enrollments',
      href: '/admin/enrollments',
      icon: ClipboardDocumentListIcon,
      current: location.pathname === '/admin/enrollments',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      current: location.pathname === '/admin/users',
    },
    {
      name: t('nav.reports'),
      href: '/admin/reports',
      icon: ChartBarIcon,
      current: location.pathname === '/admin/reports',
    },
    {
      name: t('nav.settings'),
      href: '/admin/settings',
      icon: CogIcon,
      current: location.pathname === '/admin/settings',
    },
  ]

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-30">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('nav.admin')}
        </h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar