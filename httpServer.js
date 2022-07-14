import chalkTemplate from "chalk-template";
import express from "express";
import { handleLogin, handleLogout } from "./handleLogin.js";

const serverListeningMessage = chalkTemplate`
      ${new Date().toTimeString()}
      {bold Server is listening on:}
      {bold.green.underline http://localhost:8080}
`;

function main(setMockFromUrl, getEnabledMock) {
  const httpServer = express();

  httpServer.get("/MAAS/accounts/login", function (request, response) {
    handleLogin(request, response);
  });

  httpServer.post("/MAAS/accounts/login", function (request, response) {
    handleLogin(request, response);
  });

  httpServer.post("/MAAS/accounts/logout", function (request, response) {
    handleLogout(request, response);
  });

  httpServer.post(
    "/mock-server-devtools/options",
    function (request, response) {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk.toString();
      });
      request.on("end", async () => {
        const params = new URLSearchParams(body);
        const url = params.get("url");
        try {
          await setMockFromUrl(url);
          response.writeHead(204);
        } catch (error) {
          response.writeHead(404);
        }
        response.end();
      });
    }
  );
  httpServer.get(
    "/mock-server-devtools/options",
    function (_request, response) {
      response.setHeader("Content-Type", "application/json");
      response.writeHead(200);
      response.end(JSON.stringify({ url: getEnabledMock() }));
    }
  );

  httpServer.get("/MAAS/accounts/", function (request, response) {
    response.writeHead(404);
    response.end();
  });

  return httpServer.listen(8080, function () {
    console.log(serverListeningMessage);
  });
}

export default main;
