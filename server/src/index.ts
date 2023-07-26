import puppeteer, { ElementHandle } from "puppeteer";
import { Browser } from "puppeteer";
import { clearInterval } from "timers";
import sortAandSave from "./helpers";

// Set params for yourself
const MIN_RATINGWP = 6;
const MIN_RATINGTUI = 3;
const MIN_STARS = 4;
const WITHGREECE = true;

async function main() {
  try {
    const [dataWP, dataTUI] = await Promise.all([scraperWP(), scraperTUI()]);
    const result = [...dataWP, ...dataTUI];
    sortAandSave(result);
  } catch (err) {
    console.log(err);
  }
}

async function scraperWP() {
  const url =
    WITHGREECE === true
      ? `https://www.wakacje.pl/wczasy/costa-almeria,costa-blanca,costa-de-la-luz,costa-del-azahar,fuerteventura,gran-canaria,la-gomera,la-palma,lanzarote,majorka,minorka,sierra-nevada,teneryfa,chalkidiki,itaka,karpathos,korfu,kreta,peloponez,santorini,zakynthos/?od-2023-09-01,do-2023-09-30,samolotem,all-inclusive,${MIN_STARS}-gwiazdkowe,ocena-${MIN_RATINGWP},z-katowic,z-krakowa,z-warszawy,tanio&src=fromSearch&gclid=Cj0KCQjw8NilBhDOARIsAHzpbLBsR1Zztd_WZfm-_4LFw38hLKLpfAnmjRPI_LIU7h-TlSURsh_p1UIaAsD4EALw_wcB`
      : `https://www.wakacje.pl/wczasy/costa-almeria,costa-blanca,costa-de-la-luz,costa-del-azahar,fuerteventura,gran-canaria,la-gomera,la-palma,lanzarote,majorka,minorka,sierra-nevada,teneryfa/?od-2023-09-01,do-2023-09-30,samolotem,all-inclusive,${MIN_STARS}-gwiazdkowe,ocena-${MIN_RATINGWP},z-katowic,z-krakowa,z-warszawy,tanio&src=fromSearch&gclid=Cj0KCQjw8NilBhDOARIsAHzpbLBsR1Zztd_WZfm-_4LFw38hLKLpfAnmjRPI_LIU7h-TlSURsh_p1UIaAsD4EALw_wcB`;
  const browser: Browser = await puppeteer.launch({ headless: true });
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

  for (let i = 1; i <= 7; i++) {
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
          }, 60);
        });
      }

      await scrollDown(window);
      const linksToHotels = Array.from(
        document.querySelectorAll("[data-test-offer-id]")
      );
      const data = linksToHotels.map((anchor: HTMLAnchorElement) => ({
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
    const pageNumber = i + 1;

    finalHotels.push(...hotels);
    await Promise.all([
      page.waitForNavigation(),
      await page.goto(
        `https://www.wakacje.pl/wczasy/costa-almeria,costa-blanca,costa-de-la-luz,costa-del-azahar,fuerteventura,gran-canaria,la-gomera,la-palma,lanzarote,majorka,minorka,sierra-nevada,teneryfa,grecja/?str-${pageNumber},od-2023-09-01,do-2023-09-30,samolotem,all-inclusive,${MIN_STARS}-gwiazdkowe,ocena-${MIN_RATINGWP},z-katowic,z-krakowa,z-warszawy,tanio&src=fromSearch&gclid=Cj0KCQjw8NilBhDOARIsAHzpbLBsR1Zztd_WZfm-_4LFw38hLKLpfAnmjRPI_LIU7h-TlSURsh_p1UIaAsD4EALw_wcB`,
        { waitUntil: "networkidle2" }
      ),
    ]);
  }
  await browser.close();
  return finalHotels;
}

async function scraperTUI() {
  const url = `https://www.tui.pl/all-inclusive?pm_source=MENU&pm_name=All_Inclusive&q=%3Aprice%3AbyPlane%3AT%3Aa%3AKTW%3Aa%3AKRK%3Aa%3AWAW%3AdF%3A6%3AdT%3A14%3AstartDate%3A01.09.2023%3AendDate%3A23.09.2023%3ActAdult%3A2%3ActChild%3A0%3Ac%3ACFU%3Ac%3ACHQ%3Ac%3AGPA%3Ac%3AKGS%3Ac%3AMJT%3Ac%3ARHO%3Ac%3AZTH%3Ac%3AFXX%3Ac%3AHEV%3Ac%3AMAH%3Ac%3APMI%3Ac%3AACE%3Ac%3AFUE%3Ac%3AGMZ%3Ac%3ALPA%3Ac%3ATFS%3Ac%3AIC%3Aboard%3AGT06-AI%3AminHotelCategory%3A${MIN_STARS}s%3AtripAdvisorRating%3A${MIN_RATINGTUI}t%3Abeach_distance%3AdefaultBeachDistance%3AtripType%3AWS&fullPrice=false`;
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 720 });
  await page.goto(url, { waitUntil: "networkidle2" });
  const cookiesButton = await page.$(".cookies-bar__button--accept");
  if (cookiesButton) {
    await (cookiesButton as ElementHandle<Element>).click();
  }
  await page.waitForSelector('[data-testid="results-list-load-more-button"]');
  await page.waitForSelector(".results-container");
  await page.waitForSelector(
    '[data-testid="offer-tile"]:not(.offer-tile-wrapper--lastViewedOffer)'
  );
  await page.waitForSelector(".offer-tile-body__hotel-name");
  let refreshes = 0;
  let finalHotels: any[] = [];
  while (refreshes <= 6) {
    const viewMoreButton = await page.$(
      '[data-testid="results-list-load-more-button"]'
    );
    if (viewMoreButton) {
      (viewMoreButton as ElementHandle<Element>).click();
    }
    await page.waitForSelector('[data-testid="results-list-load-more-button"]');
    await page.waitForSelector(".results-container");
    await page.waitForSelector(
      '[data-testid="offer-tile"]:not(.offer-tile-wrapper--lastViewedOffer)'
    );
    await page.waitForSelector(".offer-tile-body__hotel-name");
    refreshes++;
  }
  const hotels = await page.evaluate(() => {
    const parsePrice = (price: string) => {
      return Number.parseFloat(price.replace(" ", ""));
    };
    const hotelsSelector: Array<any> = Array.from(
      document.querySelectorAll(
        '[data-testid="offer-tile"]:not(.offer-tile-wrapper--lastViewedOffer)'
      )
    );
    const data = hotelsSelector.map((element: HTMLDivElement) => ({
      where: element
        .querySelector("a.offer-tile-header")
        .getAttribute("destination"),
      title: element.querySelector(".offer-tile-body__hotel-name").innerHTML,
      price: parsePrice(
        element.querySelector(".price-value__amount").innerHTML
      ),
      url: (element.querySelector("a.offer-tile-header") as HTMLAnchorElement)
        .href,
    }));
    return data;
  });
  finalHotels.push(...hotels);
  await browser.close();
  return finalHotels;
}

main();
