
var mongoose= require("mongoose");
 var campSchema = new mongoose.Schema({
   name:String,
   image:String,
   description:String,
   comment:[
      {
       text:String,
       author:String
      }
    ]
});

module.exports= mongoose.model("campground", campSchema);
