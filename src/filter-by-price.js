import XLSX from "xlsx";
import writeFile from "./util.js"

//Ejecuta las funciones que filtran casas segun su precio y genera un archivo JSON y un XLSX
function filterByPrice({ houses, maximumPrice, city }) {
	let filteredHouses = filterHouses(houses, maximumPrice);
	writeXLSXFile(filteredHouses);
	writeFile(city, filteredHouses)
}

//Filtra las casas encontradas segun su precio
function filterHouses(houses, maximumPrice){
	const filteredHouses = houses
		.filter(
			(house) =>
				Number(house.priceInCLP.replace("$", "").replace(/\./g, "")) <
				maximumPrice
		)
		.map((filterHouse) => {
			return {
				Location: filterHouse.location,
				URL: filterHouse.url,
			};
		});
		return filteredHouses;
}

//Crea un archivo XLSX con las casas filtradas
function writeXLSXFile(filteredHouses){
	const workSheet = XLSX.utils.json_to_sheet(filteredHouses);
	const workBook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workBook, workSheet, "Houses");
	XLSX.writeFile(workBook, `./xlsx/${city}.xlsx`);
	console.log(`${city} XLSX File generated successfully`);
}

export default filterByPrice;
