import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const Footer = () => {
  const { t } = useTranslation()

  const footerLinks = {
    company: [
      { name: t('footer.aboutUs'), href: '/about' },
      { name: t('footer.careers'), href: '/careers' },
      { name: t('footer.contact'), href: '/contact' },
    ],
    support: [
      { name: t('footer.helpCenter'), href: '/help' },
      { name: t('footer.faq'), href: '/faq' },
      { name: t('footer.documentation'), href: '/docs' },
    ],
    legal: [
      { name: t('footer.privacy'), href: '/privacy' },
      { name: t('footer.terms'), href: '/terms' },
      { name: t('footer.cookies'), href: '/cookies' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Instagram', href: '#', icon: '📷' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">TrainingPlatform</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering professionals worldwide with cutting-edge training and development programs.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPinIcon className="w-4 h-4" />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <PhoneIcon className="w-4 h-4" />
                <span>+250 788 444 939</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <EnvelopeIcon className="w-4 h-4" />
                <span>info@traininginrwanda.com</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.newsletter')}</h3>
            <p className="text-gray-300 text-sm mb-4">
              {t('footer.newsletterText')}
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder={t('common.email')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2024 TrainingPlatform. {t('footer.allRightsReserved')}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <span className="text-sm text-gray-400">{t('footer.followUs')}:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer