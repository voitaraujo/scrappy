import dotenv from "dotenv";
import express from "express";

import { ScrappingHandler } from "./ScrappingHandler.js";
import { TOnlyParam } from "./types.js";

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();

app.get("/", async (req, res) => {
  res.status(200).send({
    message:
      "consume this api by making an GET request to BASE_ENDPOINT/scrap?uri=https://www.facebook.com",
  });
});

app.get("/scrap", async (req, res) => {
  let url: string;
  let mode: "auto" | "force" = "auto";
  let only: TOnlyParam = null;
  let coverType: "arbitraryChoosenImage" | "screenCapture" = "screenCapture";
  let coverAs: "b64" | "source" = "source";

  try {
    if (typeof req.query.uri !== "string" || req.query.uri.trim() === "") {
      throw new Error("invalid 'uri' param");
    }
    url = decodeURI(req.query.uri);

    if (typeof req.query.mode !== "undefined") {
      if (
        typeof req.query.mode === "string" &&
        (req.query.mode.trim() === "auto" || req.query.mode.trim() === "force")
      ) {
        mode = req.query.mode.trim() as "auto" | "force";
      } else {
        throw new Error("invalid 'mode' param");
      }
    }

    if (typeof req.query.only !== "undefined") {
      if (
        typeof req.query.only === "string" &&
        (req.query.only === "scrappedAt" ||
          req.query.only === "title" ||
          req.query.only === "description" ||
          req.query.only === "domain" ||
          req.query.only === "https" ||
          req.query.only === "lang" ||
          req.query.only === "image" ||
          req.query.only === "favicon")
      ) {
        only = req.query.only.trim() as TOnlyParam;
      } else {
        throw new Error("invalid 'only' param");
      }
    }

    if (typeof req.query.coverType !== "undefined") {
      if (
        typeof req.query.coverType === "string" &&
        (req.query.coverType.trim() === "arbitraryChoosenImage" ||
          req.query.coverType.trim() === "screenCapture")
      ) {
        coverType = req.query.coverType.trim() as
          | "arbitraryChoosenImage"
          | "screenCapture";
      } else {
        throw new Error("invalid 'coverType' param");
      }
    }

    if (typeof req.query.coverAs !== "undefined") {
      if (
        typeof req.query.coverAs === "string" &&
        (req.query.coverAs.trim() === "b64" ||
          req.query.coverAs.trim() === "source")
      ) {
        coverAs = req.query.coverAs.trim() as "b64" | "source";
      } else {
        throw new Error("invalid 'coverAs' param");
      }
    }

    const result = await ScrappingHandler(url, coverType, coverAs);

    if (result === null) {
      throw new Error("Internal error");
    }

    const message = "image is being returned either screenCapture as b64 or arbitraryChoosenImage as src since mixing coverType and coverAs parameters isn't fully supported yet";

    res
      .status(200)
      .json(
        only === null
          ? { scrappingResults: result, message }
          : { scrappingResults: { [only]: result[only] }, message }
      );
  } catch (err: any) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});

export default app;
