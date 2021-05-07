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

function bodyHasValidFields(req, res, next) {
  const validFields = ["deliverTo", "mobileNumber"];
  const { data } = req.body;
  let message = "";

  validFields.forEach((item) => {
    if (data[item] === undefined || data[item] === "") {
      message = `Order must include a ${item}`;
    }
  });
  
  if (!Array.isArray(data["dishes"]) || data["dishes"].length === 0) {
    message = `Order must include at least one dish`;
  }else{
      data["dishes"].forEach((dish,index)=>{
        if (dish["quantity"]===undefined 
        || typeof dish["quantity"]!=="number"
        || dish["quantity"]<=0 ){
            message=`Dish ${index} must have a quantity that is an integer greater than 0`;
        }
      });
  }
  if (message === "") {
    next();
  } else {
    next({
      status: 400,
      message,
    });
  }
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

function extraValidation(req,res,next){
    const validStatus=["pending", "preparing", "out-for-delivery", "delivered"];
    const { data:{id,status} }= req.body;
    const { orderId }= req.params;
    if (id && id!==orderId ){
        next({
            status:400,
            message:`Order id does not match route id. Order: ${id}, Route: ${orderId}`
        });
    }else if (!status || status==="" || !validStatus.includes(status)){
        next({
            status:400,
            message:"Order must have a status of pending, preparing, out-for-delivery, delivered"
        });
    }else if(status==="delivered"){
        next({
            status:400,
            message:"A delivered order cannot be changed"
        });
    }else{
        next();
    }
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
    create:[bodyHasValidFields, create],
    read:[orderExists, read],
    update:[ orderExists, bodyHasValidFields, extraValidation , update],
    delete:[orderExists , destroy],
    list,
};
