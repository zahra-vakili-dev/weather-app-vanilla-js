// DOM Elements
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const cityNameEl = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const windSpeedEl = document.getElementById("windSpeed");
const weatherIconEl = document.getElementById("weatherIcon");
const feedbackEl = document.getElementById("feedback");
const loadingEl = document.getElementById("loading");

// Config for weather styles
const weatherStyles = {
  sunny: "border-yellow-300 shadow-yellow-200 bg-yellow-50",
  cloudy: "border-gray-300 shadow-gray-200 bg-gray-100",
  rain: "border-blue-300 shadow-blue-200 bg-blue-50",
  snow: "border-sky-200 shadow-sky-100 bg-sky-50",
  storm: "border-indigo-400 shadow-indigo-300 bg-indigo-50",
  default: "border-gray-200 shadow-gray-200 bg-white"
};
const allWeatherStyleClasses = Object.values(weatherStyles).join(" ");

// Events
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) handleSearch(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) handleSearch(lastCity);
});

// Main function
async function handleSearch(city) {
  feedbackEl.classList.add("hidden");
  weatherCard.classList.add("hidden");
  loadingEl.classList.remove("hidden");

  try {
    const { lat, lon } = await getCoordinates(city);
    const weather = await getWeather(lat, lon);
    showWeather(city, weather);
  } catch (err) {
    loadingEl.classList.add("hidden");
    feedbackEl.textContent = err.message;
    feedbackEl.classList.remove("hidden");
  }
}

// Fetch APIs
async function getCoordinates(city) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
  const data = await res.json();
  if (!data.length) throw new Error("City not found!");
  if (!["city", "administrative"].includes(data[0].type)) throw new Error("Please enter a valid city name!");
  return { lat: data[0].lat, lon: data[0].lon };
}

async function getWeather(lat, lon) {
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  const data = await res.json();
  return data.current_weather;
}

// UI Functions
function showWeather(city, weather) {
  loadingEl.classList.add("hidden");
  weatherCard.classList.remove("hidden");
  weatherCard.style.opacity = 0; 
  setTimeout(() => weatherCard.style.opacity = 1, 50); 

  cityNameEl.textContent = city;
  temperatureEl.textContent = `${weather.temperature}°C`;
  windSpeedEl.textContent = `Wind: ${weather.windspeed} km/h`;
  weatherIconEl.textContent = getWeatherEmoji(weather.weathercode);
  applyWeatherStyle(weather.weathercode);
  localStorage.setItem("lastCity", city);
}

// Apply styles based on weather
function applyWeatherStyle(code) {
  const type = getWeatherType(code);
  weatherCard.classList.remove(...allWeatherStyleClasses.split(" "));
  weatherCard.classList.add("rounded-xl", "p-4", "text-center", "border", ...weatherStyles[type].split(" "));
}

// Helpers
function getWeatherType(code) {
  if (code === 0) return "sunny";
  if ([1,2,3].includes(code)) return "cloudy";
  if ([61,63,65].includes(code)) return "rain";
  if ([71,73,75].includes(code)) return "snow";
  if (code === 95) return "storm";
  return "default";
}

function getWeatherEmoji(code) {
  if (code === 0) return "☀️";
  if ([1,2,3].includes(code)) return "☁️";
  if ([61,63,65].includes(code)) return "🌧️";
  if ([71,73,75].includes(code)) return "❄️";
  if (code === 95) return "⛈️";
  return "🌡️";
}
