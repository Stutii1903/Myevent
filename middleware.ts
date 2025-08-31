import { authMiddleware,  } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/events/:id',
    '/api/webhook/stripe',
    '/favicon.ico',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/logo.svg',
    '/hero.svg',
    '/public/dotted-pattern.png'
  ],
  ignoredRoutes: [
  
    '/api/webhook/stripe',
    '/api/webhook/clerk',
    '/api/uploadthing',
    '/api/test-db'
  ]
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
 
   '/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}