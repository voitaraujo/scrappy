import puppeteer from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";

import { Browser, Page } from "puppeteer";
import { PageScrapping, urlImageIsAccessible } from "./PageScrappingClass.js";
import { IScrappingResponse } from "./types.js";

export async function ScrappingHandler(
  uri: string,
  coverType: "arbitraryChoosenImage" | "screenCapture",
  coverAs: "b64" | "source"
): Promise<IScrappingResponse | null> {
  let browser: Browser;
  let page: Page;

  puppeteer.use(pluginStealth());

  // Launch browser
  try {
    // TODO: move path to .env
    browser = await puppeteer.launch({
      headless: true,
      args: [],
      executablePath: process.env.CHROMIUM_PATH,
    });
  } catch (err: any) {
    return null;
  }

  // Create new tab
  try {
    page = await browser.newPage();

    page.setUserAgent(
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
    );

    page.setViewport({
      height: 640,
      width: 1080,
      hasTouch: false,
      isMobile: false,
      isLandscape: false,
    });
  } catch (err: any) {
    browser.close();
    return null;
  }

  try {
    await page.goto(uri, { timeout: 10000 });
    await page.exposeFunction("urlImageIsAccessible", urlImageIsAccessible);

    const capture2B64 = (await page.screenshot({
      type: "jpeg",
      quality: 50,
      fullPage: false,
      captureBeyondViewport: false,
      encoding: "base64",
    })) as string;

    const results = await formatResults(
      uri,
      coverType,
      coverAs,
      page,
      capture2B64
    );

    browser.close();
    return results;
  } catch (err: any) {
    browser.close();
    return null;
  }
}

async function formatResults(
  uri: string,
  coverType: "arbitraryChoosenImage" | "screenCapture",
  coverAs: "b64" | "source",
  page: Page,
  screenshot: string
) {
  const Scrap = new PageScrapping(page, uri);

  const results = {
    scrappedAt: new Date(),
    title: await Scrap.getTitle(),
    description: await Scrap.getDescription(),
    domain: await Scrap.getDomainName(),
    https: Scrap.isSecure(),
    lang: await Scrap.getLang(),
    favicon: await Scrap.getFavicon(),
    image:
      coverType === "arbitraryChoosenImage"
        ? await Scrap.getImg()
        : `data:image/png;base64, ${screenshot}`,
    // image:
    //   coverType === "arbitraryChoosenImage"
    //     ? coverAs === "b64"
    //       ? binarySrcToBase64('')
    //       : await Scrap.getImg()
    //     : coverAs === "source"
    //     ? Base64ToSrc('')
    //     : `data:image/png;base64, ${screenshot}`,
  };

  return results;
}

function binarySrcToBase64(imgSrc: string): string {
  // TODO: (src as base64)
  return "implement funcionallity (src as base64)";
}

function Base64ToSrc(base64Img: string): string {
  // TODO: (base64 as src)
  return "implement funcionallity (base64 as src)";
}
