# An API to request url scrapping

## How to run:
> Clone the project to your machine and install the dependencies with `yarn` or `npm install`

> Run with `yarn dev` or `npm run dev`

> If you see any compilation or runtime error even on the "/" route, try first running `npx tsc --importHelpers` and then the `run` command (`concurrently` sometimes goes crazy)

## How to consume:

> Make an request to BASE_ENDPOINT/scrap?uri=https://THE-LINK-YOU-WANNA-SCRAP.com and you will get a 200 json response with scrappingResults and a message. If anything goes wrong you'll receive a 400 json response with just the message.

## What's in the scrapping?

> Some data can be uncertain, misleading or just abscent, keep that in mind.

- scrappedAt: Date;
- title: string;
- description: string;
- domain: string;
- https: boolean;
- lang: string;
- favIcon: Source(url)
- image: Base64 or Source(url)

## Opcional params:

> You can use the opcional params "mode", "only", "coverType" and "coverAs" to chose how/which data you get back.

- "mode": ["auto", "force"] (default: "auto")
- "only": ["scrappedAt", "title", "description", "domain", "https", "lang", "image", "favicon"]
- "coverType": ["arbitraryChoosenImage", "screenCapture"] (default: "screenCapture")
- "coverAs": ["b64" | "source"] (default: "b64")
