import { sendMessage } from "webext-bridge/background";
import type { WebRequest } from "webextension-polyfill";

/**
 * TO SEE THE LOGS FROM BACKGROUND.JS
 * GO TO MANAGE EXTENSIONS
 * ENABLE DEVELOPER MODE
 * INSPECT VIEW
 * https://stackoverflow.com/questions/10257301/accessing-console-and-devtools-of-extensions-background-js#:~:text=To%20view%20the%20correct%20console,or%20service%20worker%20(ManifestV3).
 */

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}

const callback = async function (details: any) {
  if (details.url.startsWith("chrome-extension:")) {
    return;
  }

  // eslint-disable-next-line no-console
  console.info("Download URL", details.url);

  if (!details.url.endsWith(".vtt")) {
    return;
  }

  const response = await fetch(`${details.url}?ajax=1`);

  const body = await response.text();

  const lines = body.split("\r\n").filter((item) => {
    if (item === "WEBVTT") {
      return false;
    }

    if (!item) {
      return false;
    }

    if (item.includes("-->")) {
      return false;
    }

    return true;
  });

  const newLines = [];
  const endingCharaters = [".", "?", "？"];
  let i = 0;
  for (const line of lines) {
    const lastCharacter = line.trim().slice(-1);
    if (!newLines[i]) {
      newLines[i] = line.trim();
    } else {
      newLines[i] += ` ${line.trim()}`;
    }

    if (endingCharaters.includes(lastCharacter)) {
      i++;
    }
  }

  sendMessage(
    "subtitle",
    { lines: newLines },
    { context: "content-script", tabId: details.tabId }
  );
};

const filter: WebRequest.RequestFilter = {
  urls: ["*://*/*.vtt"],
};
const opt_extraInfoSpec: any[] = [];

browser.webRequest.onCompleted.addListener(callback, filter, opt_extraInfoSpec);
