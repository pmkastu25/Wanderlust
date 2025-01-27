const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js')

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Wanderlust");
}

main()
.then(()=>{
    console.log('Connected Successfully');
})
.catch((err) => {
    console.log(err);
});

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({...obj, owner: "676c3d252f6bcc6c50baa508"}))
    await Listing.insertMany(initdata.data);
    console.log("Data initialised")
}
initDB();
