// these settings can be added to a configuration pane later
// for now we just set them fixed.

// the name of the object in Tableau you want to show/hide
let objectToHide = 'test';
// the name of the parameter you want to listen to
let parameterName = 'state';
// the value the parameter should have to hide the object
let hideValue = '0';
// default variables.
let dashboardObjects;
let container;

// first lets wait for the page to load
window.onload = (event) => {
  console.log('Page is fully loaded');

  // lets load the Extensions api.
  // when it is done loading we start our code. This is indicated by then(.
  tableau.extensions.initializeAsync({ configure: openConfig }).then(() => {
    console.log('Extensions API is loaded');

    let settings = tableau.extensions.settings.getAll();
    console.log(settings);
    objectToHide = settings.objectToHide ?? objectToHide;
    parameterName = settings.parameterName ?? parameterName;
    hideValue = settings.hideValue ?? hideValue;

    // show the parameters in the extension index.html
    document.getElementById('objectToHide').innerHTML = objectToHide;
    document.getElementById('parameterName').innerHTML = parameterName;
    document.getElementById('hideValue').innerHTML = hideValue;

    // first we create an eventlistener for the parameter we want to listen to
    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((parameters) => {
      // lets loop over the parameters
      parameters.forEach(function (parameter) {
        // if we find the parameter lets add an event listener
        if (parameter.name === parameterName) {
          parameter.addEventListener(tableau.TableauEventType.ParameterChanged, (event) => {
            // this code gets executed when the parameter value changes
            event.getParameterAsync().then((pm) => {
              // if the parameter value is equals to the value we set above hide the object
              if (pm.currentValue.value === hideValue) {
                toggleVisibility(objectToHide, true);
              }
              // for all other values we show the object
              else {
                toggleVisibility(objectToHide, false);
              }
            });
          });
        }
      });
    });
  });

  // this is the function to hide / show objects in Tableau.
  // it takes 2 input values. 1 is the name of the object and if it should hide or display the object
  const toggleVisibility = (targetObjectName, shouldHide) => {
    // lets get a list of all objects from Tableau in an array
    dashboardObjects = tableau.extensions.dashboardContent.dashboard.objects;
    // we use a find function on the array to find the right object.
    container = dashboardObjects.find((object) => object.name === targetObjectName);

    // make a map object with objects we want to hide/show
    var dashboardObjectVisibilityMap = new Map();
    // set the container we found above in the object
    dashboardObjectVisibilityMap.set(
      container.id,
      shouldHide
        ? tableau.DashboardObjectVisibilityType.Hide
        : tableau.DashboardObjectVisibilityType.Show
    );

    // voila lets hide or show it!
    tableau.extensions.dashboardContent.dashboard.setDashboardObjectVisibilityAsync(
      dashboardObjectVisibilityMap
    );
  };

  // this function is used to create the popup with configuration. This is not used in the workshop.
  function openConfig() {
    tableau.extensions.ui
      .displayDialogAsync('./config.html', 'null', { height: 900, width: 1050 })
      .then((closePayload) => {
        console.log('dialog closed', closePayload);
      })
      .catch((error) => {
        switch (error.errorCode) {
          case tableau.ErrorCodes.DialogClosedByUser:
            console.log('Dialog was closed by user');
            break;
          default:
            console.error(error.message);
        }
      });
  }
};

function saveSettings() {
  tableau.extensions.settings.set(
    'objectToHide',
    document.getElementById('objectToHideInput').value
  );
  tableau.extensions.settings.set(
    'parameterName',
    document.getElementById('parameterNameInput').value
  );
  tableau.extensions.settings.set('hideValue', document.getElementById('hideValueInput').value);
  tableau.extensions.settings
    .saveAsync()
    .then(() => {
      document.getElementById('saveButton').innerHTML = 'Settings saved! Please reload.';
    })
    .catch((error) => {
      console.log(error);
    });
}
