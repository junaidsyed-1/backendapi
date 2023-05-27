const mongoose = require('mongoose');
const uri = "mongodb+srv://user:iNoteBook%40123%40@inotebook.hpudu3c.mongodb.net/iNoteBook?retryWrites=true&w=majority";


async function connectToMongo() {
    try {
        await mongoose.connect(uri, {
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

module.exports = connectToMongo