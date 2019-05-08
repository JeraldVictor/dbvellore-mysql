let express = require('express');
let router = express.Router();
let multer = require('multer');
let fs =require('fs'),
path = require("path")
const b64 = require('base64-async');

//files inclusing
let authenticationMiddleware = require('./authentication.js').authenticationMiddleware;
const db = require('./db.js');


global.fn='';
// Setting up multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads/')
    },
    filename: function(req, file, cb){
        // console.log(file);
        global.fn= file.originalname;
        // console.log(global.fn);
        cb(null,global.fn);
    }
});
const upload=multer({storage:storage});



//teachers


router.get('/add', authenticationMiddleware(), function (req, res) {
    res.render('add-teach', {
        'title': "Add A Teacher"
    });
});

router.post('/add',upload.any(),function (req, res) {
    let tid=req.body.tid;
    let name=req.body.tname.toUpperCase();
    let std=req.body.tstd;
    let sec=req.body.tsec.toUpperCase();
    let phno=req.body.tphno;

    let loc='./public/uploads/'+global.fn;
    let newloc='./public/uploads/'+name+'-'+tid+'.jpg';
    let img=name+'-'+tid;
    //renaming file

    fs.renameSync(loc,newloc);
    let buffer  = fs.readFileSync(newloc)
    b64.encode(buffer).then((base64Image)=>{
        // console.log(base64Image.length)
        db.query('INSERT INTO `teacher`(`tid`, `name`, `std`, `sec`, `phno`, `img`) VALUES (?,?,?,?,?,?)',[tid,name,std,sec,phno,base64Image],function(err){
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
                        res.render('add-teach', {'title': "Add A Teacher",'msg': 'Uploaded'});
                    }
                  });
            }
        })
    });
});

router.get('/edit', authenticationMiddleware(), function (req, res) {
    let page="nullpage";
    db.query('SELECT * FROM teacher ORDER BY std ASC', function (err, result) {
        if (err)
        {
            console.log(err);
        }else
        {
            // console.log(result);

            if(result =="")
            {
                result="NO TEACHER FOUND";
            }else
            {
                page='edit-teacher';
            }
        }
        res.render(page,{'title': "Edit A Teacher",'list':result});
    });
});

router.get('/edit/:id/:name', authenticationMiddleware(),function (req, res) {
    let tid=req.params.id;
    // let name=req.params.name;

    db.query('SELECT * FROM teacher where tid = ?',[tid],function (err, result) {
        if (err)
        {
            console.log(err);
        }else
        {
            res.render('editspecialteach',{'title': "Edit A Teacher",'list':result[0]});
        }
    });
});

router.post("/class-teacher",function(req,res){
    let sec=req.body.tsec.toUpperCase();
    let std=req.body.tstd.toUpperCase();
    let tid=req.body.teach
    // console.log(sec+"\n"+std+"\n"+tid+"\n")
    if(tid==="all"){
        db.query("update teacher set std=?,sec=? where 1",[std,sec],function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/teachers/edit");
            }
        });
    }else{
        db.query("update teacher set std=?,sec=? where tid=?",[std,sec,tid],function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect("/teachers/edit");
            }
        });
    }
});

router.post('/update/:oldid', function (req, res) {
    let old_id=req.params.oldid;
    let tid=req.body.tid;
    let name=req.body.tname.toUpperCase().trim();
    let std=req.body.tstd;
    let sec=req.body.tsec;
    let phno=req.body.tphno;
    let img=name+'-'+tid;

    db.query('SELECT * FROM teacher where tid = ?',[old_id],function(err,result1){
        if(err){
            console.log(err)
        }else{
            // console.log(result1[0].name);
            // console.log(result1[0].tid);
            let fnn=result1[0].name+"-"+result1[0].tid;
            // console.log(fnn);
            let loc='./public/uploads/'+fnn+".jpg";
            let newloc='./public/uploads/'+name+'-'+tid+'.jpg';
            console.log("\nloc:\t"+loc);
            console.log("\nnew loc:\t"+newloc);
            // console.log(result1);
            fs.rename(loc, newloc, function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });

            db.query("UPDATE teacher SET tid = ?,name = ?,std = ?,sec = ?,phno = ?,img = ?  WHERE tid = ? ",[tid,name,std,sec,phno,img,old_id], function (err, result) {
                if (err)
                {
                    console.log(err);
                }else
                {
                    res.redirect('/teachers/edit');
                }
            });
        }
    })
});

router.get('/delete/:tid/:tname', authenticationMiddleware(), function (req, res) {
    let tid = req.params.tid;
    let tname = req.params.tname;

    db.query("DELETE FROM teacher WHERE tid = ? AND name = ?",[tid,tname], function (err, result) {
        if(err){
            res.send("ERROR in Deleting Teacher..");
        }else {
            res.redirect('/teachers/edit');
        }
    });
});

module.exports = router;
