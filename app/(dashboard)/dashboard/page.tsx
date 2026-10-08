import { requireUser } from "@/lib/auth/requireUser"

export default async function DashboardPage(){
    const user = await requireUser(); 
    return(
        <div className="p-8">
      <h1 className="text-2xl">Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
    )
}