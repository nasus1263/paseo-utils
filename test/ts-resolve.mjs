// Lets tests import plugin sources whose relative imports omit the ".ts" extension, as the
// plugin bundler allows. Usage: node --import ./test/ts-resolve.mjs --test ...
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        if (/^\\.\\.?\\//.test(specifier) && !/\\.[cm]?[jt]sx?$/.test(specifier)) {
          try {
            return await next(specifier + ".ts", context);
          } catch {}
        }
        return next(specifier, context);
      }
    `),
);
