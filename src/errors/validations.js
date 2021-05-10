
function hasValidProperties(validProperties){
    return (req,res,next)=>{
        const { data }=req.body;
        const invalidFields=Object.keys(data).filter(field=>!validProperties.includes(field));
        if (invalidFields.length>0){
          return next({
            status:400,
            message: `Invalid field(s) : ${invalidFields.join(", ")}`,
          });
        }
        next();
    }
}
function hasRequiredProperties(requiredProperties, dataObject=undefined){
    return (req,res,next)=>{
    const  data = dataObject || req.body.data;
    requiredProperties.forEach((property)=>{
      if (!data[property]){
        return next({
          status:400,
          message: `Dish must include a ${property}. it is required`,
        });    }
    });
    next();
  }
}

module.exports={hasValidProperties,hasRequiredProperties};