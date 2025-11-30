import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { getRouterManifest } from "@tanstack/react-start/router-manifest";

import { getRouter } from "../src/router";

export default createStartHandler({
  createRouter: getRouter,
  getRouterManifest,
})(defaultStreamHandler);

// Cloudflare Pages/Workers handler
export const onRequest = async (context: EventContext<any, any, any>) => {
  const { request, env } = context;

  // Get the default handler
  const handler = createStartHandler({
    createRouter: getRouter,
    getRouterManifest,
  })(defaultStreamHandler);

  // Call handler with context
  return handler({
    request,
    context: {
      cloudflare: {
        env,
      },
    },
  });
};
