import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import { trainingsAPI, enrollmentsAPI, authAPI } from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const AdminReports = () => {
  const [dateRange, setDateRange] = useState('30')

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => trainingsAPI.getAll().then(res => res.data),
  })

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => enrollmentsAPI.getAll().then(res => res.data),
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => authAPI.getAllUsers().then(res => res.data.users),
  })

  if (coursesLoading || enrollmentsLoading || usersLoading) {
    return <LoadingSpinner />
  }

  // Calculate metrics
  const totalRevenue = enrollments.reduce((sum, enrollment) => {
    const fee = enrollment.training_schedule?.training?.fee || 0
    return sum + parseFloat(fee)
  }, 0)

  const activeEnrollments = enrollments.filter(e => e.status === 'active').length
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
  const conversionRate = enrollments.length > 0 ? (completedEnrollments / enrollments.length * 100).toFixed(1) : 0

  const metrics = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      change: '+12.5%',
      changeType: 'increase',
    },
    {
      title: 'Active Enrollments',
      value: activeEnrollments,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      change: '+8.2%',
      changeType: 'increase',
    },
    {
      title: 'Course Completion Rate',
      value: `${conversionRate}%`,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      change: '+5.1%',
      changeType: 'increase',
    },
    {
      title: 'Total Courses',
      value: courses.length,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      change: '+3.0%',
      changeType: 'increase',
    },
  ]

  const topCourses = courses
    .map(course => ({
      ...course,
      enrollmentCount: enrollments.filter(e => e.training_schedule?.training?.id === course.id).length
    }))
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5)

  const recentEnrollments = enrollments
    .sort((a, b) => new Date(b.enrollment_date) - new Date(a.enrollment_date))
    .slice(0, 10)

  const handleExportReport = () => {
    // Simulate report export
    const reportData = {
      metrics,
      topCourses,
      recentEnrollments,
      generatedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training-platform-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track performance and analyze platform metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleExportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-600">{metric.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Top Performing Courses</h2>
          </div>
          
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.category?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {course.enrollmentCount} enrollments
                  </p>
                  <p className="text-xs text-gray-500">
                    ${course.fee || 0} per student
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Enrollments</h2>
          </div>
          
          <div className="space-y-4">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.fullname}</p>
                    <p className="text-sm text-gray-600">
                      {enrollment.training_schedule?.training?.title || 'Course'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Enrollment Trends Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Enrollment Trends</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Chart visualization would go here</p>
            <p className="text-sm text-gray-500">Integration with charting library needed</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminReports