const puppeteer = require("puppeteer");
const og = require("open-graph");

exports.parseUrl = async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = req.body.url;
  if (!stringIsAValidUrl(url)) {
    res.status(400).send({ message: "Please enter a valid Website URL." });
  } else {
    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    const title = await page.title();
    const rootUrl = await page.url();
    const favicon = await findBestFaviconURL(page, rootUrl);
    const largest_image = await page.evaluate(() => {
      return [...document.getElementsByTagName("img")].sort(
        (a, b) =>
          b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight
      )[0].src;
    });
    og(url, function (err, meta) {
      const snippet = meta;
      res.status(200).json({
        title: title,
        favicon: favicon,
        "large-image": largest_image,
        snippet: snippet,
      });

      if (err) res.status(500).send("Error in parsing the url");
    });
  }
  await browser.close();
};

stringIsAValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

const findBestFaviconURL = async function (page, pageUrl) {
  const rootUrl = pageUrl;
  const selectorsToTry = [`link[rel="icon"]`, `link[rel="shortcut icon"]`];

  let faviconUrlFromDocument = null;
  for (let i = 0; i < selectorsToTry.length; i++) {
    const href = await getDOMElementHRef(page, selectorsToTry[i]);
    if (typeof href === "undefined" || href === null || href.length === 0) {
      continue;
    }

    faviconUrlFromDocument = href;
    break;
  }

  if (faviconUrlFromDocument === null) {
    // No favicon link found in document, best URL is likley favicon.ico at root
    return rootUrl + "/favicon.ico";
  }

  if (
    faviconUrlFromDocument.substr(0, 4) === "http" ||
    faviconUrlFromDocument.substr(0, 2) === "//"
  ) {
    // absolute url
    return faviconUrlFromDocument;
  } else if (faviconUrlFromDocument.substr(0, 1) === "/") {
    // favicon relative to root
    return rootUrl + faviconUrlFromDocument;
  } else {
    // favicon relative to current (src) URL
    return pageUrl + "/" + faviconUrlFromDocument;
  }
};

const getDOMElementHRef = async function (page, query) {
  return await page.evaluate((q) => {
    const elem = document.querySelector(q);
    if (elem) {
      return elem.getAttribute("href") || "";
    } else {
      return "";
    }
  }, query);
};
