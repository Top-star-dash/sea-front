import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
   const router = useRouter();
   const handleLogout = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch('/api/auth/logout', {
         method: "POST",
         credentials: "include",
      })
      if (res.ok) {
         console.log("Logout Success")
         toast.success("Logout Success!!!!")
         router.replace('/login')
      }
   }
   return (
      <>
         <div className="bg-blue-200">
            <button onClick={handleLogout}>Logout</button>
         </div>
      </>
   )
}