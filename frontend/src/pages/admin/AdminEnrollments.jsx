import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { enrollmentsAPI } from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const AdminEnrollments = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: () => enrollmentsAPI.getAll().then(res => res.data),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => enrollmentsAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Enrollment status updated successfully')
      queryClient.invalidateQueries(['admin-enrollments'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status')
    },
  })

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || enrollment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = (enrollmentId, newStatus) => {
    updateStatusMutation.mutate({ id: enrollmentId, status: newStatus })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    }
    
    const config = statusConfig[status] || statusConfig.pending
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
          <p className="text-gray-600">Manage student enrollments and track progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment, index) => (
                <motion.tr
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.fullname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.training_schedule?.training?.title || 'Course Title'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Schedule ID: {enrollment.training_schedule_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(enrollment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(enrollment.id, 'active')}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Approve"
                        disabled={enrollment.status === 'active'}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(enrollment.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Cancel"
                        disabled={enrollment.status === 'cancelled'}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No enrollments found matching your criteria.</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrollments', value: enrollments.length, color: 'blue' },
          { label: 'Active', value: enrollments.filter(e => e.status === 'active').length, color: 'green' },
          { label: 'Pending', value: enrollments.filter(e => e.status === 'pending').length, color: 'yellow' },
          { label: 'Completed', value: enrollments.filter(e => e.status === 'completed').length, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AdminEnrollments