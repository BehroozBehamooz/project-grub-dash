//Importing standard validation functions
const { hasValidProperties, hasRequiredProperties }=require("../errors/validations");

//checks for extra fields and raises an error if there is any and shows the list of extra fields
const bodyHasValidProperties=hasValidProperties(["id", "deliverTo", "mobileNumber", "status", "dishes"]);

//making sure all required fields are included in the body
const bodyHasRequiredProperties = hasRequiredProperties(["deliverTo", "mobileNumber", "dishes"]);


const path = require("path");
const notFound = require("../errors/notFound");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
}


function hasValidDishes(req, res, next) {
  const { dishes } = req.body.data;
  //checking for type of dishes field
  if (!Array.isArray(dishes) || dishes.length===0  ) {
    return next({
        status:400,
        message : `Order must include at least one dish`,
    });
  }
  //dishs.quantity should not be missing or none-numeric or zero or negetive
  dishes.forEach((dish,index)=>{
        if (
            dish["quantity"]===undefined 
            || typeof dish["quantity"]!=="number"
            || dish["quantity"]<=0 ){
            return next({
                status:400,
                message:`Dish ${index} must have a quantity that is an integer greater than 0`,
            });
        }
      });
    next();
}


function create(req,res){
    //const { data:{deliverTo,mobileNumber,quantity,dishes} } = req.body;
    const {data}=req.body;
    data["id"]=nextId();
    orders.push(data);
    res.status(201).json({data});
}

function orderExists(req,res,next){
    const { orderId }=req.params;
    const foundOrder=orders.find(({id})=>id===orderId);

    if (foundOrder){
        res.locals.order=foundOrder;
        next();
    }else{
        notFound(req,res,next);
    }
}
function read(req,res){
    const foundOrder=res.locals.order;
    res.json({data:foundOrder});
}

function hasValidStatus(req,res,next){
    const validStatus=["pending", "preparing", "out-for-delivery", "delivered"];
    const { data:{id,status} }= req.body;
    if (!status || status==="" || !validStatus.includes(status)){
        return next({
            status:400,
            message:"Order must have a status of pending, preparing, out-for-delivery, delivered"
        });
    }
    if(status==="delivered"){
        return next({
            status:400,
            message:"A delivered order cannot be changed"
        });
    }
    next();
}

function hasValidValues(req,res,next){
    const { data:{id,status} }= req.body;
    const { orderId }= req.params;
    
    if (id && id!==orderId ){
        return next({
            status:400,
            message:`Order id does not match route id. Order: ${id}, Route: ${orderId}`
        });
    } 
    next();
}

function update(req,res){
    const { data }=req.body;
    const { orderId }=req.params;
    const foundOrder=res.locals.order;
    const index=orders.map(({id})=>id===orderId);
    data["id"]=foundOrder["id"];
    orders[index]=data;
    res.json({data});
}

function destroy(req,res,next){
    const { orderId }=req.params;
    const foundOrder=res.locals.order;
    if (foundOrder.status!== "pending"){
        return next({
            status:400,
            message:"An order cannot be deleted unless it is pending"
        });
    }
    const index=orders.findIndex(({id})=>id===orderId);
    orders.splice(index,1);
    res.sendStatus(204);
}

function logMe(req,res,next){
    console.log("extraValidation");
    next();
}

module.exports = {
    create:[bodyHasValidProperties, bodyHasRequiredProperties, hasValidDishes, create],
    read:[orderExists, read],
    update:[ orderExists, bodyHasValidProperties, bodyHasRequiredProperties, hasValidStatus, hasValidDishes, hasValidValues , update],
    delete:[orderExists , destroy],
    list,
    orderExists,
}
