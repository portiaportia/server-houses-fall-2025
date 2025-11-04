const express = require("express");
const app = express();
app.use(express.static("public"));

app.get("/api/houses/", (req, res)=>{
    console.log("in get request")
});

app.listen(3001, () => {
    console.log("Server is up and running");
});