import fs from "fs";

//Crea un archivo JSON con la ciudad y arreglo de casas filtradas
function writeFile(city, filteredHouses){
    fs.writeFile(
    `./json/${city}.json`,
    JSON.stringify(filteredHouses),
    function (err) {
        if (err) {
            console.log(err);
        }
        console.log(`${city} JSON generated successfully`);
    }
    );
}

export default writeFile;