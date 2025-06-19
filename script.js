// Date and Time Display
function displayDateTime() {
    const now = new Date();
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const dateTimeStr = now.toLocaleDateString('en-IN', options);
    document.getElementById("dateTime").textContent = dateTimeStr;
}

setInterval(displayDateTime, 1000);
displayDateTime();

// Sun Position Calculator
async function fetchSunTimes() {
    try {
        const response = await fetch('https://api.sunrise-sunset.org/json?lat=23.332&lng=86.365&formatted=0');
        const data = await response.json();
        
        if (data.status === "OK") {
            const sunriseUTC = new Date(data.results.sunrise);
            const sunsetUTC = new Date(data.results.sunset);
            
            // Convert to IST (UTC+5:30)
            const sunrise = new Date(sunriseUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const sunset = new Date(sunsetUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            
            // Format times
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            document.getElementById('sunrise-time').textContent = sunrise.toLocaleTimeString('en-IN', timeOptions);
            document.getElementById('sunset-time').textContent = sunset.toLocaleTimeString('en-IN', timeOptions);
            
            updateSunPosition(sunrise, sunset);
            setInterval(() => updateSunPosition(sunrise, sunset), 60000); // Update every minute
        }
    } catch (error) {
        console.error("Error fetching sun data:", error);
        document.getElementById('sunrise-time').textContent = "06:00 AM";
        document.getElementById('sunset-time').textContent = "06:00 PM";
    }
}

function updateSunPosition(sunrise, sunset) {
    const now = new Date();
    const nowTime = now.getTime();
    const sunriseTime = sunrise.getTime();
    const sunsetTime = sunset.getTime();
    
    // If it's nighttime, hide the sun
    if (nowTime < sunriseTime || nowTime > sunsetTime) {
        document.getElementById('sun').style.opacity = '0';
        return;
    }
    
    document.getElementById('sun').style.opacity = '1';
    
    const totalDaylight = sunsetTime - sunriseTime;
    const elapsedTime = nowTime - sunriseTime;
    
    let progress = elapsedTime / totalDaylight;
    progress = Math.max(0, Math.min(progress, 1)); // Clamp between 0 and 1
    
    const radius = 40;
    const centerX = 50; // Percentage
    const centerY = 50; // Percentage
    
    // Calculate position on semicircle (0 at sunrise, π at sunset)
    const angle = progress * Math.PI;
    const sunX = centerX + radius * Math.cos(angle);
    const sunY = centerY - radius * Math.sin(angle);
    
    const sun = document.getElementById('sun');
    sun.style.left = `calc(${sunX}% - 12.5px)`;
    sun.style.top = `calc(${sunY}% - 12.5px)`;
    
    // Change sun color based on time of day
    if (progress < 0.25 || progress > 0.75) {
        sun.style.background = '#ff9900'; // Orange at sunrise/sunset
        sun.style.boxShadow = '0 0 30px #ff9900';
    } else {
        sun.style.background = '#ffcc00'; // Yellow at midday
        sun.style.boxShadow = '0 0 40px #ffcc00';
    }
}

// Moon Phase Calculator
function calculateMoonPhase(date) {
    const referenceDate = new Date('2000-01-06T18:14:00Z'); // Reference new moon date
    const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000; // Lunar cycle in milliseconds

    const diff = date - referenceDate;
    const phase = (diff % lunarCycle) / lunarCycle; // Normalize phase (0 to 1)

    const phases = [
        { icon: '🌑', name: 'New Moon', min: 0.00, max: 0.02 },
        { icon: '🌒', name: 'Waxing Crescent (Early)', min: 0.02, max: 0.07 },
        { icon: '🌒', name: 'Waxing Crescent (Mid)', min: 0.07, max: 0.125 },
        { icon: '🌒', name: 'Waxing Crescent (Late)', min: 0.125, max: 0.175 },
        { icon: '🌓', name: 'First Quarter', min: 0.175, max: 0.25 },
        { icon: '🌔', name: 'Waxing Gibbous (Early)', min: 0.25, max: 0.325 },
        { icon: '🌔', name: 'Waxing Gibbous (Mid)', min: 0.325, max: 0.375 },
        { icon: '🌔', name: 'Waxing Gibbous (Late)', min: 0.375, max: 0.425 },
        { icon: '🌕', name: 'Full Moon', min: 0.425, max: 0.52 },
        { icon: '🌖', name: 'Waning Gibbous (Early)', min: 0.52, max: 0.575 },
        { icon: '🌖', name: 'Waning Gibbous (Mid)', min: 0.575, max: 0.625 },
        { icon: '🌖', name: 'Waning Gibbous (Late)', min: 0.625, max: 0.675 },
        { icon: '🌗', name: 'Last Quarter', min: 0.675, max: 0.75 },
        { icon: '🌘', name: 'Waning Crescent (Early)', min: 0.75, max: 0.825 },
        { icon: '🌘', name: 'Waning Crescent (Mid)', min: 0.825, max: 0.875 },
        { icon: '🌘', name: 'Waning Crescent (Late)', min: 0.875, max: 0.925 },
        { icon: '🌑', name: 'New Moon', min: 0.925, max: 1.00 }
    ];
    
    const currentPhase = phases.find(p => phase >= p.min && phase < p.max);
    return currentPhase || {icon: '🌑', name: 'New Moon'};
}

function updateMoonPhase() {
    const date = new Date();
    const moonData = calculateMoonPhase(date);

    document.getElementById('moon-phase-icon').textContent = moonData.icon;
    document.getElementById('moon-phase-details').textContent = moonData.name;
}

// Wind Data
async function fetchWindData() {
    try {
        const apiKey = "ee67b3fc33053ea53a1bd9a0b2181327"; // Replace with your API key
        const lat = 23.332;  // Latitude for Purulia, WB
        const lon = 86.365;  // Longitude for Purulia, WB
        
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        if (data.wind) {
            const windSpeed = data.wind.speed;
            const windDirection = data.wind.deg || 0;
            
            // Convert m/s to km/h
            const windSpeedKmh = data.wind.speed;
            
            document.getElementById("wind-speed").textContent = `${windSpeedKmh} km/h`;
            
            // Convert degrees to compass direction
            const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                              'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
            const index = Math.round(windDirection / 22.5) % 16;
            const compassDir = directions[index];
            
            document.getElementById("wind-direction").textContent = `${compassDir} ${Math.round(windDirection)}°`;
            
            // Rotate needle (subtract 180 because our needle points south by default)
            document.getElementById("needle").style.transform = `translate(-50%, -100%) rotate(${windDirection - 180}deg)`;
        }
    } catch (error) {
        console.error("Error fetching wind data:", error);
        document.getElementById("wind-speed").textContent = "-- km/h";
        document.getElementById("wind-direction").textContent = "N 0°";
    }
}

// Temperature Simulation (replace with real data)
function simulateTemperature() {
    const now = new Date();
    const hours = now.getHours();
    
    // Simulate temperature based on time of day
    let temp;
    if (hours >= 5 && hours < 12) {
        // Morning - rising temperature
        temp = 20 + (hours - 5) * 1.5;
    } else if (hours >= 12 && hours < 16) {
        // Afternoon - peak temperature
        temp = 30 + (hours - 12) * 0.5;
    } else if (hours >= 16 && hours < 20) {
        // Evening - cooling down
        temp = 32 - (hours - 16) * 1;
    } else {
        // Night - cooler
        temp = 20 - (hours / 4);
    }
    
    // Add some random variation
    temp += Math.random() * 2 - 1;
    temp = Math.round(temp * 10) / 10;
    
    // Update display
    document.querySelector('.temp-value').innerHTML = `${temp}<span>°C</span>`;
    
    // Update thermometer
    const thermometer = document.querySelector('.mercury');
    const height = ((temp + 10) / 50) * 100; // Scale -10°C to 40°C to 0-100%
    thermometer.style.height = `${height}%`;
    
    // Update thermometer color
    if (temp < 10) {
        thermometer.style.background = '#42a5f5'; // Cold blue
    } else if (temp < 25) {
        thermometer.style.background = '#4caf50'; // Pleasant green
    } else if (temp < 35) {
        thermometer.style.background = '#ff9800'; // Warm orange
    } else {
        thermometer.style.background = '#f44336'; // Hot red
    }
}

// Initialize all functions
window.onload = function() {
    fetchSunTimes();
    updateMoonPhase();
    fetchWindData();
    simulateTemperature();
    
    // Update wind data every 5 minutes
    setInterval(fetchWindData, 300000);
    
    // Update temperature every minute
    setInterval(simulateTemperature, 60000);
};


const METEO_API_KEY = "csd90y218z0ngv0q2sb867m0ad4on4q9tddwpukm";
const PURULIA_PLACE_ID = "puruliya"; // Confirm exact place_id in Meteosource docs

async function fetchMeteoRainfall() {
    const url = `https://www.meteosource.com/api/v1/free/point?place_id=${PURULIA_PLACE_ID}&sections=current,hourly,daily&language=en&units=metric&key=${METEO_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Meteosource API Error:", error);
        return null;
    }
}
// Function to update rain display
function updateRainDisplay(rainfallMM) {
    const rainCard = document.querySelector('.metric-card.rain-card');
    const intensityLabel = document.getElementById('rain-intensity-label');
    
    // Clear previous intensity classes
    rainCard.classList.remove(
        'rain-intensity-light', 
        'rain-intensity-medium', 
        'rain-intensity-heavy'
    );
    
    // Update values and styles based on intensity
    if (rainfallMM === 0) {
        document.getElementById('current-rainfall').textContent = "0 mm";
        intensityLabel.textContent = "No Rain";
        intensityLabel.style.color = "#888";
        return;
    }
    
    document.getElementById('current-rainfall').textContent = `${rainfallMM.toFixed(1)} mm`;
    
    if (rainfallMM < 2.5) {
        rainCard.classList.add('rain-intensity-light');
        intensityLabel.textContent = "Light Rain";
    } 
    else if (rainfallMM < 7.5) {
        rainCard.classList.add('rain-intensity-medium');
        intensityLabel.textContent = "Moderate Rain";
    } 
    else {
        rainCard.classList.add('rain-intensity-heavy');
        intensityLabel.textContent = "Heavy Rain";
    }
}

// Example API integration with Meteosource
async function fetchRainData() {
    try {
        const response = await fetch(
            `https://www.meteosource.com/api/v1/free/point?place_id=puruliya&sections=current&key=csd90y218z0ngv0q2sb867m0ad4on4q9tddwpukm`
        );
        const data = await response.json();
        
        // Get current rainfall in mm
        const rainfallMM = data.current.precipitation.total || 0;
        updateRainDisplay(rainfallMM);
        
    } catch (error) {
        console.error("Error fetching rain data:", error);
        document.getElementById('current-rainfall').textContent = "-- mm";
        document.getElementById('rain-intensity-label').textContent = "Data Unavailable";
    }
}

// Initialize and update every 15 minutes
document.addEventListener('DOMContentLoaded', () => {
    fetchRainData();
    setInterval(fetchRainData, 900000); // 15 minutes
});