
const API = "3e0609e4a08345d564f57f77ce99c132";

async function getAQI() {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    try {
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API}`);
        const geoData = await geoResponse.json();
        
        if (geoData.length === 0) {
            alert("City not found!");
            return;
        }

        const { lat, lon } = geoData[0];
        const aqiResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API}`);
        const aqiData = await aqiResponse.json();
        displayAQI(aqiData, city);
        
    } catch (error) {
        console.error("Error fetching AQI data:", error);
        alert("Failed to fetch AQI data.");
    }
}

function displayAQI(data, city) {
    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    let aqiCategory = getAQICategory(aqi);
    document.getElementById("aqiValue").innerText = `AQI: ${aqiCategory}`;

    const pollutants = {
        pm2_5: "PM2.5",
        pm10: "PM10",
        co: "CO",
        no2: "NO₂",
        so2: "SO₂",
        o3: "O₃"
    };

    for (const [key, value] of Object.entries(pollutants)) {
        if (components[key] !== undefined) {
            document.querySelector(`.pollutant-box:nth-child(${Object.keys(pollutants).indexOf(key) + 1})`).innerText = `${value}: ${components[key]} µg/m³`;
        }
    }

    updateHealthRecommendations(aqiCategory);
}

function getAQICategory(aqi) {
    if (aqi <= 2) return "Good";
    else if (aqi <= 3) return "Moderate";
    else if (aqi <= 4) return "Unhealthy for Sensitive Groups";
    else if (aqi <= 5) return "Unhealthy";
    else if (aqi <= 6) return "Very Unhealthy";
    else return "Hazardous";
}

function updateHealthRecommendations(aqiCategory) {
    const recommendations = document.getElementById("recommendations");
    let aqiMessage = "";

    switch (aqiCategory) {
        case "Good":
            aqiMessage = "<p>The air quality is good today. You can go outside and enjoy the fresh air.</p>";
            break;
        case "Moderate":
            aqiMessage = "<p>The air quality is moderate. It's okay to go outside, but if you're sensitive to pollutants, consider staying indoors.</p>";
            break;
        case "Unhealthy for Sensitive Groups":
            aqiMessage = "<p>The air quality is unhealthy for sensitive groups. Avoid outdoor activities if you have respiratory issues or wear a mask if going outside.</p>";
            break;
        case "Unhealthy":
            aqiMessage = "<p>The air quality is unhealthy. It's better to stay indoors. If you need to go out, wear a mask and avoid strenuous activity.</p>";
            break;
        case "Very Unhealthy":
            aqiMessage = "<p>The air quality is very unhealthy. Stay indoors and avoid going outside. If you must go out, wear a high-quality mask (N95).</p>";
            break;
        case "Hazardous":
            aqiMessage = "<p>The air quality is hazardous. Do not go outside unless absolutely necessary. Wear a high-quality mask if you must go out.</p>";
            break;
        default:
            aqiMessage = "<p>Unable to determine air quality. Please try again.</p>";
    }

    recommendations.innerHTML = aqiMessage;
}

function showPersonalRecommendations() {
    const box = document.getElementById("personalDetails");
    if (box) {
        box.style.display = "block";
        box.scrollIntoView({ behavior: "smooth" });
    }
}

async function submitDetails() {
    const name = document.getElementById("name").value;
    const city = document.getElementById("cityInput").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const diseases = Array.from(document.querySelectorAll('input[name="disease"]:checked')).map(el => el.value);

    if (!city || !name || !phoneNumber || !age || !gender || diseases.length === 0) {
        alert("Please fill out all fields.");
        return;
    }

    const userData = {
        city,
        name,
        phoneNumber,
        age: parseInt(age, 10),
        gender,
        diseases
    };

    try {
        const response = await fetch('https://localhost:3000/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            alert(`Failed to submit details: ${errorData.error || 'Unknown error'}`);
            return;
        }

        const responseData = await response.json();
        alert(responseData.message);
        displayHealthRecommendationsBasedOnCondition(userData, city);
        
    } catch (error) {
        console.error("Error submitting details:", error);
        alert("Check your network connection");
    }
}

function displayHealthRecommendationsBasedOnCondition(userData, city) {
    const { age, diseases } = userData;
    let recommendations = `<h3>Health Recommendations for ${userData.name} in ${city}:</h3>`;

    if (age < 18) {
        recommendations += `<p>As a child, limit outdoor activities when AQI is poor. Stay indoors when air quality worsens.</p>`;
    } else if (age > 65) {
        recommendations += `<p>As a senior citizen, avoid outdoor activities on high AQI days. Keep windows closed and use air purifiers indoors.</p>`;
    }

    if (diseases.includes("none")) {
        recommendations += `<p>You do not have any pre-existing diseases. However, always stay aware of the AQI and take precautions if the air quality worsens.</p>`;
    }
    if (diseases.includes("asthma")) {
        recommendations += `<p>As you have asthma, avoid outdoor activities when AQI exceeds 100. Always carry your inhaler with you and avoid pollution.</p>`;
    }
    if (diseases.includes("copd")) {
        recommendations += `<p>As you have COPD, avoid exposure to high pollution levels. Consider wearing a mask and limiting physical exertion during high pollution days.</p>`;
    }
    if (diseases.includes("heart_disease")) {
        recommendations += `<p>For individuals with heart disease, high pollution levels can trigger symptoms. Avoid exertion and try to stay indoors on high AQI days.</p>`;
    }

    document.getElementById("recommendations").innerHTML += recommendations;
}
