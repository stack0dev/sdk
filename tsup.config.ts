import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "mail/index": "src/mail/index.ts",
    "cdn/index": "src/cdn/index.ts",
    "screenshots/index": "src/screenshots/index.ts",
    "extraction/index": "src/extraction/index.ts",
    "webdata/index": "src/webdata/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  external: [],
});
