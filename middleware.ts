import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes:[
    
    '/',
    '/events/:id',
    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uplaodthing',
  ],
  ignoredRoutes: [

    '/api/webhook/clerk',
    '/api/webhook/stripe',
    '/api/uplaodthing',
  ]

});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};