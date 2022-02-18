require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB(){
    //database connection
    const url = process.env.MONGO_CONNECTION_URL;

    mongoose.connect(url,{
        useNewUrlParser: true,  useUnifiedTopology: true, 
    });

    try {
        await mongoose.connection.once('open',()=>{
            console.log('database connected');
        })
    } catch (error) {
        console.log(error);
    }
    
}
module.exports = connectDB;