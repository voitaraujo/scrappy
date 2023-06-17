import puppeteer from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import request from "request";
import { scrappingHandler, urlImageIsAccessible } from "./scrappingHandler.js";

export async function ScrappingService(uri: string) {
  puppeteer.use(pluginStealth());

  const pptrAgent =
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
  const pptrExecutablePath = "/opt/homebrew/bin/chromium";

  let params;

  params = {
    headless: true,
    args: [],
    executablePath: pptrExecutablePath,
  };

  const browser = await puppeteer.launch(params);
  const page = await browser.newPage();

  page.setUserAgent(pptrAgent);

  page.setViewport({
    height: 640,
    width: 1080,
    hasTouch: false,
    isMobile: false,
    isLandscape: false,
  });

  try {
    await page.goto(uri, { timeout: 10000 });
    await page.exposeFunction("request", request);
    await page.exposeFunction("urlImageIsAccessible", urlImageIsAccessible);

    // const pathToPreview = path.resolve('src', 'tmp', randomUUID(), 'preview.jpeg')
    // if (!fs.existsSync(path.dirname(pathToPreview))) {
    //   fs.mkdirSync(path.dirname(pathToPreview))
    // }

    let preview2B64: string | Buffer | null = await page.screenshot({
      // path: pathToPreview,
      type: "jpeg",
      quality: 50,
      fullPage: false,
      captureBeyondViewport: false,
      encoding: "base64",
    });

    if (typeof preview2B64 !== "string") {
      preview2B64 = null;
    }

    let result = await scrappingHandler(page, uri, preview2B64);

    await browser.close();
    return result;
  } catch (err) {
    await browser.close();
    return {
      title: "",
      description: "",
      domain: "",
      preview: null,
      favicon: "",
      previewFrom: new Date(),
    };
  }
}
