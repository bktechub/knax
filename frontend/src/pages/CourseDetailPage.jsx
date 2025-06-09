import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckIcon,
  PlayIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'
import { trainingsAPI, schedulesAPI, enrollmentsAPI, reviewsAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import EnrollmentModal from '../components/courses/EnrollmentModal'

const CourseDetailPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => trainingsAPI.getById(id).then(res => res.data),
  })

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules', id],
    queryFn: () => schedulesAPI.getByTraining(id).then(res => res.data),
    enabled: !!id,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsAPI.getByTraining(id).then(res => res.data),
    enabled: !!id,
  })

  const { data: rating } = useQuery({
    queryKey: ['rating', id],
    queryFn: () => reviewsAPI.getTrainingRating(id).then(res => res.data),
    enabled: !!id,
  })

  const enrollMutation = useMutation({
    mutationFn: enrollmentsAPI.create,
    onSuccess: () => {
      toast.success('Enrollment successful! Check your email for confirmation.')
      setShowEnrollmentModal(false)
      queryClient.invalidateQueries(['course', id])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Enrollment failed')
    },
  })

  const handleEnrollment = (enrollmentData) => {
    if (schedules.length > 0) {
      enrollMutation.mutate({
        ...enrollmentData,
        training_schedule_id: schedules[0].id,
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            Back to courses
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: t('courseDetail.overview') },
    { id: 'curriculum', name: t('courseDetail.curriculum') },
    { id: 'instructor', name: t('courseDetail.instructor') },
    { id: 'reviews', name: t('courseDetail.reviews') },
    { id: 'schedule', name: t('courseDetail.schedule') },
  ]

  const courseFeatures = [
    { icon: DocumentTextIcon, text: t('courseDetail.certificate') },
    { icon: ClockIcon, text: t('courseDetail.lifetime') },
    { icon: LifebuoyIcon, text: t('courseDetail.support') },
    { icon: DevicePhoneMobileIcon, text: t('courseDetail.mobile') },
    { icon: GlobeAltIcon, text: 'English Language' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {course.category?.name}
                  </span>
                  {course.level && (
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  {course.title}
                </h1>
                
                <p className="text-xl text-blue-100 mb-6">
                  {course.description}
                </p>
                
                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                    <span>{rating?.averageRating || 4.8}</span>
                    <span>({rating?.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>1,250 students</span>
                  </div>
                  {course.duration && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-5 h-5" />
                      <span>{course.duration} weeks</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Course Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-xl shadow-2xl p-6 text-gray-900"
              >
                <img
                  src={`https://images.pexels.com/photos/${1000000 + course.id}/pexels-photo-${1000000 + course.id}.jpeg?auto=compress&cs=tinysrgb&w=400`}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                  onError={(e) => {
                    e.target.src = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400'
                  }}
                />
                
                {course.fee && (
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600">${course.fee}</div>
                    {course.original_fee && course.original_fee !== course.fee && (
                      <div className="text-lg text-gray-500 line-through">${course.original_fee}</div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => isAuthenticated ? setShowEnrollmentModal(true) : toast.error('Please login to enroll')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
                >
                  {t('courseDetail.enroll')}
                </button>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">{t('courseDetail.courseIncludes')}</h4>
                  {courseFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">{t('courseDetail.whatYouWillLearn')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.what_you_will_learn?.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {course.details && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Course Details</h3>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 leading-relaxed">{course.details}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('courseDetail.curriculum')}</h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((week) => (
                        <div key={week} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Week {week}: Introduction to Concepts</h4>
                            <PlayIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-gray-600 text-sm mt-2">
                            Learn the fundamental concepts and get hands-on experience.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('courseDetail.instructor')}</h3>
                    <div className="flex items-start space-x-4">
                      <img
                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                        alt={course.instructor}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-lg">{course.instructor}</h4>
                        <p className="text-blue-600 mb-2">Senior Software Engineer</p>
                        <p className="text-gray-700">
                          Experienced professional with over 10 years in the industry. 
                          Passionate about teaching and helping students achieve their goals.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('courseDetail.reviews')}</h3>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(review.stars)].map((_, i) => (
                              <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-2">{review.description}</p>
                          <div className="text-sm text-gray-500">
                            {review.user_email} • {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t('courseDetail.schedule')}</h3>
                    <div className="space-y-4">
                      {schedules.map((schedule) => (
                        <div key={schedule.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Batch {schedule.id}</h4>
                              <p className="text-gray-600">
                                {new Date(schedule.start_date).toLocaleDateString()} - {new Date(schedule.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Capacity</div>
                              <div className="font-medium">{schedule.capacity || 30} students</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <img
                        src={`https://images.pexels.com/photos/${270000 + i}/pexels-photo-${270000 + i}.jpeg?auto=compress&cs=tinysrgb&w=100`}
                        alt="Related course"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-sm">Advanced Web Development</h4>
                        <p className="text-gray-600 text-xs">$299</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">4.8</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <EnrollmentModal
          course={course}
          onClose={() => setShowEnrollmentModal(false)}
          onEnroll={handleEnrollment}
          isLoading={enrollMutation.isPending}
        />
      )}
    </div>
  )
}

export default CourseDetailPage