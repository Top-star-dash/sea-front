import type { Metadata } from 'next';
import TestPage from './TestPage';
export const metadata: Metadata = {
   title: 'Test Page',
}

export default function Page() {
   return (
      <div className='flex-y gap-2'>
         TestPage
         <TestPage />
      </div>
   )
}