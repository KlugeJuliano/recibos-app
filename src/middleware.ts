// middleware.ts
import { NextRequest } from 'next/server'
import { supabaseMiddleware } from './utils/supabase/middleware'


export async function middleware(req: NextRequest) {
  return supabaseMiddleware(req)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
