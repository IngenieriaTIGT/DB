import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const cookies = request.headers.get('cookie') || ''
  const cookieList = cookies.split(';').map(c => c.trim())
  
  const sessionToken = cookieList.find(c => 
    c.startsWith('next-auth.session-token=') || 
    c.startsWith('__Secure-next-auth.session-token=')
  )
  
  return NextResponse.json({
    allCookies: cookieList,
    hasSessionToken: !!sessionToken,
    sessionTokenName: sessionToken ? sessionToken.split('=')[0] : null
  })
}
