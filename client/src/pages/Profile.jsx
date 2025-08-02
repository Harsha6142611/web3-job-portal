import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { User, Mail, Linkedin, Wallet, Edit, Save, Check } from 'lucide-react'
import SmartResume from '../components/SmartResume'

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      linkedinUrl: user?.linkedinUrl || ''
    }
  })



  const onSubmit = async (data) => {
    // Clean up empty strings to avoid validation errors
    const cleanData = {
      ...data,
      bio: data.bio?.trim() || '',
      linkedinUrl: data.linkedinUrl?.trim() || ''
    }
    
    const result = await updateProfile(cleanData)
    
    if (result.success) {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } else {
      // Show more user-friendly error messages
      const errorMessage = result.error?.includes('is not allowed to be empty') 
        ? 'Please fill in all required fields or leave them empty to clear them.'
        : result.error || 'Failed to update profile'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              
              {user?.walletAddress && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-green-500" />
                    <Check size={16} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 font-mono">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </span>
                    <p className="text-xs text-green-600">Wallet Connected</p>
                  </div>
                </div>
              )}

              {user?.linkedinUrl && (
                <div className="flex items-center gap-3">
                  <Linkedin size={20} className="text-gray-400" />
                  <a 
                    href={user.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline flex items-center gap-2"
              >
                {isEditing ? <Save size={16} /> : <Edit size={16} />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      disabled={!isEditing}
                      className="input pl-10 disabled:bg-gray-50"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      disabled={!isEditing}
                      className="input pl-10 disabled:bg-gray-50"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  {...register('bio')}
                  disabled={!isEditing}
                  rows={4}
                  className="input disabled:bg-gray-50"
                  placeholder="Tell us about yourself, your skills, experience, or what you're looking for..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to clear your bio
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    {...register('linkedinUrl')}
                    disabled={!isEditing}
                    className="input pl-10 disabled:bg-gray-50"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to remove your LinkedIn URL
                </p>
              </div>



              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Smart Resume Section */}
      <div className="mt-8">
        <SmartResume />
      </div>
    </div>
  )
}

export default Profile 