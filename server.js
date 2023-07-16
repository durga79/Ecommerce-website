const app=require("./app");

const dotenv=require("dotenv");
const connectDatabase=require("./config/database")
//handling uncaught exception

process.on("UncaughtException",err=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down the sever due to Uncaught Exception`);
    server.close(()=>{
        process.exit(1);
    });
});

dotenv.config({path:"backend/config/config.env"});

connectDatabase()

const server =app.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost: ${process.env.PORT}`)
})


//unhandled Promise Rejection

process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting Down the Server due to unhandled Rejection`);
    server.close(()=>{
        process.exit(1);
    });
});