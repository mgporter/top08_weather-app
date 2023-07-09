# top08_weather-app

The Odin Project Weather app project from https://www.theodinproject.com/lessons/node-path-javascript-weather-app

Concepts:

1. Asynchronous functions to retreive data from API

2. Autocomplete box that updates on input with data retreieved from API

3. Custom built slider to display weather data per hour using the requestAnimationFrame method. Slider has a decelleration effect by saving the last known change in position before mouse release, and then continually adding that to the slider's position (in descreasing amounts) after mouse release.

4. Slider fadein/fadeout effect: Algorithm that finds the position of each hour-box in the slider and computes its opacity based on where it is in the slider.

5. The slider, again: clicking on a day-box moves the slider automatically to that day. Since this movement cannot be done with CSS animations (because of the extra opacity calculations--see above), I manually implemented an ease-in-ease-out movement effect from a parametric equation.
