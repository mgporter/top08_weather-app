export default function asyncFunctions() {
  async function getWeatherData(query) {
    let response;
    let data;

    try {
      document.dispatchEvent(new Event('hideData'));
      document.dispatchEvent(new Event('showLoading'));
      response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=b5e6e8e4c72e49ba950212623230307&q=${query}&days=3&alerts=no`
      );
      data = await response.json();
      document.dispatchEvent(new Event('hideLoading'));
    } catch (e) {
      console.log(e);
      document.dispatchEvent(new Event('hideLoading'));
    }

    return data;
  }

  async function getAutocomplete(query) {
    let response;
    let data;

    try {
      response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=b5e6e8e4c72e49ba950212623230307&q=${query}`
      );
      data = await response.json();
    } catch (e) {
      console.log(e);
    }

    return data;
  }

  return {
    getWeatherData,
    getAutocomplete,
  };
}
