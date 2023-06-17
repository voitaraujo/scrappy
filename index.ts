import treblle from "@treblle/express";
import dotenv from "dotenv";
import express from "express";

// import { ScrappingService } from "./scrappingService.js";

dotenv.config();

const app = express();
app.use(treblle());

app.get("/", async (req, res) => {
  res.status(200).send({
    message:
      "consume this api by making an GET request to BASE_ENDPOINT/preview?uri=https://www.facebook.com",
  });
});

app.get("/preview", async (req, res) => {
  let url: string;
  let mode: "auto" | "force" = "auto";
  let only: TOnlyParam = null;
  let coverType: "arbitraryChoosenImage" | "screenCapture" = 'screenCapture'
  let coverAs: 'b46' | 'source' = 'source'

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
        (req.query.only === "updatedAt" ||
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
        (req.query.coverType.trim() === "arbitraryChoosenImage" || req.query.coverType.trim() === "screenCapture")
      ) {
        coverType = req.query.coverType.trim() as "arbitraryChoosenImage" | "screenCapture";
      } else {
        throw new Error("invalid 'coverType' param");
      }
    }

    if (typeof req.query.coverAs !== "undefined") {
      if (
        typeof req.query.coverAs === "string" &&
        (req.query.coverAs.trim() === "arbitraryChoosenImage" || req.query.coverAs.trim() === "screenCapture")
      ) {
        coverAs = req.query.coverAs.trim() as 'b46' | 'source';
      } else {
        throw new Error("invalid 'coverAs' param");
      }
    }

    // const result = await ScrappingService(url);

    // res.status(200).send(result);
  } catch (err: any) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started");
});

export default app;


interface ICachedPreview {
  url: string;
  updatedAt: Date;
  title: string;
  description: string;
  domain: string;
  https: boolean;
  lang: string;

  favIconSrc: string;
  arbitraryChoosenImageSrc: string;
  screenCaptureSrc: string;
}

type TOnlyParam =
  | keyof Omit<
      ICachedPreview,
      "url" | "arbitraryChoosenImageSrc" | "screenCaptureSrc" | "favIconSrc"
    >
  | "image"
  | "favicon"
  | null;