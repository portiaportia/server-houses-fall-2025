const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage: storage });

mongoose
  .connect("mongodb+srv://portiaportia:RCq4HTMF7ZXfeU8O@data.ng58qmq.mongodb.net/")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });

const houseSchema = new mongoose.Schema({
    name:String,
    size:Number,
    bedrooms:Number,
    bathrooms:Number,
    main_image:String,
    features:[String]
});

const House = mongoose.model("House", houseSchema);

app.get("/api/houses",async(req, res)=>{
    const houses = await House.find();
    res.send(houses);
});


app.post("/api/houses", upload.single("img") , async(req, res)=>{
    console.log(req.body);
    const isValidHouse = validateHouse(req.body);

    if(isValidHouse.error){
        console.log("Invalid house");
        res.status(400).send(isValidHouse.error.details[0].message);
        return;
    }

    const house = new House({
        name:req.body.name,
        size:req.body.size,
        bedrooms:req.body.bedrooms,
        bathrooms:req.body.bathrooms,
        features: req.body.features.split(",")
    });

    if(req.file){
        house.main_image = req.file.filename;
    }

    const newHouse = await house.save();
    res.status(200).send(newHouse);
});

app.put("/api/houses/:id", upload.single("img"), async(req, res)=>{
    //console.log(`You are trying to edit ${req.params.id}`);
    //console.log(req.body);
    const isValidUpdate = validateHouse(req.body);

    if(isValidUpdate.error){
        console.log("Invalid Info");
        res.status(400).send(isValidUpdate.error.details[0].message);
        return;
    }

    const fieldsToUpdate = {
        name : req.body.name,
        description : req.body.description,
        size : req.body.size,
        bathrooms : req.body.bathrooms,
        bedrooms : req.body.bedrooms,
        features: req.body.features.split(",")
    }
    
    if(req.file){
        fieldsToUpdate.main_image = req.file.filename;
    }

    const success = await House.updateOne({_id:req.params.id}, fieldsToUpdate);

    if(!success){
        res.status(404).send("We couldn't locate the ouse to edit");
        return;
    }

    const house = await House.findById(req.params.id);
    res.status(200).send(house);

});

app.delete("/api/houses/:id", async(req,res)=>{
    const house = await House.findByIdAndDelete(req.params.id);
array().items(Joi.string()).default([])
    if(!house){
        res.status(404).send("We couldn't locate the house to delete");
        return;
    }

    res.status(200).send(house);
});


const validateHouse = (house) => {
    const schema = Joi.object({
        _id:Joi.allow(""),
        name:Joi.string().min(3).required(),
        size:Joi.number().required().min(0),
        bedrooms:Joi.number().required().min(0),
        bathrooms:Joi.number().required().min(0),
        features: Joi.string().empty("").optional()
    });

    return schema.validate(house);
};

app.listen(3001, ()=>{
    console.log("I'm listening...");
});