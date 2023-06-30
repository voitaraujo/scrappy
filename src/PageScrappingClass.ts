/*
  Credits to Andrej Gajdos who wrote this helpful article about web scrapping,
  also published his logic as a package.
  https://andrejgajdos.com/how-to-create-a-link-preview/
  https://github.com/AndrejGajdos/link-preview-generator#readme

  yoink'ed his code bc i needed to make some minor changes to it, convert to
  typescript and remove deprecated dependencies!
*/

import Axios from "axios";
import isBase64 from "is-base64";
import { Page } from "puppeteer";

export class PageScrapping {
  private Page: Page;
  private URI: string;

  constructor(page: Page, uri: string) {
    this.Page = page;
    this.URI = uri;
  }

  public async getImg() {
    const img = await this.Page.evaluate(async () => {
      const ogImg = document.querySelector<HTMLMetaElement>(
        'meta[property="og:image"]'
      );
      if (
        ogImg != null &&
        ogImg.content.length > 0 &&
        (await urlImageIsAccessible(ogImg.content))
      ) {
        return ogImg.content;
      }

      const imgRelLink = document.querySelector<HTMLLinkElement>(
        'link[rel="image_src"]'
      );
      if (
        imgRelLink != null &&
        imgRelLink.href.length > 0 &&
        (await urlImageIsAccessible(imgRelLink.href))
      ) {
        return imgRelLink.href;
      }

      const twitterImg = document.querySelector<HTMLMetaElement>(
        'meta[name="twitter:image"]'
      );
      if (
        twitterImg != null &&
        twitterImg.content.length > 0 &&
        (await urlImageIsAccessible(twitterImg.content))
      ) {
        return twitterImg.content;
      }

      let imgs = Array.from(document.getElementsByTagName("img"));

      if (imgs.length > 0) {
        imgs = imgs.filter((img) => {
          let addImg = true;

          if (img.naturalWidth > img.naturalHeight) {
            if (img.naturalWidth / img.naturalHeight > 3) {
              addImg = false;
            }
          } else {
            if (img.naturalHeight / img.naturalWidth > 3) {
              addImg = false;
            }
          }

          if (img.naturalHeight <= 50 || img.naturalWidth <= 50) {
            addImg = false;
          }

          return addImg;
        });

        if (imgs.length > 0) {
          imgs.forEach((img) =>
            img.src.indexOf("//") === -1
              ? (img.src = `${new URL(this.URI).origin}/${img.src}`)
              : img.src
          );
          return imgs[0].src;
        }
      }

      return null;
    });

    return img;
  }

  public async getTitle() {
    const title = await this.Page.evaluate(() => {
      const ogTitle = document.querySelector<HTMLMetaElement>(
        'meta[property="og:title"]'
      );
      if (ogTitle != null && ogTitle.content.length > 0) {
        return ogTitle.content;
      }
      const twitterTitle = document.querySelector<HTMLMetaElement>(
        'meta[name="twitter:title"]'
      );
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
  }

  public async getDescription() {
    const description = await this.Page.evaluate(() => {
      const ogDescription = document.querySelector<HTMLMetaElement>(
        'meta[property="og:description"]'
      );
      if (ogDescription != null && ogDescription.content.length > 0) {
        return ogDescription.content;
      }
      const twitterDescription = document.querySelector<HTMLMetaElement>(
        'meta[name="twitter:description"]'
      );
      if (twitterDescription != null && twitterDescription.content.length > 0) {
        return twitterDescription.content;
      }
      const metaDescription = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );
      if (metaDescription != null && metaDescription.content.length > 0) {
        return metaDescription.content;
      }
      let paragraphs = document.querySelectorAll<HTMLParagraphElement>("p");
      let fstVisibleParagraph = null;
      for (let i = 0; i < paragraphs.length; i++) {
        if (
          // if object is visible in dom
          paragraphs[i].offsetParent !== null &&
          !(paragraphs[i].childElementCount !== 0)
        ) {
          fstVisibleParagraph = paragraphs[i].textContent;
          break;
        }
      }
      return fstVisibleParagraph;
    });
    return description;
  }

  public async getDomainName() {
    const domainName = await this.Page.evaluate(() => {
      const canonicalLink = document.querySelector<HTMLLinkElement>(
        "link[rel=canonical]"
      );
      if (canonicalLink != null && canonicalLink.href.length > 0) {
        return canonicalLink.href;
      }
      const ogUrlMeta = document.querySelector<HTMLMetaElement>(
        'meta[property="og:url"]'
      );
      if (ogUrlMeta != null && ogUrlMeta.content.length > 0) {
        return ogUrlMeta.content;
      }
      return null;
    });
    return domainName != null
      ? new URL(domainName).hostname.replace("www.", "")
      : new URL(this.URI).hostname.replace("www.", "");
  }

  public async getFavicon() {
    const noLinkIcon = `${new URL(this.URI).origin}/favicon.ico`;
    if (await urlImageIsAccessible(noLinkIcon)) {
      return noLinkIcon;
    }

    const favicon = await this.Page.evaluate(async () => {
      const icon16Sizes = document.querySelector<HTMLLinkElement>(
        'link[rel=icon][sizes="16x16"]'
      );
      if (
        icon16Sizes &&
        icon16Sizes.href.length > 0 &&
        (await urlImageIsAccessible(icon16Sizes.href))
      ) {
        return icon16Sizes.href;
      }

      const shortcutIcon = document.querySelector<HTMLLinkElement>(
        'link[rel="shortcut icon"]'
      );
      if (
        shortcutIcon &&
        shortcutIcon.href.length > 0 &&
        (await urlImageIsAccessible(shortcutIcon.href))
      ) {
        return shortcutIcon.href;
      }

      const icons =
        document.querySelectorAll<HTMLLinkElement>("link[rel=icon]");
      for (let i = 0; i < icons.length; i++) {
        if (
          icons[i] &&
          icons[i].href.length > 0 &&
          (await urlImageIsAccessible(icons[i].href))
        ) {
          return icons[i].href;
        }
      }

      const appleTouchIcons = document.querySelectorAll<HTMLLinkElement>(
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
  }

  public async getLang() {
    const lang = await this.Page.evaluate(async () => {
      const HtmlTag = document.documentElement;

      if (HtmlTag && HtmlTag.lang) {
        return HtmlTag.lang;
      }

      return "unknown";
    });

    return lang;
  }

  public isSecure() {
    return this.URI.toLocaleLowerCase().startsWith("https://");
  }
}

export async function urlImageIsAccessible(url: string) {
  const correctedUrls = new Set(url.match(/\bhttps?:\/\/\S+/gi) ?? []);

  if (isBase64(url, { allowMime: true })) {
    return true;
  }

  if (correctedUrls.size !== 0) {
    const urlResponse = await Axios.get(correctedUrls.values().next().value);
    const contentType = urlResponse.headers["content-type"];

    return new RegExp("image/*").test(contentType ?? "");
  }

  return false;
}
