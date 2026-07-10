const fs = require('fs');

const rawData = `
| **Andhra Pradesh** | Guntur, Kurnool, Anantapur, Kadapa (YSR Kadapa), Nandyal, Ongole, Tirupati, Eluru, Kakinada, Rajahmundry       |
| **Telangana**      | Adilabad, Nizamabad, Karimnagar, Warangal, Khammam, Mahabubnagar, Siddipet, Suryapet, Jagtial, Nalgonda        |
| **Maharashtra**    | Lasalgaon, Pune, Nashik, Nagpur, Amravati, Akola, Jalgaon, Solapur, Ahmednagar, Latur                          |
| **Karnataka**      | Hubballi, Mysuru, Belagavi, Ballari, Davanagere, Shivamogga, Tumakuru, Raichur, Vijayapura, Kalaburagi         |
| **Madhya Pradesh** | Indore, Ujjain, Mandsaur, Neemuch, Dewas, Ratlam, Sehore, Bhopal, Hoshangabad (Narmadapuram), Vidisha          |
| **Uttar Pradesh**  | Agra, Lucknow, Kanpur, Bareilly, Gorakhpur, Varanasi, Prayagraj, Meerut, Shahjahanpur, Sitapur                 |
| **Punjab**         | Ludhiana, Amritsar, Jalandhar, Patiala, Bathinda, Moga, Sangrur, Barnala, Firozpur, Abohar                     |
| **Haryana**        | Karnal, Kurukshetra, Ambala, Hisar, Sirsa, Rohtak, Kaithal, Fatehabad, Jind, Yamunanagar                       |
| **Rajasthan**      | Kota, Jaipur, Sri Ganganagar, Hanumangarh, Alwar, Bharatpur, Bikaner, Sikar, Jodhpur, Udaipur                  |
| **Gujarat**        | Unjha, Rajkot, Gondal, Junagadh, Dahod, Rajpipla, Himmatnagar, Jamnagar, Bhavnagar, Mehsana                    |
| **Bihar**          | Gulabbagh, Muzaffarpur, Begusarai, Gaya, Katihar, Forbesganj, Sitamarhi, Aurangabad, Arrah, Bhagalpur          |
| **Odisha**         | Sambalpur, Bargarh, Balangir, Cuttack, Bhawanipatna, Rayagada, Jeypore, Berhampur, Dhenkanal, Keonjhar         |
| **Tamil Nadu**     | Salem, Dindigul, Erode, Coimbatore, Madurai, Tiruchirappalli, Villupuram, Thanjavur, Virudhunagar, Tirunelveli |
| **Chhattisgarh**   | Raipur, Dhamtari, Jagdalpur, Rajnandgaon, Durg, Bilaspur, Mahasamund, Kanker, Korba, Saraipali                 |
| **Jharkhand**      | Ranchi (Pandra), Jamshedpur, Bokaro, Dumka, Hazaribagh, Daltonganj, Giridih, Chaibasa, Gumla, Lohardaga        |
| **West Bengal**    | Malda, Bardhaman, Siliguri, Kharagpur, Bankura, Midnapore, Cooch Behar, Krishnanagar, Balurghat, Purulia       |
| **Assam**          | Guwahati, Jorhat, Nagaon, Dibrugarh, Silchar, Tezpur, Bongaigaon, Barpeta, Kharupetia, Gauripur                |
`;

const stateCenters = {
  'Andhra Pradesh': {lat: 15.9, lng: 79.7},
  'Telangana': {lat: 17.8, lng: 79.0},
  'Maharashtra': {lat: 19.7, lng: 75.7},
  'Karnataka': {lat: 15.3, lng: 75.7},
  'Madhya Pradesh': {lat: 23.4, lng: 77.9},
  'Uttar Pradesh': {lat: 26.8, lng: 80.9},
  'Punjab': {lat: 31.1, lng: 75.3},
  'Haryana': {lat: 29.0, lng: 76.0},
  'Rajasthan': {lat: 27.0, lng: 74.2},
  'Gujarat': {lat: 22.2, lng: 71.1},
  'Bihar': {lat: 25.0, lng: 85.3},
  'Odisha': {lat: 20.9, lng: 85.0},
  'Tamil Nadu': {lat: 11.1, lng: 78.6},
  'Chhattisgarh': {lat: 21.2, lng: 81.8},
  'Jharkhand': {lat: 23.6, lng: 85.3},
  'West Bengal': {lat: 22.9, lng: 87.8},
  'Assam': {lat: 26.2, lng: 92.9}
};

const lines = rawData.trim().split('\n');
const newCenters = [];

for (const line of lines) {
  if (!line.includes('| **')) continue;
  const parts = line.split('|');
  if (parts.length < 3) continue;
  
  const stateMatch = parts[1].match(/\*\*(.*?)\*\*/);
  if (!stateMatch) continue;
  const state = stateMatch[1].trim();
  
  const cities = parts[2].split(',').map(c => c.trim()).filter(c => c.length > 0);
  const sc = stateCenters[state] || {lat: 20, lng: 78};
  
  cities.forEach((city, index) => {
    // Generate slight jitter so they don't overlap completely
    const latOffset = (Math.random() - 0.5) * 4; // +/- 2 degrees
    const lngOffset = (Math.random() - 0.5) * 4; // +/- 2 degrees
    const lat = Number((sc.lat + latOffset).toFixed(4));
    const lng = Number((sc.lng + lngOffset).toFixed(4));
    
    // sample 3 random crops
    const allCrops = ["Rice", "Wheat", "Maize", "Cotton", "Soybean", "Groundnut", "Turmeric", "Sugarcane", "Jowar", "Mustard"];
    const shuffled = allCrops.sort(() => 0.5 - Math.random());
    const selectedCrops = shuffled.slice(0, 3 + Math.floor(Math.random() * 3));
    
    newCenters.push(`    ['${city.replace(/\(.*?\)/g, '').trim()} Mandi Center', 'Main Market Yard, ${city.replace(/\(.*?\)/g, '').trim()}', '${city.replace(/\(.*?\)/g, '').trim()}', '${state}', ${lat}, ${lng}, ${20 + Math.floor(Math.random() * 30)}, '08:00-16:00', '${JSON.stringify(selectedCrops)}', ${2 + Math.floor(Math.random()*5)}, ${5 + Math.floor(Math.random()*5)}],`);
  });
}

const seedPath = './seed.js';
let seedCode = fs.readFileSync(seedPath, 'utf8');

// Find the centers array
const insertMarker = "const centers = [\n";
const insertionIndex = seedCode.indexOf(insertMarker) + insertMarker.length;

if (seedCode.indexOf(insertMarker) > -1) {
  const newSeedCode = seedCode.slice(0, insertionIndex) + newCenters.join('\n') + '\n' + seedCode.slice(insertionIndex);
  fs.writeFileSync(seedPath, newSeedCode);
  console.log(`Added ${newCenters.length} new mandis to seed.js!`);
} else {
  console.error('Could not find centers array in seed.js');
}
