const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require ("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

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

const validateListing=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

const validateReview=(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}
// Index route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

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
app.post("/listings",
    validateListing,
    wrapAsync(
    async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();        
        res.redirect("/listings");
}));

// Edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
}))

// Update route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
    
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);  // Show route
}))

//Delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}))

// Show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}))

//Reviews

//Post Route
app.post("/listings/:id/reviews", 
    validateReview,
    wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);  //taking data(review[content],review[rating]) on clicking submit button in show.ejs

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    //res.send("new review saved");

    res.redirect(`/listings/${listing._id}`);
}))

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let { id,reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})