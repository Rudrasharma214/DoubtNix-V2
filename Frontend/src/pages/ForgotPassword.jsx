import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForgotPassword, useResetPassword } from '../hooks/Auth/useMutation.js';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=password
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const { mutateAsync: sendOtp, isPending: sendingOtp } = useForgotPassword();
  const { mutateAsync: resetPassword, isPending: resettingPassword } =
    useResetPassword();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* Step 1: Send OTP */
  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    try {
      const res = await sendOtp(formData.email);
      setUserId(res?.data?.userId);
      setStep(2);
      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    }
  };

  /* Step 2: Verify OTP (UI step only) */
  const handleVerifyOtp = () => {
    if (!formData.otp || formData.otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setStep(3);
  };

  /* Step 3: Reset Password */
  const handleResetPassword = async () => {
    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword({
        userId,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      toast.success('Password reset successfully');
      setStep(1);
      setFormData({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
      });
      Navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 space-y-8 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {step === 1 && 'Enter your email to receive a code'}
            {step === 2 && 'Enter the verification code'}
            {step === 3 && 'Set your new password'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Email */}
          {step === 1 && (
            <>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full py-2 px-4 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingOtp ? 'Sending...' : 'Send Verification Code'}
              </button>
            </>
          )}

          {/* OTP */}
          {step === 2 && (
            <>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Verification code"
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-2 px-4 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Verify Code
              </button>
            </>
          )}

          {/* New Password */}
          {step === 3 && (
            <>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New password"
                  className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, new: !p.new }))
                  }
                  className="absolute top-2.5 right-3 text-gray-400"
                >
                  <Eye size={20} />
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute top-2.5 right-3 text-gray-400"
                >
                  <Eye size={20} />
                </button>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="w-full py-2 px-4 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-50"
              >
                {resettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;