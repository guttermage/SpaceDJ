console.log("IS THIS WORKING")

function xmlParser(xmlRaw){

const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlRaw, "text/xml");
const dishes = xmlDoc.getElementsByTagName("dish");

console.log("Antennas found: ", dishes.length)

Array.from(dishes).forEach(dish => {
	const targets = dish.getElementsByTagName("target");

		Array.from(targets).forEach(target => { 
			const floor = -160
			const ceiling = -90
			const name = target.getAttribute("name");
			const power = parseFloat (target.getAttribute("power"));
			let volume = (power - floor) / (ceiling - floor)
			

		console.log(name + " Volume: " + volume.toFixed(2));
		console.log("Found Spacecraft: " + name + " at power: " + power);
	});
	
});

}

// This is your test data (fake NASA XML)
const rawData = '<dish><target name="VOYAGER1" power="-150" /></dish>';

// This tells the computer: "Run the xmlParser using testData"
xmlParser(rawData);
