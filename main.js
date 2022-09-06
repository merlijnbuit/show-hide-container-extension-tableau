let objectToHide = 'test';
let parameterName = 'state';
let hideValue = '0';
let isVisible;
let dashboardObjects;
let container;

window.onload = (event) => {
  console.log('Page is fully loaded');
  tableau.extensions.initializeAsync({ configure: openConfig }).then(function () {
    console.log('Extensions API is loaded');

    tableau.extensions.dashboardContent.dashboard.getParametersAsync().then((parameters) => {
      parameters.forEach(function (parameter) {
        parameter.addEventListener(tableau.TableauEventType.ParameterChanged, (event) => {
          event.getParameterAsync().then((pm) => {
            if (pm.currentValue.value === hideValue) {
              toggleVisibility(objectToHide, true);
            } else {
              toggleVisibility(objectToHide, false);
            }
          });
        });
      });
    });
  });

  function openConfig() {
    tableau.extensions.ui
      .displayDialogAsync('./config.html', 'null', { height: 900, width: 1050 })
      .then((closePayload) => {
        console.log('dialog closed', closePayload);
      })
      .catch((error) => {
        switch (error.errorCode) {
          case window.tableau.ErrorCodes.DialogClosedByUser:
            console.log('Dialog was closed by user');
            break;
          default:
            console.error(error.message);
        }
      });
  }

  const toggleVisibility = (name, shouldHide) => {
    dashboardObjects = tableau.extensions.dashboardContent.dashboard.objects;
    container = dashboardObjects.find((object) => object.name === name);
    isVisible = container.isVisible;
    var dashboardObjectVisibilityMap = new Map();
    dashboardObjectVisibilityMap.set(
      container.id,
      shouldHide
        ? tableau.DashboardObjectVisibilityType.Hide
        : tableau.DashboardObjectVisibilityType.Show
    );
    var dashboard = tableau.extensions.dashboardContent.dashboard;
    dashboard.setDashboardObjectVisibilityAsync(dashboardObjectVisibilityMap).then(() => {
      isVisible = !isVisible;
    });
  };
};
