const Order=require("../models/orderModel");
const Product=require("../models/productModel");
const ErrorHander=require("../utils/errorhander");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");

//Create  new order
exports.newOrder=catchAsyncErrors(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    }=req.body;
    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });
    res.status(200).json({
        success:true,
        order,
    });
});

//get Single Order

exports.getSingleOrder=catchAsyncErrors(async (req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email");


    if(!order)
    {
        return next(new ErrorHander("Order not found with this Id",404));
    }
    res.status(200).json({
        success:true,
        order,
    });
});

//get logged in user orders

exports.myOrders=catchAsyncErrors(async (req,res,next)=>{
    const orders=await Order.find({user:req.user._id});

    res.status(200).json({
        success:true,
        orders,
    });
});

//get all orders--admin 

exports.getAllOrders=catchAsyncErrors(async (req,res,next)=>{
    const orders=await Order.find();

    let totalAmount=0;
    orders.forEach(order=>{
        totalAmount+=order.totalPrice;
    });


    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});

//update order status admin

exports.updateOrder=catchAsyncErrors(async (req,res,next)=>{
    const order=await Order.findById(req.params.id);
    
    if(!order)
    {
        return next(new ErrorHander("Order not found with this id",404));
    }
    if(order.orderStatus==="Delivered")
    {
        return next(new ErrorHander("You have already delivered this order",400));

    }
    order.orderItems.forEach(async (o)=>{
        await updateStock(o.Product,o.quantity)
    });

    order.orderStatus=req.body.status;
    if(req.body.status==="Delivered")
    {
        order.deliveredAt=Date.now();
    }
    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        
    });
});


async function updateStock(id, quantity) {
    try {
      const product = await Product.findById(id);
  
      if (product) {
        product.Stock -= quantity;
        await product.save({ validateBeforeSave: false });
      } else {
        console.log('Product not found.');
        // Handle the case where the product is not found
      }
    } catch (error) {
      console.error(error);
      // Handle other errors that might occur during the operation
    }
  }
  

//delete orders --Admin

exports.deleteOrder=catchAsyncErrors(async (req,res,next)=>{
    const order=await Order.findById(req.params.id);
    if(!order)
    {
        return next(new ErrorHander("order not found with this id",404));
    }

   await order.deleteOne();

    res.status(200).json({
        success:true,
      
    });
});