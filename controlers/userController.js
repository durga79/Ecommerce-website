const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const User=require("../models/userModel");
const sendToken=require("../utils/jwtToken");
const crypto=require("crypto");
const sendEmail=require("../utils/sendEmail");
//user registration
exports.registerUser=catchAsyncErrors( async(req,res,next)=>{
    const {name,email,password}=req.body;
    const user=await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample id",
            url:"profilepicUrl"
        }
    });
    sendToken(user,201,res);
});

//Login user

exports.loginUser=catchAsyncErrors(async (req,res,next)=>{
    const  {email,password}=req.body;

    if(!email || !password)
    {
        return next(new ErrorHander("Please Enter Email & password",400));
    }
    const user=await User.findOne({email}).select("+password");  

    if(!user)
    {
        return next(new ErrorHander("Invalid email or password",401));
    }
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
    return next(new ErrorHander("Inavlid email or password",401));
    }
  
    sendToken(user,200,res);

});

//logout user
exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,


    });
    res.status(200).json({
        success:true,
        message:"logged out successfully"
    })
});

//forgot password

exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>
{
    const user=await User.findOne({email:req.body.email});

    if(!user)
    {
        return next(new ErrorHander("User not found",404));
    }

    //get reset password
    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});


    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message=`Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If u have not requested this mail please ignonre it`;

    try{
     await sendEmail({
       email:user.email,
       subject:`Ecommerce Password Recovery`,
       message,
     });
     res.status(200).json({
        success:true,
        message:`Email sent to ${user.email} Successfully`,
     });
    }catch(error)
    {
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHander(error.message,500));
    }
});


//reset password
exports.resetPassword=catchAsyncErrors(async (req,res,next)=>{
     const resetPasswordToken=crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");


    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()},
    });

    if(!user)
    {
       return next(new ErrorHander("Reset password Token is Invalid or has been expired",400));
    }
    if(req.body.password!==req.body.cofirmPassword)
    {
        return next(new ErrorHander("Password does not match",400));
    }
    user.password=req.body.password;
    user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;


await user.save();
sendToken(user,200,res);
});

//get user detail
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
     
    const user=await User.findById(req.user.id);

   res.status(200).json({
    success:true,
    user,
   });
});
//update user password

exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
     
    const user=await User.findById(req.user.id).select("+password");

    const isPasswordMatched=await user.comparePassword(req.body.OldPassword);
    if(!isPasswordMatched){
    return next(new ErrorHander("Old passworrd is incorrect",400));
    }


    if(req.body.newPassword!=req.body.confirmPassword)
    {
        return next(new ErrorHander("password does not match",400));
    }
      
     user.password=req.body.newPassword;
     await user.save();
     sendToken(user,200,res);

  
});

///update user profile

exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
     
   const newUserData={
    name:req.body.name,
    email:req.body.email,
   };
const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
   new:true,
   runValidators:true,
   useFindAndModify:false,
});
res.status(200).json({
    success:true,
    
   });
   
});
//get all users (admin)
exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
  const users=await User.find();
  res.status(200).json({
    success:true,
    users,
  });

});

//get single user admin
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.params.id);

if(!user)
{
    return next(new ErrorHander(`User does not exist with id:${req.params.id}`)
    );
}

    res.status(200).json({
      success:true,
      user,
    });
  
  });

  //update user role --Admin

  exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
     
    const newUserData={
     name:req.body.name,
     email:req.body.email,
     role:req.body.role,
    };
 const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
 });
 res.status(200).json({
     success:true,
     
    });
    
 });


   //delete user --Admin 

exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
     
   
const user=await User.findById(req.params.id);

if(!user)
{
    return next(new ErrorHander(`User doesnt exist with id:${req.params.id}`));
}

await User.deleteOne({ _id: user._id });
 res.status(200).json({
     success:true,
     message:"User deleted Successfully",
    });
    
 });

 