import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AuthModal({ isOpen, onClose, onLogin, onSignUp }: { isOpen: boolean; onClose: () => void; onLogin?: () => void; onSignUp?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, setIsNewUser } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          // User-friendly error messages
          if (error.message?.includes('Invalid login credentials')) {
            setError('Incorrect email or password. Please try again.');
          } else if (error.message?.includes('Email not confirmed')) {
            setError('Please check your email and confirm your account first.');
          } else {
            setError(error.message || 'Login failed. Please try again.');
          }
          setIsLoading(false);
          return;
        }
        if (onLogin) onLogin();
        onClose();
      } else {
        const { error, isNew } = await signUp(email, password);
        if (error) {
          if (error.message?.includes('already registered')) {
            setError('This email is already registered. Try logging in instead.');
          } else {
            setError(error.message || 'Signup failed. Please try again.');
          }
          setIsLoading(false);
          return;
        }
        if (isNew) {
          setIsNewUser(true);
          onClose();
          if (onSignUp) {
            onSignUp();
          } else {
            navigate('/profile-setup');
          }
        }
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10"
        >
          <div className="flex items-center justify-center p-4 border-b border-neutral-100 relative">
            <button
              onClick={onClose}
              className="absolute left-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="font-bold text-lg">{isLogin ? 'Log in' : 'Sign up'}</h2>
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-semibold mb-1 text-[#17294F]">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h3>
            <p className="text-sm text-neutral-400 mb-5">
              {isLogin
                ? 'Sign in to manage your listings and messages.'
                : 'Join Khubo and find your perfect place or roommate.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] focus:border-transparent transition-all"
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm password — signup only */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="relative overflow-hidden"
                  >
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#17294F] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </motion.div>
                )}

                {isLogin && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#17294F] bg-white border-neutral-300 rounded focus:ring-2 focus:ring-[#17294F] cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-neutral-600 font-medium cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#17294F] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest mt-2 hover:bg-[#1e3466] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : isLogin ? (
                  'Log in'
                ) : (
                  'Create Account →'
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-[1px] bg-neutral-200 flex-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">or</span>
              <div className="h-[1px] bg-neutral-200 flex-1" />
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors font-medium text-neutral-800">
                <Globe size={20} />
                Continue with Google
              </button>
            </div>
          </div>

          <div className="bg-neutral-50 p-6 border-t border-neutral-100 flex items-center justify-center gap-2 text-sm text-neutral-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setConfirmPassword('');
              }}
              className="font-bold text-[#17294F] hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
