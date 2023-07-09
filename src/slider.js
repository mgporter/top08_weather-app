import { middleBoxViewX, middleBoxFadeWidth } from './constants';

// Known issue: resizing the window makes the moving box slide. Ideally, it would stay in place on window resize.

export default function Slider() {
  const movingBox = document.getElementById('hours-moving-box');
  const hoursBanner = document.getElementById('hours-banner');
  const dayPaneContainer = document.getElementById('day-pane-container');

  let hourBoxes,
    hourSeparators,
    fadeElements,
    hourBoxCenterOffset,
    hourSeparatorCenterOffset,
    sliderXCenter,
    clientX,
    movingBoxMaxLeft,
    movingBoxMaxRight;

  let weatherDisplayed = false;

  // Refresh variables when a new location is searched
  hoursBanner.addEventListener('weatherUpdate', () => {
    // Add these event listeners the first time this event is fired
    if (!weatherDisplayed) {
      window.addEventListener('scroll', updateOnScreenChange);
      window.addEventListener('resize', updateOnScreenChange);
      weatherDisplayed = true;
    }

    hourBoxes = document.querySelectorAll('.hour-box');
    hourSeparators = document.querySelectorAll('.hour-separator');

    // these are all of the elements that need to fade on the slider
    fadeElements = document.querySelectorAll('.fadeobject');
    hourBoxCenterOffset = hourBoxes[0].getBoundingClientRect().width / 2;
    hourSeparatorCenterOffset =
      hourSeparators[0].getBoundingClientRect().width / 2;

    findSliderCenter();
    updateMovingBox(movingBoxMaxLeft);
  });

  // Set the variables that describe the sliders centerX and centerY coordinates
  function findSliderCenter() {
    const rect = hoursBanner.getBoundingClientRect();
    sliderXCenter = rect.width / 2;

    const movingBoxRect = movingBox.getBoundingClientRect();
    movingBoxMaxLeft = sliderXCenter - middleBoxViewX;
    movingBoxMaxRight = sliderXCenter + middleBoxViewX - movingBoxRect.width;
  }

  // // This function needs to be called near the top, because other functions
  // // depend on the sliderXCenter value.
  // findSliderCenter();

  // This function is called for every animation frame
  // Be careful what you put in here!
  function updateMovingBox(newXPosition) {
    // Clamp the value of clientX and update the moving box's location
    const boxOffset = Math.max(
      movingBoxMaxRight,
      Math.min(newXPosition, movingBoxMaxLeft)
    );

    movingBox.style.left = `${boxOffset}px`;

    // Set the opacity of each element based on its location
    fadeElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      let centerOffset;

      // If the element is a day-box, we fire off an event to tell
      // the dom which day is being viewed
      if (element.className.includes('day-box')) {
        if (rect.left < sliderXCenter && rect.right > sliderXCenter) {
          const changeDayEvent = new CustomEvent('changeDay', {
            detail: element.dataset.dayid,
          });
          dayPaneContainer.dispatchEvent(changeDayEvent);
        }
      }

      // To find the element's center, we have to know what kind of element it is
      if (element.className.includes('hour-box')) {
        centerOffset = hourBoxCenterOffset;
      } else if (element.className.includes('hour-separator')) {
        centerOffset = hourSeparatorCenterOffset;
      }

      // Find how far away the center of the box is from the middle
      const elementX = rect.left + centerOffset - sliderXCenter;

      // Get a value which is 0 where the element is at the end of the fading width, and
      // 1 or greater where the element is at or within the middleBoxView
      let percentFade =
        (middleBoxFadeWidth - (Math.abs(elementX) - middleBoxViewX)) /
        middleBoxFadeWidth;

      // Clamp the percentFade value to between 0 and 1 and then set the element's opacity
      element.style.opacity = Math.max(0, Math.min(percentFade, 1));
    });
  }

  // Call this to prevent a default drag action
  hoursBanner.ondragstart = () => {
    return false;
  };

  // The slider's event listener
  hoursBanner.addEventListener('mousedown', function handleSliderClick(e) {
    let clickLocationX = e.clientX - movingBox.getBoundingClientRect().left;
    clientX = e.clientX - clickLocationX;
    let isDown = true;
    let prevX = movingBox.getBoundingClientRect().left;
    // let clientX;
    let deltaX;

    function moveObject(moveEvent) {
      clientX = moveEvent.clientX - clickLocationX;
    }

    document.addEventListener('mousemove', moveObject);

    document.addEventListener('mouseup', (mouseupEvent) => {
      clientX = mouseupEvent.clientX - clickLocationX;
      isDown = false;
      document.removeEventListener('mousemove', moveObject);
      document.onmouseup = null;
    });

    function animate() {
      let animation = requestAnimationFrame(animate);
      if (isDown) {
        deltaX = movingBox.getBoundingClientRect().left - prevX;
        prevX = movingBox.getBoundingClientRect().left;
      } else {
        // If the mouse is released, we keep adding the deltaX to the location while also
        // slowly decreasing deltaX. This makes a deceleration effect.
        clientX += deltaX;
        deltaX *= 0.9;
        if (Math.abs(deltaX) < 1) {
          cancelAnimationFrame(animation);
        }
      }

      updateMovingBox(clientX);
    }

    animate();
  });

  function updateOnScreenChange() {
    findSliderCenter();
    const newX = clientX ? clientX : movingBoxMaxLeft;
    updateMovingBox(newX);
  }

  // Set up the event listener that will change the active day
  // when the slider is moved forwards and backwards
  // const dayPaneContainer = document.getElementById('day-pane-container');
  dayPaneContainer.addEventListener('changeDay', (e) => {
    const dayPanes = document.querySelectorAll('.day-pane');
    dayPanes.forEach((pane) => {
      if (pane.dataset.dayid === e.detail) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  });

  const transitionTime = 1000; // how long the transition takes in ms
  dayPaneContainer.addEventListener('click', (e) => {
    const dayId = e.target.dataset.dayid;
    const dayBox = document.querySelector(`.day-box[data-dayid="${dayId}"]`);
    const selectedDayX = dayBox.getBoundingClientRect().left;
    const movingBoxX = movingBox.getBoundingClientRect().left;
    // const moveToCoordinates = movingBoxMaxLeft - (selectedDayX - movingBoxX);
    // const difference = moveToCoordinates - movingBoxX;
    const amountToMove = movingBoxMaxLeft - selectedDayX;
    const startTime = Date.now();

    // We have to manually create the slider box movement, because the CSS transition
    // property will not work (it cannot make the opacity changes that we make)
    function animateDayboxTransition() {
      let animation = requestAnimationFrame(animateDayboxTransition);
      const normalizedTime = (Date.now() - startTime) / transitionTime; // convert time to 0-1
      if (normalizedTime >= 1) cancelAnimationFrame(animation);
      const transformedMove =
        amountToMove * parametricTransform(normalizedTime) + movingBoxX;

      updateMovingBox(transformedMove);
    }

    animateDayboxTransition();
  });

  function parametricTransform(t) {
    return (t * t) / (2 * (t * t - t) + 1);
  }

  // window.addEventListener('scroll', updateOnScreenChange);
  // window.addEventListener('resize', updateOnScreenChange);
  // updateMovingBox(movingBoxMaxLeft);
}
