import puppeteer, { ElementHandle } from "puppeteer";
import * as fs from "fs";
import { Browser } from "puppeteer";
import { clearInterval } from "timers";

// Set params for yourself
const MIN_RATING = 7;
const MIN_STARS = 4;

const url = `https://www.wakacje.pl/wczasy/costa-almeria,costa-blanca,costa-de-la-luz,costa-del-azahar,fuerteventura,gran-canaria,la-gomera,la-palma,lanzarote,majorka,minorka,sierra-nevada,teneryfa,grecja/?od-2023-09-01,do-2023-09-30,samolotem,all-inclusive,${MIN_STARS}-gwiazdkowe,ocena-${MIN_RATING},z-katowic,z-krakowa,z-warszawy,tanio&src=fromSearch&gclid=Cj0KCQjw8NilBhDOARIsAHzpbLBsR1Zztd_WZfm-_4LFw38hLKLpfAnmjRPI_LIU7h-TlSURsh_p1UIaAsD4EALw_wcB`;

async function scraper() {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 720 });
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector("#__next");
  await page.waitForSelector("[data-testid='offer-listing-name']");

  const [button] = await page.$x(
    "//button[contains(., 'AKCEPTUJĘ I PRZECHODZĘ DO SERWISU')]"
  );

  if (button) {
    await (button as ElementHandle<Element>).click();
  }

  let finalHotels = [];

  for (let i = 1; i <= 5; i++) {
    await page.waitForSelector("#__next");
    await page.waitForSelector(
      "[data-test-offer-id] [data-testid='offer-listing-name']"
    );
    await page.waitForSelector(
      "[data-test-offer-id] [data-testid='offer-listing-geo']"
    );
    const hotels = await page.evaluate(async () => {
      const parsePrice = (price: String): Number => {
        let result = price.replace(/[^0-9]/g, "");
        result.trim();
        return Number.parseFloat(result);
      };
      async function scrollDown(window: any) {
        await new Promise((resolve: any) => {
          let count = 0;
          let timer = setInterval(() => {
            window.scrollBy(0, 100);
            count++;
            if (count === 50) {
              resolve();
            }
            clearInterval(timer);
          }, 200);
        });
      }
      let data: Array<any> = [];
      await scrollDown(window);
      const linksToHotels = Array.from(
        document.querySelectorAll("[data-test-offer-id]")
      );
      data = linksToHotels.map((anchor: HTMLAnchorElement) => ({
        where:
          anchor.querySelector('[data-testid="offer-listing-geo"]').innerHTML ||
          "Not found",
        title:
          anchor.querySelector("[data-testid='offer-listing-name']")
            .innerHTML || "Not found",
        price: parsePrice(
          anchor.querySelector("[data-testid='offer-listing-section-price'] h4")
            .textContent || ""
        ),
        url: anchor.href,
      }));

      return data;
    });

    finalHotels.push(...hotels);
    await page.evaluate(() => {
      const anchor: HTMLAnchorElement = document.querySelector(
        "[data-area='btnNext'] a"
      );
      anchor.click();
    });
  }
  await browser.close();
  fs.writeFile("data.json", JSON.stringify(finalHotels), (err) => {
    if (err) console.log(err);
  });
}
scraper();
