let express = require('express');
let fs =require('fs'),
path = require("path")
const b64 = require('base64-async');
let router = express.Router();
const multer = require('multer');
let db = require("./db");
// Setting up multer
const storage = multer.diskStorage({
   filename: function(req, file, cb){
    // console.log(file);
    global.fn= file.originalname;
    // console.log(global.fn);
    cb(null,global.fn);
  },
  destination:function(req,file,cb){
    cb(null,'./public/uploads')
  }
});
const upload=multer({storage:storage});


router.get('/:name/:add',function(req,res){
	let add_no=req.params.add;
    let name=req.params.name.toUpperCase();
  // console.log(add_no+"\t"+name);
  let re={
    name: name,
    add_no: add_no
  };
  res.render("pic-upload",{title:"Image Upload",'list':re});
});

router.post('/:sname/:add_no', upload.single('profileImage'),function(req,res){
  let add_no=req.params.add_no;
  let name=req.params.sname;
  // console.log(name +'\t'+ add_no);

  let loc='./public/uploads/'+fn;
  let newloc='./public/uploads/'+name+'-'+add_no+'.jpg';
  let img=name+'-'+add_no;
  //renaming file

  let re={
    name: name,
    add_no:add_no,
    msg:'Image Uploaded'
  };

  // console.log(newloc);
  // console.log(loc);
  fs.renameSync(loc,newloc);
  let buffer  = fs.readFileSync(newloc)
    b64.encode(buffer).then((base64Image)=>{
        // console.log(base64Image.length)
        db.query("UPDATE `student` SET `img`=? WHERE add_no=?",[base64Image,re.add_no],function(err) {
            if (err)
            {
                console.log(err);
            }else
            {
                // console.log("insert")
                fs.unlink(newloc, (err) => {
                    if (err){
                        console.log(err)
                    }else{
                        // console.log('successfully deleted '+newloc);
                        res.render("pic-upload",{title:"Image Upload",'list':re});
                    }
                  });
            }
        })
    });
});

router.get('/teacher/:tname/:tid',function(req,res){
  tid=req.params.tid;
  tname=req.params.tname;
  // console.log(tid+"\t"+tname);
  let re={
    tname: tname,
    tid: tid
  };
  res.render("pic-upload-teacher",{title:"Image Upload",'list':re});
});

router.post('/teacher/:tname/:tid', upload.single('profileImage'),function(req,res){
  let tid=req.params.tid;
  let name=req.params.tname;
  // console.log(name +'\t'+ tid);

  let loc='./public/uploads/'+global.fn;
  let newloc='./public/uploads/'+name+'-'+tid+'.jpg';
  let img=name+'-'+tid;
  //renaming file

  let re={
    tname: name,
    tid:tid,
    msg:'Image Uploaded'
  };

  // console.log(newloc);
  // console.log(loc);
  fs.renameSync(loc,newloc);
  let buffer  = fs.readFileSync(newloc)
    b64.encode(buffer).then((base64Image)=>{
        // console.log(base64Image.length)
        db.query("UPDATE `teacher` SET `img`=? WHERE `tid` = ?",[base64Image,re.tid],function(err) {
            if (err)
            {
                console.log(err);
            }else
            {
                // console.log("insert")
                fs.unlink(newloc, (err) => {
                    if (err){
                        console.log(err)
                    }else{
                        // console.log('successfully deleted '+newloc);
                        res.render("pic-upload-teacher",{title:"Image Upload",'list':re});
                    }
                  });
            }
        })
    });
});


module.exports = router;
