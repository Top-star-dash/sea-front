import { toast } from "sonner";
export default function AllUsersButton() {
   const handleUsers = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch('/api/users/findAll', {
         credentials: "include",
      })
      const data = await res.json();
      if (res.ok) {
         console.log("data: ", data);
         toast.success("Fetch All Users Success!!!!")
      }
   }
   return (
      <>
         <button onClick={handleUsers}>All Users</button>
      </>
   )
}