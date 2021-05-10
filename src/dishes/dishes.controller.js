const path = require("path");
const notFound = require("../errors/notFound");

const { hasValidProperties, hasRequiredProperties }=require("../errors/validations");
const validProperties=["name", "description", "price", "image_url", "id"];
const requiredProperties = ["name", "description", "price", "image_url"];

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(({ id }) => id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    notFound(req, res, next);
  }
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

// function hasValidProperties(req,res,next){
//   const validProperties = ["name", "description", "price", "image_url", "id"];
//   const { data }=req.body;
//   const invalidFields=Object.keys(data).filter(field=>!validProperties.includes(field));
//   if (invalidFields.length>0){
//     return next({
//       status:400,
//       message: `Invalid field(s) : ${invalidFields.join(", ")}`,
//     });
//   }
//   next();
// }

// function hasRequiredProperties(req,res,next){
//   const requiredProperties = ["name", "description", "price", "image_url"];
//   const { data }=req.body;
//   requiredProperties.forEach((property)=>{
//     if (!data[property]){
//       return next({
//         status:400,
//         message: `Dish must include a ${property}. it is required`,
//       });    }
//   });
//   next();
// }
function hasValidValues(req,res,next){
  const { name, description, price, image_url }=req.body.data;
  if (name.trim()===""){
    return next({
      status:400,
      message: `Dish must include a name which is not empty`,
    });
  }
  if (description.trim()===""){
    return next({
      status:400,
      message: `Dish must include a description which is not empty`,
    });
  }
  if (image_url.trim()===""){
    return next({
      status:400,
      message: `Dish must include a image_url which is not empty`,
    });
  }
  if (typeof(price)!=="number" || price<=0){
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }
  
  next();
}

function create(req, res) {
    const { data }=req.body;
    data["id"]=nextId();
    dishes.push(data);
    res.status(201).json({data});
}

function bodyIdMachesUrlId(req,res,next){
  const { data:{id} }= req.body;
  const { dishId }= req.params;
  
  //if the body includes id field then it checkes if it maches the dishId obtaind from url
  if (id && id!==dishId ){
      return next({
          status:400,
          message:`Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
      });
  }
  next();
}

function update(req,res){
    let foundDish=res.locals.dish;
    const {data}=req.body;
    for (let property in foundDish){
      foundDish[property]=data[property];
    }
    res.json({data:foundDish});
}

function destroy(req,res,next){
  const { dishId }=req.params;
  const foundDish=dishes.find(({id})=>id===dishes);
  if (foundDish){
      //const foundDish=res.locals.dish;
    const index=dishes.findIndex(({id})=>id===foundDish.id);
    dishes.splice(index,1);
  }else{
    return next({
      status:405,
      message:"delete is not completed"
    });
  }
  res.sendStatus(405);
}

module.exports = {
  create:[
    hasValidProperties(validProperties), 
    hasRequiredProperties(requiredProperties),
    hasValidValues, create],  
  read: [dishExists, read],
  update:[
    dishExists, 
    hasValidProperties(validProperties),
    hasRequiredProperties(requiredProperties), 
    hasValidValues, bodyIdMachesUrlId, update],
  delete:[ destroy],
  list,
  dishExists,
  bodyIdMachesUrlId,
  hasValidProperties,
  hasRequiredProperties,
  hasValidValues,
};
