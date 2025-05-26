import { createRouteHandler } from "uploadthing/next";

// import { createRouteHandler } from "uploadthing/next-legacy";

import { ourFileRouter } from "./core";
 
// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
 

});