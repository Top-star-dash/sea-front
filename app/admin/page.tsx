import type { Metadata } from 'next';
import AdminPage from './AdminPage';
export const metadata: Metadata = {
   title: 'Admin Page',
}

export default function Page(){
   return (
      <div className='flex-y gap-2'>
         admin
         <AdminPage />
      </div>
   )
}