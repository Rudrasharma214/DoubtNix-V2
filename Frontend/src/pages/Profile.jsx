import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/Auth/useAuth.js';
import { useChangePassword } from '../hooks/Auth/useMutation.js';

const Profile = () => {
  const { user } = useAuth();
  const { mutateAsync: changePassword, isPending } = useChangePassword();

  /* Password form state */
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /* Derived user data (no useEffect) */
  const fullName = user?.name?.trim() || '';
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');
  const email = user?.email || '';

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password changed successfully!');
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to change password';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Profile Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {firstName} {lastName}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <p className="text-gray-900 dark:text-white">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <PasswordInput
                label="Current Password"
                value={passwordForm.currentPassword}
                show={showPasswords.current}
                onToggle={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, currentPassword: value })
                }
              />

              {/* New Password */}
              <PasswordInput
                label="New Password"
                value={passwordForm.newPassword}
                show={showPasswords.new}
                onToggle={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, newPassword: value })
                }
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                show={showPasswords.confirm}
                onToggle={() =>
                  setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                }
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: value })
                }
              />

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isPending ? 'Changing...' : 'Change Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Reusable Password Input */
const PasswordInput = ({ label, value, show, onToggle, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        {show ? (
          <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </button>
    </div>
  </div>
);

export default Profile;