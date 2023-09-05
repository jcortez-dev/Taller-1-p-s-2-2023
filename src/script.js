import axios from "axios";
import { load } from "cheerio";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import filterByPrice from "./filter-by-price.js";
import writeFile from "./util.js"
const argv = yargs(hideBin(process.argv)).argv;

const city = argv.location || "temuco-la-araucania";
const MAX_pages = argv.maxPages || 1;
let houses = [];
let page = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getHousesFromWeb() {
	console.log(`Page ${page + 1} of ${MAX_pages}`);

	const response = await axios.get(
		`https://www.portalinmobiliario.com/venta/casa/propiedades-usadas/${city}/_Desde_${
			(argv.perPage || 50) * (page + 1)
		}_NoIndex_True`
	);

	
	const $ = load(response.data);

	// Find all elements with ui-search-result__wrapper class, in div element.
	$("div.ui-search-result__wrapper").each((_index, el) => {
		const section = $(el).find("div > div > a");
		const url = $(section).attr("href");
		const originalPrice = Number(
			$(section)
				.find(".andes-money-amount__fraction")
				.text()
				.toString()
				.replace(/\./g, "")
		);
		const inUF =
			$(section).find(".andes-money-amount__currency-symbol").text() === "UF";
		const size = $(section)
			.find(".ui-search-card-attributes__attribute")
			.first()
			.text();
		const dorms = $(section)
			.find(".ui-search-card-attributes__attribute")
			.next()
			.text();
		const location = $(section)
			.children()
			.next()
			.next()
			.next()
			.children()
			.first()
			.text();
		houses.push({ url, originalPrice, inUF, size, dorms, location });
	});

	page++;

	await sleep(1000);

	return page === MAX_pages ? page : getHousesFromWeb();
}

//Get houses with the method `getHousesFromWeb`, finally, get the price in CLP and generate the JSON file with the extracted data
getHousesFromWeb().then(async () => {
	const { data } = await axios.get("https://mindicador.cl/api");
	const housesWithPriceInCLP = houses.map((house) => {
		return {
			...house,
			priceInCLP: new Intl.NumberFormat("es-CL", {
				currency: "CLP",
				style: "currency",
			}).format(
				house.inUF ? house.originalPrice * data.uf.valor : house.originalPrice
			),
		};
	});

	writeFile(city, housesWithPriceInCLP);

	if (argv.maximumPrice) {
		filterByPrice({
			houses: housesWithPriceInCLP,
			maximumPrice: argv.maximumPrice,
			city,
		});
	}
});
