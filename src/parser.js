//Parser Logic
const floor = -160;
const ceiling = -90;
const synth = new Tone.Synth().toDestination();
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const dsnUrl = 'https://eyes.nasa.gov/dsn/data/dsn.xml';

async function pullDsnData() {
	const target = proxyUrl + dsnUrl;
	const response = await fetch(target);
	const xmlText = await response.text();

	xmlParser(xmlText);
}

// Parser
function xmlParser(xmlRaw){

	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlRaw, "text/xml");
	const dishes = xmlDoc.getElementsByTagName("dish");

	console.log("Antennas found: ", dishes.length)
  
	// Collects all dishes
Array.from(dishes).forEach((dish, index) => {
	const targets = dish.querySelectorAll("target");
  	Array.from(targets).forEach((target, targetIndex) => { 
        const name = target.getAttribute("name") || "Unknown";

		const dish = target.closest("dish");
      	const signal = dish.querySelector("downSignal") || dish.querySelector("upSignal");
        const powerAttr = signal ? signal.getAttribute("power") : target.getAttribute("power");
		const power = parseFloat(powerAttr) || -150;
      
console.log(`Checking: ${name} | Raw Power: ${powerAttr}`);      
        if (!isNaN(power) && power !== 0) {
          	const activeFloor = -155;
            let volume = (power - activeFloor) / (ceiling - activeFloor);
            volume = Math.min(Math.max(volume, 0), 1);
            
            // 1. Boost volume so it's audible
			audibleVolume = Math.min(volume * 50, 1.0);    
          
         	// Simple array of notes to cycle through
            const notes = ["C5", "E5", "G5", "B5", "D6"];
            let note = notes[index % notes.length];
         	
          // This delays each note by 0.3 seconds per antenna
            let timeDelay = index * 0.3;

		let statusMessage = "";
        if (powerAttr === -150 || power === -150) {
          statusMessage = "[NO ACTIVE SIGNAL]";
          audibleVolume = 0;
        }
          
		console.log(`SPACECRAFT: ${name} | Note: ${note} | Vol: ${audibleVolume.toFixed(2)}`);            // Trigger with the delay
		synth.triggerAttackRelease(note, "8n", Tone.now() + 0.1 + timeDelay, audibleVolume);
    		}
    	});
	});
}// LINK XML TO TONE.JS
document.getElementById('start-btn').addEventListener('click',async()=> 
	{
		await Tone.start();
		if(Tone.context.state !== 'running'){
			await Tone.context.resume();
		}
		console.log("Audio Context State: ", Tone.context.state);
		console.log("Audio Primed. Reaching NASA Database...");
		
		await pullDsnData();
	});
