// app/login/page.tsx

import LoginPage from './loginPage';
import type { Metadata } from 'next';
export const metadata: Metadata = {
   title: 'Login Page',
}

export default function Page() {
   return (
      <LoginPage/>
   )
}