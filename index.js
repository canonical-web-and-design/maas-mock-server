#!/usr/bin/env node

import { parse } from "url";
import httpServer from "./httpServer.js";
import webSocketServer from "./webSocketServer.js";
import fetchMockData from "./fetchMockData.js";
import { config } from "dotenv-flow";

config();
const MOCK_URL = process.env.MOCK_URL;

async function main() {
  const defaultPath = MOCK_URL;
  let enabledMock = defaultPath;
  let mocks = {
    [defaultPath]: await fetchMockData(defaultPath),
  };

  const setMockFromUrl = async (url) => {
    const data = await fetchMockData(url);
    mocks = { ...mocks, [url]: data };
    enabledMock = url;
    await data;
  };
  const getMockData = async (url = enabledMock) => {
    if (url in mocks) {
      return JSON.parse(mocks[url]);
    } else {
      await JSON.parse(setMockFromUrl(url));
    }
  };
  const getEnabledMock = () => enabledMock;

  const wss = await webSocketServer(getMockData);
  const server = httpServer(setMockFromUrl, getEnabledMock);

  server.on("upgrade", function upgrade(request, socket, head) {
    const { pathname } = parse(request.url);
    console.log("upgrade", pathname);
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  });
}

main();
