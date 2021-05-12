function hasValidProperties(validProperties) {
  return (req, res, next) => {
    const { data } = req.body;
    const invalidFields = Object.keys(data).filter(
      (field) => !validProperties.includes(field)
    );
    if (invalidFields.length > 0) {
      return next({
        status: 400,
        message: `Invalid field(s) : ${invalidFields.join(", ")}`,
      });
    }
    next();
  };
}
function hasRequiredProperties(requiredProperties, dataObject = undefined) {
  return (req, res, next) => {
    const data = dataObject || req.body.data;
    requiredProperties.forEach((property) => {
      if (!data[property]) {
        return next({
          status: 400,
          message: `Dish must include a ${property}. it is required`,
        });
      }
    });
    next();
  };
}

function bodyIdMachesUrlId(urlId) {
  return (req, res, next) => {
    const { data: { id } } = req.body;
    const { dishId } = req.params;

    //if the body includes id field then it checkes if it maches the dishId obtaind from url
    if (id && id !== dishId) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
    next();
  };
}

module.exports = {
  hasValidProperties,
  hasRequiredProperties,
  bodyIdMachesUrlId,
};
