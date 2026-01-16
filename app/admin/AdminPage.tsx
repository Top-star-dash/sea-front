'use client'
import AllUsersButton from "@/components/AllUsersButton"
import LogoutButton from "@/components/LogoutButton"
export default function AdminPage() {
   return (
      <>
         <LogoutButton />
         <br/>
         <AllUsersButton />
      </>
   )
}