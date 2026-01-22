import React from "react";
import ReactDOM from "react-dom/client";
import { defineContentScript } from "wxt/utils/define-content-script";
import { AIAssistantInterface } from "../src/components/ui/ai-assistant-interface";

export default defineContentScript({
  matches: ["*://web.whatsapp.com/*"],
  main() {
    const chromeApi = (globalThis as any).chrome;
    let host: HTMLElement | null = null;
    let root: ReactDOM.Root | null = null;

    const mount = () => {
      if (root) return;
      host = document.createElement("div");
      host.setAttribute("data-ai-assistant-host", "true");
      const shadow = host.attachShadow({ mode: "open" });
      const app = document.createElement("div");
      shadow.appendChild(app);
      document.body.appendChild(host);

      root = ReactDOM.createRoot(app);
      root.render(
        React.createElement(
          "div",
          {
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 2147483647,
              pointerEvents: "none",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                position: "absolute",
                right: "16px",
                bottom: "16px",
                width: "420px",
                pointerEvents: "auto",
              },
            },
            React.createElement(AIAssistantInterface, {}),
          ),
        ),
      );
    };

    const unmount = () => {
      if (root) {
        root.unmount();
        root = null;
      }
      host?.remove();
      host = null;
    };

    if (chromeApi?.runtime?.onMessage?.addListener) {
      chromeApi.runtime.onMessage.addListener((msg: { type?: string }) => {
        if (msg?.type === "ai-assistant:open") {
          mount();
        }
        if (msg?.type === "ai-assistant:close") {
          unmount();
        }
      });
    }
  },
});
