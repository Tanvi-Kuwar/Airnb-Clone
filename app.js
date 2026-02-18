const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require ("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const {listingSchema} = require("./schema.js");
// const Review = require("./models/review.js");
// const {reviewSchema} = require("./schema.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust_git"; 

main()
    .then(()=>{
        console.log("connected to db");
    })
    .catch((err)=>{
        console.log(err);
    })

async function main(){
    await mongoose.connect(MONGO_URL);
}
app.get("/",(req,res)=>{
    res.send("working root");
})


// Index route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// Create route
/*
// 1)
app.post("/listings",(req,res)=>{
    
    let{title, description, image, place, location, country} = req.body;
    let newlisting = new Listing({
        title: title,
        description: description,
        image: image,
        place: place,
        location: location,
        country: country,
    })

    console.log(newlisting);

    newlisting
        .save()
        .then((res)=>{
            console.log(res);
        })
        .catch((err)=>{
            console.log(err);
        })

    res.redirect("/listings");

    

})
*/

// 2) 
app.post("/listings",async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();        
        res.redirect("/listings");
});

// Edit route
app.get("/listings/:id/edit",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
})

// Update route
app.put("/listings/:id",
    
    async(req,res)=>{
    
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);  // Show route
})

//Delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

// Show route
app.get("/listings/:id",async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})