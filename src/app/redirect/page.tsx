import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

async function RedirectPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }
  
  if (session.user.rol === "ADMIN") {
    redirect("/dashboard")
  }
  
  redirect("/portal")
}

export default RedirectPage
