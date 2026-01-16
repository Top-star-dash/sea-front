'use client'
// app/login/page.tsx
import { useState } from 'react';
import { toast } from 'sonner'
import { useRouter } from 'next/navigation';

export default function LoginPage() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [validationErrors, setValidationErrors] = useState({
      username: '',
      password: '',
   });
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   // === 表单验证逻辑（与 BackendLoginPage 一致） ===
   const validateUsername = (username: string) => {
      if (!username) return 'Username cannot be empty';
      if (username.length < 3 || username.length > 20)
         return 'User name length should be between 3 and 20 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(username))
         return 'Username can only contain letters, numbers, and underscores';
      return '';
   };
   const validatePassword = (password: string) => {
      if (!password) return 'Password cannot be empty';
      if (password.length < 8) return 'Password must be at least 8 characters long';
      if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
      if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
         return 'Password must contain at least one special character';
      return '';
   };
   const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUsername(value);
      setValidationErrors((prev) => ({ ...prev, username: '' }));
   };

   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPassword(value);
      setValidationErrors((prev) => ({ ...prev, password: '' }));
   };

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      const usernameError = validateUsername(username);
      const passwordError = validatePassword(password);
      if (usernameError || passwordError) {
         setValidationErrors({ username: usernameError, password: passwordError });
         return;
      }

      setLoading(true);
      try {
         const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
         });

         if (res.ok) {
            const data = await res.json();
            const { accessToken, refreshToken } = data;
            // console.log("accessToken: %s \nrefreshToken: %s ", accessToken, refreshToken)
            if (accessToken) {
               try {
                  const res = await fetch('/api/auth/profile', {
                     credentials: 'include',
                  })
                  const data = await res.json();
                  if (res.ok) {
                     console.log("vertified success")
                     const { role } = data;
                     console.log("role: ", role)
                     if (role === "TEST_ADMIN") {
                        router.replace('/admin')
                        toast.success("登录到ADMIN页面")
                        return
                     }
                  } else {
                     console.log("error token")
                  }
               } catch (e) {
                  console.log("err: ", e)
               }
            }
            toast.success("登录到TEST页面")
            router.replace('/test')
         } else {
            toast.error('登录失败!');
         }
      } catch (err) {
         console.log("err: " + err)
         toast.error('handle登录异常!')
      } finally {
         setLoading(false)
      }
   };

   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
         <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-gray-900">Login</h1>
            </div>
            <form onSubmit={handleLogin} className="mt-8 space-y-6">
               <div className="space-y-4">
                  {/* Username */}
                  <div>
                     <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                     </label>
                     <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={handleUsernameChange}
                        className={`mt-1 block w-full rounded-md border ${validationErrors.username ? 'border-red-500' : 'border-gray-300'
                           } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                        placeholder="Username"
                     />
                     {validationErrors.username && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                     )}
                  </div>

                  {/* Password */}
                  <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                     </label>
                     <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        className={`mt-1 block w-full rounded-md border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'
                           } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                        placeholder="********"
                     />
                     {validationErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                     )}
                  </div>
               </div>
               {/* Submit Button */}
               <button
                  type="submit"
                  disabled={loading}
                  className={`group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                     }`}
               >
                  {loading ? 'Loading...' : 'Login'}
               </button>
            </form>
         </div>
      </div>
   );
}