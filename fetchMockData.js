import https from "https";
import fs from "fs";
import chalk from "chalk";
import chalkTemplate from "chalk-template";

const messages = {
  success: (jsonPath) => chalkTemplate`
      {green.bold Loaded JSON file}
      {bold ${jsonPath}}
    `,
};

const fetchMockData = (jsonPath) =>
  new Promise((resolve, reject) => {
    if (jsonPath.includes("http")) {
      https
        .get(jsonPath, (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", async () => {
            try {
              await resolve(body);
            } catch (error) {
              reject(error.message);
            }
          });
        })
        .on("error", (error) => {
          reject(error.message);
        });
    } else {
      fs.readFile(jsonPath, async (error, data) => {
        if (error) throw error;
        await resolve(data);
      });
    }
  }).then((data) => {
    console.log(messages.success(jsonPath));
    return data;
  });

export default fetchMockData;
