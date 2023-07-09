import './basestyle.css';
import './style.css';
import domUpdate from './domUpdate';
import asyncFunctions from './async';
import Slider from './slider';

function app() {
  const dom = domUpdate();
  const asyncs = asyncFunctions();
  Slider();

  // This requests autocomplete suggestions from the API as the user types
  const locationInput = document.getElementById('location');
  const suggestionsContainer = document.getElementById('suggestions-container');
  locationInput.addEventListener('input', (e) => {
    if (!e.target.value) {
      suggestionsContainer.style.display = 'none';
      return;
    }
    asyncs
      .getAutocomplete(e.target.value)
      .then(dom.displaySuggestions, dom.suggestionDataFail);
  });

  // This loads up the weather data from the location that the user selects
  suggestionsContainer.addEventListener('click', (e) => {
    const locationId = e.target.dataset.locationid;
    suggestionsContainer.style.display = 'none';
    asyncs
      .getWeatherData(locationId)
      .then(dom.displayWeatherData, dom.weatherDataFail);
  });

  // The Go button loads the first location suggested by the API if the user hits it or presses 'enter'
  const submitBtn = document.getElementById('submit-location-btn');
  submitBtn.addEventListener('click', handleGoButton);
  locationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGoButton();
  });

  function handleGoButton() {
    if (!submitBtn.className.includes('active')) return;
    const locationId = suggestionsContainer.firstChild.dataset.locationid;
    suggestionsContainer.style.display = 'none';
    asyncs
      .getWeatherData(locationId)
      .then(dom.displayWeatherData, dom.weatherDataFail);
  }
}

app();
