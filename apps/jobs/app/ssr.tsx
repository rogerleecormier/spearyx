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

export type AppLoadContext = {
  cloudflare: {
    env: {
      DB: D1Database;
    };
  };
};

// Cloudflare Pages/Workers handler that injects bindings into context
export const onRequest = async (context: EventContext<any, any, any>) => {
  const { request, env } = context;

  // Create load context with Cloudflare bindings
  const loadContext: AppLoadContext = {
    cloudflare: {
      env: {
        DB: env.DB,
      },
    },
  };

  // Get the default handler
  const handler = createStartHandler({
    createRouter: getRouter,
    getRouterManifest,
  })(defaultStreamHandler);

  // Call handler with context
  return handler({
    request,
    context: loadContext,
  });
};
