const ErrorHandler=require("../utils/errorhander");


module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.message=err.message || "Internal Sever Error";
    //wrong mongodb id

if(err.name==="CastError")
{
    const message=`Resource Not Found, Invalid:${err.path}`;
    err=new ErrorHandler(message,400);
}

if(err.code===11000)
{
    const message=`Duplicate ${Object.keys(err.keyValue)} Entered`;
    err=new ErrorHandler(message,400);
}

if(err.name==="JsonWebTokenError")
{
    const message=`Json Web Token is invalid,try again`;
    err=new ErrorHandler(message,400);
}

if(err.name==="TokenExpiredError")
{
    const message=`Json Web Token is invalid,try again`;
    err=new ErrorHandler(message,400);
}

    res.status(err.statusCode).json({
        success:false,
        error:err.message,
    });
}