"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs = __importStar(require("fs"));
const timers_1 = require("timers");
// Set params for yourself
const MIN_RATING = 7;
const MIN_STARS = 4;
const url = `https://www.wakacje.pl/wczasy/costa-almeria,costa-blanca,costa-de-la-luz,costa-del-azahar,fuerteventura,gran-canaria,la-gomera,la-palma,lanzarote,majorka,minorka,sierra-nevada,teneryfa,grecja/?od-2023-09-01,do-2023-09-30,samolotem,all-inclusive,${MIN_STARS}-gwiazdkowe,ocena-${MIN_RATING},z-katowic,z-krakowa,z-warszawy,tanio&src=fromSearch&gclid=Cj0KCQjw8NilBhDOARIsAHzpbLBsR1Zztd_WZfm-_4LFw38hLKLpfAnmjRPI_LIU7h-TlSURsh_p1UIaAsD4EALw_wcB`;
async function scraper() {
    const browser = await puppeteer_1.default.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 720 });
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("#__next");
    await page.waitForSelector("[data-testid='offer-listing-name']");
    const [button] = await page.$x("//button[contains(., 'AKCEPTUJĘ I PRZECHODZĘ DO SERWISU')]");
    if (button) {
        await button.click();
    }
    const hotels = await page.evaluate(async () => {
        const parsePrice = (price) => {
            let result = price.replace(/[^0-9]/g, "");
            result.trim();
            return Number.parseFloat(result);
        };
        async function scrollDown(window) {
            await new Promise((resolve) => {
                let count = 0;
                let timer = setInterval(() => {
                    window.scrollBy(0, 100);
                    count++;
                    if (count === 100) {
                        resolve();
                    }
                    (0, timers_1.clearInterval)(timer);
                }, 20);
            });
        }
        await scrollDown(window);
        const linksToHotels = Array.from(document.querySelectorAll("[data-test-offer-id]"));
        const data = linksToHotels.map((anchor) => ({
            where: anchor.querySelector('[data-testid="offer-listing-geo"]')
                .innerHTML,
            title: anchor.querySelector("[data-testid='offer-listing-name']")
                .innerHTML,
            price: parsePrice(anchor.querySelector("[data-testid='offer-listing-section-price'] h4")
                .textContent || ""),
        }));
        return data;
    });
    fs.writeFile("data.json", JSON.stringify(hotels), (err) => {
        if (err)
            console.log(err);
    });
    await browser.close();
}
scraper();
//# sourceMappingURL=index.js.map