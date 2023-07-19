import puppeteer, { ElementHandle } from "puppeteer";
import * as fs from "fs";
import { Browser } from "puppeteer";
import { clearInterval } from "timers";
const url =
  "https://www.wakacje.pl/lastminute/costa-almeria,costa-blanca,costa-de-la-luz,costa-del-azahar,costa-del-sol,costa-dorada,fuerteventura,gran-canaria,la-gomera,la-palma,lanzarote,majorka,minorka,sierra-nevada,teneryfa,grecja/?od-2023-09-01,do-2023-09-30,samolotem,all-inclusive,z-katowic,z-krakowa&src=fromSearch&gclid=Cj0KCQjw8NilBhDOARIsAHzpbLBsR1Zztd_WZfm-_4LFw38hLKLpfAnmjRPI_LIU7h-TlSURsh_p1UIaAsD4EALw_wcB";

const main = async () => {
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

  const hotels = await page.evaluate(async () => {
    await new Promise((resolve: any) => {
      let count = 0;
      let timer = setInterval(() => {
        window.scrollBy(0, 100);
        count++;
        if (count === 100) {
          resolve();
        }
        clearInterval(timer);
      }, 20);
    });
    const linksToHotels = Array.from(
      document.querySelectorAll("[data-test-offer-id]")
    );
    const data: Array<String> = [];
    for (let hotel of linksToHotels) {
      data.push(
        hotel.querySelector("[data-testid='offer-listing-name']")?.innerHTML ||
          ""
      );
    }
    return data;
    const hotels = linksToHotels.map((e) => ({
      title: e.querySelector("[data-testid='offer-listing-name']")!!.innerHTML,
    }));
    return hotels;
  });
  console.log(hotels);

  await browser.close();
};

main();
