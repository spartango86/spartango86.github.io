function calculateCurrentPoints() {
  // Get a reference to the project store
  const projectStore = document.getElementById("__nuxt").__vue_app__.$nuxt.$pinia._s.entries().next().value[1];

  // Get the functions and reactive data we need from the store
  const {
    selected,
    pointTypes, // This is already an array, so we don't need .value
    getObject,
    getPointType
  } = projectStore;

  const selectedChoices = selected; // This is a ref, so it still needs .value
  
  // --- THIS IS THE ONLY LINE THAT CHANGED ---
  const allPointTypes = pointTypes; // Use the variable directly

  // Get an array of the IDs you've selected to check for activation requirements
  const allSelectedIds = Object.keys(selectedChoices); 

  // 1. Initialize our results object with the starting values for each point type
  const currentPoints = {};
  allPointTypes.forEach(pt => {
    currentPoints[pt.id] = Number(pt.startingSum) || 0;
  });

  // 2. Loop through every choice you have selected
  for (const choiceId in selectedChoices) {
    if (!selectedChoices.hasOwnProperty(choiceId)) continue;
    
    const count = selectedChoices[choiceId];
    const choiceData = getObject(choiceId);

    if (!choiceData || !choiceData.scores) continue;

    // 3. Loop through the scores/points this choice provides
    for (const score of choiceData.scores) {
      const pointType = getPointType(score.id);

      // Check if the point type is active
      const isPointActive = !pointType.activatedId || allSelectedIds.includes(pointType.activatedId);

      if (isPointActive) {
        const value = Number.parseInt(score.value, 10);
        // Add or subtract the point value, multiplied by how many times you took the choice
        currentPoints[score.id] += (value * count * -1);
      }
    }
  }

  return currentPoints;
}
moveMultiSelects = function() {
  baseBuyIDs = ["hp","str","mag","dex","spd","lck","def","res","cha"];
  dest = document.querySelector("#obj-base-stat-buy .obj-image-wrapper");
  multis = document.querySelectorAll("#row-status-basestat-ops .obj-select-multi")
  multis.forEach((el,idx) => {
    el.id = "base-buy-" + baseBuyIDs[idx];
    dest.appendChild(el);
  });
}

displayPoints = function(pObj) {
  for(statID in pObj) {
    newID = statID.substring(1);
    sel = "#base-buy-" + newID;
    el = document.querySelector(sel);
    if(el !== null) {
      el.setAttribute('data-content', pObj[statID]);
      bar = el.querySelector(".mx-1");
      bar.style.setProperty("background-size", Math.round(pObj[statID]/80*100) + "% 8px")
    }
  }
}
clickWrapper = function(ev) {
  el = ev.currentTarget;
  if(el.classList.contains("selected")) {
    console.log("Proceeding to move multiselects");
    moveMultiSelects();
    displayPoints(calculateCurrentPoints());
  } else {
    console.log("Closing status section");
  }
}
document.querySelector("#obj-status > .project-obj").addEventListener('click', clickWrapper);
// Select the node that will be observed for mutations
const targetNode = document.querySelector(".menu-container .item-scores");

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = (mutationList, observer) => {
  console.log(mutationList);
  for (const mutation of mutationList) {
//     console.log(mutation);
    btn = document.querySelector("#obj-status .project-obj");
    if(btn.classList.contains("selected")) {
      points = calculateCurrentPoints();
      displayPoints(points);
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
