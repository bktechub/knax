import React, { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { trainingsAPI } from '../../services/api'

const CourseModal = ({ course, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    category_id: '',
    level: '',
    instructor: '',
    duration: '',
    fee: '',
    original_fee: '',
    discount_percentage: '',
    is_certified: false,
    what_you_will_learn: [''],
    address: '',
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        details: course.details || '',
        category_id: course.category_id || '',
        level: course.level || '',
        instructor: course.instructor || '',
        duration: course.duration || '',
        fee: course.fee || '',
        original_fee: course.original_fee || '',
        discount_percentage: course.discount_percentage || '',
        is_certified: course.is_certified || false,
        what_you_will_learn: course.what_you_will_learn || [''],
        address: course.address || '',
      })
    }
  }, [course])

  const createMutation = useMutation({
    mutationFn: trainingsAPI.create,
    onSuccess: () => {
      toast.success('Course created successfully')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create course')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => trainingsAPI.update(id, data),
    onSuccess: () => {
      toast.success('Course updated successfully')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update course')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      category_id: parseInt(formData.category_id),
      duration: formData.duration ? parseInt(formData.duration) : null,
      fee: formData.fee ? parseFloat(formData.fee) : null,
      original_fee: formData.original_fee ? parseFloat(formData.original_fee) : null,
      discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
      what_you_will_learn: formData.what_you_will_learn.filter(item => item.trim() !== ''),
    }

    if (course) {
      updateMutation.mutate({ id: course.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLearningPointChange = (index, value) => {
    const newPoints = [...formData.what_you_will_learn]
    newPoints[index] = value
    setFormData(prev => ({ ...prev, what_you_will_learn: newPoints }))
  }

  const addLearningPoint = () => {
    setFormData(prev => ({
      ...prev,
      what_you_will_learn: [...prev.what_you_will_learn, '']
    }))
  }

  const removeLearningPoint = (index) => {
    const newPoints = formData.what_you_will_learn.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, what_you_will_learn: newPoints }))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {course ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address/Location
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_certified"
                      checked={formData.is_certified}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Provides Certificate
                    </label>
                  </div>
                </div>

                {/* Pricing and Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pricing & Content</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="fee"
                      value={formData.fee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="original_fee"
                      value={formData.original_fee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Content
                    </label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Learning Points */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    What You Will Learn
                  </label>
                  <button
                    type="button"
                    onClick={addLearningPoint}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.what_you_will_learn.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleLearningPointChange(index, e.target.value)}
                        placeholder="Learning point..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.what_you_will_learn.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLearningPoint(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CourseModal