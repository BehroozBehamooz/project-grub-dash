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
function bodyHasRightFields(req, res, next) {
  const validFields = ["name", "description", "price", "image_url"];
  const { data } = req.body;
  if( typeof data["price"] !=='number'){
    return next({
      status: 400,
      message: `Dish price must be a number}`,
    });
  }
  
  validFields.forEach((item)=>{
      if (data[item]===undefined || data[item] === "" || data[item]<=0){
        return next({
            status: 400,
            message: `Dish must include a ${item}`,
          });
      }
  });
  
  next();
}
function create(req, res) {
    
    const {data}=req.body;
    data["id"]=nextId();
    dishes.push(data);
    res.status(201).json({data});
}

function extraValidation(req,res,next){
  const { data:{id} }= req.body;
  const { dishId }= req.params;
  if (id && id!==dishId ){
      next({
          status:400,
          message:`Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
      });
  }
  // else if (!status || status==="" || !validStatus.includes(status)){
  //     next({
  //         status:400,
  //         message:"Order must have a status of pending, preparing, out-for-delivery, delivered"
  //     });
  // }else if(status==="delivered"){
  //     next({
  //         status:400,
  //         message:"A delivered order cannot be changed"
  //     });
  // }
  
  else{
      next();
  }
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
  create:[bodyHasRightFields, create],  
  read: [dishExists, read],
  update:[dishExists, bodyHasRightFields, extraValidation, update],
  delete:[ destroy],
  list,
};
