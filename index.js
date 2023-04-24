import treblle from "@treblle/express";
import express from "express";
import { ScrappingService } from "./scrappingService.js";

const app = express();
app.use(treblle())

app.get("/", async (req, res) => {
  res.status(200).send({
    message: 'consume this api by making an GET request to BASE_ENDPOINT/preview?uri=https://www.facebook.com'
  });
})

app.get("/preview", async (req, res) => {
  try {
    const url = decodeURI(req.query.uri);

    const result = await ScrappingService(url);

    res.status(200).send(result);
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started");
});

export default app;
