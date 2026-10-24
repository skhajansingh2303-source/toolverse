import { onRequest as __ads_txt_js_onRequest } from "/home/khajan/Desktop/toolsverse/functions/ads.txt.js"
import { onRequest as __app_ads_txt_js_onRequest } from "/home/khajan/Desktop/toolsverse/functions/app-ads.txt.js"
import { onRequest as ___middleware_js_onRequest } from "/home/khajan/Desktop/toolsverse/functions/_middleware.js"

export const routes = [
    {
      routePath: "/ads.txt",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__ads_txt_js_onRequest],
    },
  {
      routePath: "/app-ads.txt",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__app_ads_txt_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]