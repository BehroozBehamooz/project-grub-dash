function validProperties(validProperties){
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
function roperties(req,res,next){
    const validProperties = ["name", "description", "price", "image_url", "id"];
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