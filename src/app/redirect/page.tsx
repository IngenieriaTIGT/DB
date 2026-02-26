import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

async function RedirectPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }
  
  // SUPER_ADMIN y ADMIN van al dashboard
  if (session.user.rol === "SUPER_ADMIN" || session.user.rol === "ADMIN") {
    redirect("/dashboard")
  }
  
  // CLIENTE va al portal
  redirect("/portal")
}

export default RedirectPage
