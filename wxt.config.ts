import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  alias: {
    "@": "./src", // Ensure your source code is in the /src folder
  },
  modules: ["@wxt-dev/module-react"],
});
