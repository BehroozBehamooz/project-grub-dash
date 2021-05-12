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

function idMachesUrlId(paramName) {
  return (req, res, next) => {
    const { data: { id } } = req.body;
    const urlId=req.params[paramName];
    //if the body includes id field then it checkes if it maches the dishId obtaind from url
    if (id && id !== urlId) {
      return next({
        status: 400,
        message: `Field id: ${id}, does not match route id: ${urlId}.`,
      });
    }
    next();
  };
}

module.exports = {
  hasValidProperties,
  hasRequiredProperties,
  idMachesUrlId,
};
