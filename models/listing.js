const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require ("./review.js");

const listingSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "images/pexels-pixabay-237272.jpg",
        // Syntax: set:(v)=>{v===""? "default link":v}
        set: (v) =>{
            return v === ""
            ? "images/pexels-pixabay-237272.jpg" 
            : v
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        }
    ]
});

module.exports = mongoose.model("Listing",listingSchema);


