import Conditions from './weather_conditions.csv';
import { format as formatDate } from 'date-fns';

export default function domUpdate() {
  const weatherConditions = _arrayToObject(Conditions, 'code');
  const weatherIcons = _importAll(
    require.context('./icons/', false, /\.png$/i)
  );

  let tempSetting;

  createDayAndHoursElements();

  function _importAll(r) {
    // This function maps an input url to a webpacked id url
    let images = {};
    r.keys().forEach((item) => (images[item] = r(item)));
    return images; // it then returns an object with key-value pairs of the matchings
  }

  function _arrayToObject(array, key) {
    return array.reduce((obj, condition) => {
      return {
        ...obj,
        [condition[key]]: condition,
      };
    }, {});
  }

  function _generateSuggestion(id, name, region, country) {
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion');
    suggestion.setAttribute('data-locationid', id);

    const spanName = document.createElement('span');
    spanName.classList.add('name');
    spanName.textContent = name;
    suggestion.appendChild(spanName);

    const spacer1 = document.createTextNode(', ');
    suggestion.appendChild(spacer1);

    if (region) {
      const spanRegion = document.createElement('span');
      spanRegion.classList.add('region');
      spanRegion.textContent = region;
      suggestion.appendChild(spanRegion);
    }

    const spacer2 = document.createTextNode(', ');
    suggestion.appendChild(spacer2);

    if (country) {
      const spanCountry = document.createElement('span');
      spanCountry.classList.add('country');
      spanCountry.textContent = country;
      suggestion.appendChild(spanCountry);
    }

    return suggestion;
  }

  function displaySuggestions(data) {
    const suggestionsContainer = document.getElementById(
      'suggestions-container'
    );
    const submitBtn = document.getElementById('submit-location-btn');

    if (data.length === 0) {
      submitBtn.classList.remove('active');
      suggestionsContainer.style.display = 'none';
      return;
    } else {
      submitBtn.classList.add('active');
      suggestionsContainer.style.display = 'flex';
    }

    suggestionsContainer.textContent = '';

    for (const location of data) {
      const suggestion = _generateSuggestion(
        location.url,
        location.name,
        location.region,
        location.country
      );
      suggestionsContainer.appendChild(suggestion);
    }
  }

  function displayWeatherData(data) {
    document.dispatchEvent(new Event('showData'));

    displayDayPanes(data);
    displayHourBoxes(data);

    // Sending this event tells slider.js to update its DOM references
    const hoursBanner = document.getElementById('hours-banner');
    hoursBanner.dispatchEvent(new Event('weatherUpdate'));
  }

  function displayDayPanes(data) {
    document.getElementById('location').value = data.location.name;
    document.getElementById(
      'your-weather-header'
    ).innerHTML = `The weather in <span>${data.location.name}</span> is going to be...`;
    const dayPaneContainer = document.getElementById('day-pane-container');
    dayPaneContainer.textContent = '';

    for (let [dayIndex, day] of data.forecast.forecastday.entries()) {
      const conditionCode = day.day.condition.code;

      const dayPane = document.createElement('div');
      dayPane.classList.add('day-pane');
      dayPane.setAttribute('data-dayid', dayIndex);

      const condition = document.createElement('h3');
      condition.classList.add('condition');
      condition.textContent = weatherConditions[conditionCode].condition;
      if (dayIndex === 2) {
        condition.textContent = 'Just stay inside...';
      }

      const date = document.createElement('h4');
      date.classList.add('date');
      const dateEpoch = Number(day.date_epoch);

      date.textContent = formatDate(new Date(dateEpoch * 1000), 'MMM d, yyyy');

      const image = document.createElement('div');
      image.classList.add('image');

      // For the image, first we look up the name of the icon from its weather code,
      // then we use that to look up its webpack url
      const imageUrl =
        weatherIcons[`./${weatherConditions[conditionCode].icon}`];
      image.style.backgroundImage = `url(${imageUrl})`;

      const infoBox = document.createElement('div');
      infoBox.classList.add('info-box');

      const highT = document.createElement('p');
      highT.className = 'high-T temptext';
      highT.textContent = 'High: ';
      const highTSpan = document.createElement('span');
      highTSpan.textContent = tempFtoSelectedTemp(day.day.maxtemp_f);
      highT.appendChild(highTSpan);

      const wind = document.createElement('p');
      wind.classList.add('wind');
      wind.textContent = 'Wind: ';
      const windSpan = document.createElement('span');
      windSpan.textContent = `${day.day.maxwind_mph}mph`;
      wind.appendChild(windSpan);

      const lowT = document.createElement('p');
      lowT.className = 'low-T temptext';
      lowT.textContent = 'Low: ';
      const lowTSpan = document.createElement('span');
      lowTSpan.textContent = tempFtoSelectedTemp(day.day.mintemp_f);
      lowT.appendChild(lowTSpan);

      const humidity = document.createElement('p');
      humidity.classList.add('humidity');
      humidity.textContent = 'Humidity: ';
      const humiditySpan = document.createElement('span');
      humiditySpan.textContent = `${day.day.avghumidity}%`;
      humidity.appendChild(humiditySpan);

      const uvIndex = document.createElement('p');
      uvIndex.classList.add('uv-index');
      uvIndex.textContent = 'UV index: ';
      const uvIndexSpan = document.createElement('span');
      uvIndexSpan.textContent = day.day.uv;
      uvIndex.appendChild(uvIndexSpan);

      const percipitation = document.createElement('p');
      percipitation.classList.add('percipitation');
      const percipitationSpan = document.createElement('span');

      if (day.day.daily_chance_of_rain >= day.day.daily_chance_of_snow) {
        percipitation.textContent = 'Rain: ';
        percipitationSpan.textContent = `${day.day.daily_chance_of_rain}%`;
      } else {
        percipitation.textContent = 'Snow: ';
        percipitationSpan.textContent = `${day.day.daily_chance_of_snow}%`;
      }

      percipitation.appendChild(percipitationSpan);

      infoBox.append(highT, wind, lowT, humidity, uvIndex, percipitation);
      dayPane.append(condition, date, image, infoBox);
      dayPaneContainer.appendChild(dayPane);
    }
  }

  function displayHourBoxes(data) {
    const hoursBanner = document.getElementById('hours-banner');
    const hoursMovingBox = document.getElementById('hours-moving-box');

    hoursBanner.style.display = 'flex';
    hoursMovingBox.textContent = '';

    for (let [dayIndex, day] of data.forecast.forecastday.entries()) {
      const dayBox = document.createElement('div');
      dayBox.setAttribute('data-dayid', dayIndex);
      dayBox.className = 'day-box fadeobject';

      for (let [hourIndex, hour] of day.hour.entries()) {
        const hourBox = document.createElement('div');
        hourBox.className = 'hour-box fadeobject';
        // hourBox.setAttribute('data-hourid', hourIndex);

        const temp = document.createElement('p');
        temp.className = 'temptext';
        temp.textContent = tempFtoSelectedTemp(hour.temp_f);

        const image = document.createElement('img');
        let imageUrl;
        if (hourIndex >= 5 && hourIndex <= 19) {
          // If it is daytime
          imageUrl =
            weatherIcons[
              `./${weatherConditions[hour.condition.code].small_icon_day}`
            ];
        } else {
          imageUrl =
            weatherIcons[
              `./${weatherConditions[hour.condition.code].small_icon_night}`
            ];
        }
        // image.style.backgroundImage = `url(${imageUrl})`;
        image.src = imageUrl;

        const time = document.createElement('p');

        // time.textContent = formatDate(
        //   new Date(hour.time_epoch * 1000),
        //   'h aaa'
        // );
        time.textContent = _formatHourString(hourIndex);

        hourBox.append(temp, image, time);
        dayBox.appendChild(hourBox);
      }

      hoursMovingBox.appendChild(dayBox);

      const separator = document.createElement('div');
      separator.className = 'hour-separator fadeobject';

      hoursMovingBox.appendChild(separator);
    }

    // We remove the last node, which is an unnecessary separator
    hoursMovingBox.removeChild(hoursMovingBox.lastElementChild);
  }

  function _formatHourString(h) {
    // get h from 0-23
    if (h === 0) {
      return 'Midnight';
    } else if (h >= 1 && h <= 11) {
      return `${h}am`;
    } else if (h === 12) {
      return 'Noon';
    } else if (h >= 13 && h <= 23) {
      return `${h - 12}pm`;
    } else {
      return 'error';
    }
  }

  function weatherDataFail(e) {
    document.getElementById('your-weather-header').innerHTML =
      "This location's weather failed to load :(";
  }

  function suggestionDataFail(e) {
    const suggestionsContainer = document.getElementById(
      'suggestions-container'
    );

    suggestionsContainer.textContent = '';
    suggestionsContainer.style.display = 'none';
  }

  function createDayAndHoursElements() {
    const dataContainer = document.createElement('div');
    dataContainer.id = 'data-container';

    const weatherHeader = document.createElement('h2');
    weatherHeader.id = 'your-weather-header';
    const dayPaneContainer = document.createElement('div');
    dayPaneContainer.id = 'day-pane-container';
    const hoursBanner = document.createElement('div');
    hoursBanner.id = 'hours-banner';
    const hoursMovingBox = document.createElement('div');
    hoursMovingBox.id = 'hours-moving-box';

    hoursBanner.appendChild(hoursMovingBox);

    const contentContainer = document.getElementById('content-container');
    dataContainer.append(weatherHeader, dayPaneContainer, hoursBanner);

    contentContainer.appendChild(dataContainer);

    // Create the loading container
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loading-container';
    loadingContainer.textContent = 'Loading...';

    contentContainer.appendChild(loadingContainer);
  }

  // Set the units of temperatures on first display
  function tempFtoSelectedTemp(f) {
    const tempToggle = document.getElementById('temp-toggle');

    if (!tempToggle.checked) {
      // If F is selected
      return `${f}°F`;
    } else {
      // if C is selected
      const temp = (((Number(f) - 32) * 5) / 9).toFixed(1);
      return `${temp}°C`;
    }
  }

  const tempToggle = document.getElementById('temp-toggle');
  tempToggle.addEventListener('click', updateTempUnits);

  // Convert already displayed temperatures to the other unit
  function updateTempUnits() {
    const tempElements = document.querySelectorAll('.temptext');

    tempElements.forEach((element) => {
      const [_, prefix, temp] =
        element.textContent.match(/^([\D ]*)(\d*.?\d+)/);

      if (tempToggle.checked) {
        const tempInC = (((Number(temp) - 32) * 5) / 9).toFixed(1);
        element.textContent = `${prefix}${tempInC}°C`;
      } else {
        const tempInF = (Number(temp) * (9 / 5) + 32).toFixed(1);
        element.textContent = `${prefix}${tempInF}°F`;
      }
    });
  }

  function displayLoadingScreen() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.style.display = 'flex';
  }

  function hideLoadingScreen() {
    const loadingContainer = document.getElementById('loading-container');
    loadingContainer.style.display = 'none';
  }

  function displayDataContainer() {
    const dataContainer = document.getElementById('data-container');
    dataContainer.style.display = 'flex';
  }

  function hideDataContainer() {
    const dataContainer = document.getElementById('data-container');
    dataContainer.style.display = 'none';
  }

  document.addEventListener('showLoading', () => {
    displayLoadingScreen();
  });

  document.addEventListener('hideLoading', () => {
    hideLoadingScreen();
  });

  document.addEventListener('showData', () => {
    displayDataContainer();
  });

  document.addEventListener('hideData', () => {
    hideDataContainer();
  });

  return {
    displaySuggestions,
    displayWeatherData,
    weatherDataFail,
    suggestionDataFail,
  };
}
