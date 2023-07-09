# top08_weather-app

The Odin Project Weather app project from https://www.theodinproject.com/lessons/node-path-javascript-weather-app

Concepts used:

1. Uses asynchronous functions to retreive data from an API. Fires off custom events to inform the DOM module to update the view based on program state (data loading, data retrieval, change of display units, etc).

2. Implements autocomplete functionality for locations based on API queries.

3. Custom built slider displays hourly weather data. Elements in the slider fade in and out by finding the relative position of each element (the 'hour-box'), and calculating its opacity based on its distance from the horizontal center of the screen.

4. The slider uses the requestAnimationFrame method to create a deceleration effect after being dragged by the mouse by saving a value for the velocity of the slider at mouse release. It then continually adds that value to the slider's position while also decreasing it slowly.

5. The slider also moves automatically when the user clicks on a day. Because of the opacity calculations, this movement cannot be done with CSS transitions. Instead, it it implemented manually using requestAnimationFrame and a parametric equation to create an ease-in-ease-out movement effect to the desired coordinates.
