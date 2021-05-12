//Importing standard common validation functions
const { hasValidProperties, hasRequiredProperties, idMachesUrlId }=require("../errors/validations");

//checks for extra fields and raises an error along with the list of extra fields
const bodyHasValidProperties=hasValidProperties(["name", "description", "price", "image_url", "id"]);

//making sure all required fields are included in the body
const bodyHasRequiredProperties = hasRequiredProperties(["name", "description", "price", "image_url"]);

const bodyIdMachesUrlId= idMachesUrlId("dishId");


const path = require("path");
const notFound = require("../errors/notFound");

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
  if (!foundDish) {
      return notFound(req, res, next);
  }
  res.locals.dish = foundDish;
  next();  
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

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

function update(req,res){
    let foundDish=res.locals.dish;
    const {data}=req.body;
    for (let property in foundDish){
      foundDish[property]=data[property];
    }
    res.json({data:foundDish});
}


module.exports = {
  create:[bodyHasValidProperties, bodyHasRequiredProperties, hasValidValues, create],  
  read: [dishExists, read],
  update:[dishExists, bodyHasValidProperties, bodyHasRequiredProperties, hasValidValues, bodyIdMachesUrlId, update],
  list,
  dishExists,
  bodyIdMachesUrlId,
  hasValidValues,
};
