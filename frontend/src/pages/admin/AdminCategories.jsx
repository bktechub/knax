import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline'
import { categoriesAPI } from '../../services/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import CategoryModal from '../../components/admin/CategoryModal'

const AdminCategories = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesAPI.getAll().then(res => res.data),
  })

  const deleteMutation = useMutation({
    mutationFn: categoriesAPI.delete,
    onSuccess: () => {
      toast.success('Category deleted successfully')
      queryClient.invalidateQueries(['admin-categories'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    },
  })

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(categoryId)
    }
  }

  const handleAddNew = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600">Organize your courses with categories</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {category.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4">
              {category.description || 'No description provided'}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>ID: {category.id}</span>
              <span>0 courses</span>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Category
          </button>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            queryClient.invalidateQueries(['admin-categories'])
          }}
        />
      )}
    </div>
  )
}

export default AdminCategories