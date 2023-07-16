const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const userSchema=new mongoose.Schema({
    

    name:{
        type:String,
        required:[true,"Please Enter your name"],
        maxLength:[30,"Name cannont exceed 30 charcters"],
        minLength:[4,"Name Should have more than 4 charcters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"Enter ur password"],
        minLength:[8,"password should be greater than 8 charcters"],
        select:false
    },
    avatar:{
        
            public_id:{
                type:String,
                required:true
            },
            url:{
               type:String,
               required:true
            }
    },
    role:{
        type:String,
        default:"user",

    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,

});

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))
    {
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
});

userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

//compare password

userSchema.methods.comparePassword=async function(enterdPassword){
    return await bcrypt.compare(enterdPassword,this.password);
}
//generating password reset token

userSchema.methods.getResetPasswordToken=function(){
  
   const resetToken =crypto.randomBytes(20).toString("hex");


   this.resetPasswordToken=crypto
   .createHash("sha256")
   .update(resetToken)
   .digest("hex");

   this.resetPasswordExpire=Date.now()+15*60*1000;
   return resetToken;

};

module.exports=mongoose.model("User",userSchema);