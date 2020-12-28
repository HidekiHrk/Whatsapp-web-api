const whatsapp = require("./whatsapp");
const express = require("express");

const client = new whatsapp.Client();
const app = express();

app.use(express.json());

(async function main() {
  await client.connect();
  console.log("Ready!");
  client.messageLoop();
  app.post("/whatsappsend", function (req, res) {
    const { number, message } = req.body || {};
    if (number && message) {
      client.sendMessage(number, message);
    }
    res.status(200).send({ status: "enviando." });
  });
})();

app.listen(3289);
