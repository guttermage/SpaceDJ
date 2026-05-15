const floor = -160;
const ceiling = -90;
const proxyUrl = 'https://space-dj.jmerkl.workers.dev/';
let currentAntennaCount = 0;

const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "triangle"
    },
    envelope: {
        attack: 0.1,  // Slight fade-in
        decay: 0.2,
        sustain: 0.5,
        release: 2    // Long fade-out so notes blend together
    }
}).toDestination();

const reverb = new Tone.Reverb(3).toDestination();
synth.connect(reverb);

async function pullDsnData() {
    const response = await fetch(proxyUrl);
    const xmlText = await response.text();
    xmlParser(xmlText);
}

// Parser
function xmlParser(xmlRaw) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlRaw, "text/xml");
    const dishes = xmlDoc.getElementsByTagName("dish");

  	currentAntennaCount = dishes.length;

    console.log("Antennas found: ", dishes.length);

    // Collects all dishes
    Array.from(dishes).forEach((dish, index) => {
        const targets = dish.querySelectorAll("target");
        Array.from(targets).forEach((target) => {
            const name = target.getAttribute("name") || "Unknown";
            const parentDish = target.closest("dish");
            const signal = parentDish.querySelector("downSignal") || parentDish.querySelector("upSignal");
            const powerAttr = signal ? signal.getAttribute("power") : target.getAttribute("power");
            const power = parseFloat(powerAttr) || -150;


            if (!isNaN(power) && power !== 0) {
                const activeFloor = -155;
                let volume = (power - activeFloor) / (ceiling - activeFloor);
                volume = Math.min(Math.max(volume, 0), 1);

                // 1. Boost volume so it's audible
                let audibleVolume = Math.min(volume * 50, 1.0);

                // Simple array of notes to cycle through
				const notes = ["A1", "C2", "D2", "E2", "G2", "A2", "C3"];
                let note = notes[index % notes.length];
                // This delays each note by 0.3 seconds per antenna
                let timeDelay = index * 0.3;

                if (power === -150) {
                    audibleVolume = 0;
                }

                console.log(`SPACECRAFT: ${name} | Raw Power: ${powerAttr} | Note: ${note} | Vol: ${audibleVolume.toFixed(2)}`);
                // Trigger with the delay
                synth.triggerAttackRelease(note, "8n", Tone.now() + 0.1 + timeDelay, audibleVolume);
            }
        });
    });
}

// LINK XML TO TONE.JS
let isLooping = false;

document.getElementById('start-btn').addEventListener('click', async () => {
    await Tone.start();
    if (Tone.context.state !== 'running') {
        await Tone.context.resume();
    }
    if (!isLooping) {
        isLooping = true;
        console.log("SpaceDJ Engaged!");
        runDJ();
    }
});

const stopBtn = document.getElementById('stop-btn');
if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        isLooping = false;
        console.log("SpaceDJ Loop Stopped.");
    });
}

async function runDJ() {
    if (!isLooping) return; // Ends loop
  	console.log("--- Refreshing DSN Data ---");
    await pullDsnData();	
  	const waitTime = (currentAntennaCount * 300);
    setTimeout(runDJ, waitTime);
}

const logBox = document.getElementById('status-log');
const oldLog = console.log;

console.log = function(...args) {
    oldLog.apply(console, args); // Keeps it in F12
    if (logBox) {
        logBox.innerHTML += `<div>> ${args.join(' ')}</div>`;
        logBox.scrollTop = logBox.scrollHeight; // Auto-scroll
    }
};
