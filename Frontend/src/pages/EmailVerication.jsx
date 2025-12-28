import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useEmailverification } from '../hooks/Auth/useMutation';
import { useAuth } from '../hooks/Auth/useAuth';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const auth = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Use the email verification hook
  const verifyMutation = useEmailverification();

  // Handle successful verification
  const handleVerifySuccess = (data) => {
    // Save token if provided
    if (data.data?.accessToken) {
      auth.setAccessToken(data.data.accessToken);
    }

    setSuccessMessage('Email verified successfully! Redirecting to dashboard...');
    setError('');
    
    // Redirect to dashboard after 1.5 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  // Handle verification error
  const handleVerifyError = (err) => {
    setError(err.response?.data?.message || 'Failed to verify OTP');
    setSuccessMessage('');
  };

  // Resend OTP mutation
  const handleResendOtp = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length < 6) {
      setError('OTP must be at least 6 digits');
      return;
    }

    setError('');
    // Call mutation with userId and otp
    verifyMutation.mutate(
      { userId, otp },
      {
        onSuccess: handleVerifySuccess,
        onError: handleVerifyError,
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 space-y-8 border border-gray-200 dark:border-gray-700">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Email
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            We've sent a verification code to your email address. Please enter it below.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '');
                setOtp(value.slice(0, 6));
                setError('');
              }}
              maxLength="6"
              className="w-full px-4 py-3 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifyMutation.isPending || !otp}
            className="w-full py-3 px-4 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {verifyMutation.isPending ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center text-sm text-gray-600 dark:text-gray-400">
          Check your spam/junk folder if you don't see the email in your inbox
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
