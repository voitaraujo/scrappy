/*
  ALL credits to Andrej Gajdos,

  yoink'ed his code bc i may needed to make some minor changes to it!
*/

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// import getUrls from "get-urls";
import isBase64 from "is-base64";
import util from "util";
const request = util.promisify(require('request'));

// commited getUrls part bc getUrls consume too much memory in vercel deployment(package re2)
export const urlImageIsAccessible = async (url) => {
  // const correctedUrls = getUrls(url);
  if (isBase64(url, { allowMime: true })) {
    return true;
  }

  // if (correctedUrls.size !== 0) {
  //   const urlResponse = await request(correctedUrls.values().next().value);
  //   const contentType = urlResponse.headers["content-type"];
  //   return new RegExp("image/*").test(contentType);
  // }

  const urlResponse = await request(url);
  const contentType = urlResponse.headers["content-type"];
  return new RegExp("image/*").test(contentType);
};

const getTitle = async (page) => {
  const title = await page.evaluate(() => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle != null && ogTitle.content.length > 0) {
      return ogTitle.content;
    }
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle != null && twitterTitle.content.length > 0) {
      return twitterTitle.content;
    }
    const docTitle = document.title;
    if (docTitle != null && docTitle.length > 0) {
      return docTitle;
    }
    const h1El = document.querySelector("h1");
    const h1 = h1El ? h1El.innerHTML : null;
    if (h1 != null && h1.length > 0) {
      return h1;
    }
    const h2El = document.querySelector("h2");
    const h2 = h2El ? h2El.innerHTML : null;
    if (h2 != null && h2.length > 0) {
      return h2;
    }
    return null;
  });
  return title;
};

const getDescription = async (page) => {
  const description = await page.evaluate(() => {
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDescription != null && ogDescription.content.length > 0) {
      return ogDescription.content;
    }
    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    );
    if (twitterDescription != null && twitterDescription.content.length > 0) {
      return twitterDescription.content;
    }
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription != null && metaDescription.content.length > 0) {
      return metaDescription.content;
    }
    let paragraphs = document.querySelectorAll("p");
    let fstVisibleParagraph = null;
    for (let i = 0; i < paragraphs.length; i++) {
      if (
        // if object is visible in dom
        paragraphs[i].offsetParent !== null
      ) {
        fstVisibleParagraph = paragraphs[i].textContent;
        break;
      }
    }
    return fstVisibleParagraph;
  });
  return description;
};

const getDomainName = async (page, uri) => {
  const domainName = await page.evaluate(() => {
    const canonicalLink = document.querySelector("link[rel=canonical]");
    if (canonicalLink != null && canonicalLink.href.length > 0) {
      return canonicalLink.href;
    }
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (ogUrlMeta != null && ogUrlMeta.content.length > 0) {
      return ogUrlMeta.content;
    }
    return null;
  });
  return domainName != null
    ? new URL(domainName).hostname.replace("www.", "")
    : new URL(uri).hostname.replace("www.", "");
};

const getFavicon = async (page, uri) => {
  const noLinkIcon = `${new URL(uri).origin}/favicon.ico`;
  if (await urlImageIsAccessible(noLinkIcon)) {
    return noLinkIcon;
  }

  const favicon = await page.evaluate(async () => {
    const icon16Sizes = document.querySelector('link[rel=icon][sizes="16x16"]');
    if (
      icon16Sizes &&
      icon16Sizes.href.length > 0 &&
      (await urlImageIsAccessible(icon16Sizes.href))
    ) {
      return icon16Sizes.href;
    }

    const shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
    if (
      shortcutIcon &&
      shortcutIcon.href.length > 0 &&
      (await urlImageIsAccessible(shortcutIcon.href))
    ) {
      return shortcutIcon.href;
    }

    const icons = document.querySelectorAll("link[rel=icon]");
    for (let i = 0; i < icons.length; i++) {
      if (
        icons[i] &&
        icons[i].href.length > 0 &&
        (await urlImageIsAccessible(icons[i].href))
      ) {
        return icons[i].href;
      }
    }

    const appleTouchIcons = document.querySelectorAll(
      'link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]'
    );
    for (let i = 0; i < appleTouchIcons.length; i++) {
      if (
        appleTouchIcons[i] &&
        appleTouchIcons[i].href.length > 0 &&
        (await urlImageIsAccessible(appleTouchIcons[i].href))
      ) {
        return appleTouchIcons[i].href;
      }
    }

    return null;
  });

  return favicon;
};

export const scrappingHandler = async (page, uri, screenCaptureB64) => {
  let obj = {
    title: await getTitle(page),
    description: await getDescription(page),
    domain: await getDomainName(page, uri),
    preview: screenCaptureB64,
    // img: await getImg(page, uri),
    favicon: await getFavicon(page, uri),
  };

  return obj;
};
