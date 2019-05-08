let express = require('express');
let router = express.Router();
let diskdb = require('diskdb');
const crypto = require('crypto');
diskdb.connect('DB', ['loginDB']);
let fs =require('fs');
let dir = require('node-dir');
let expressValidator = require('express-validator');
router.use(expressValidator());
global.port = 3005;

//files inclusing
let authenticationMiddleware = require('./authentication.js').authenticationMiddleware;
const db = require('./db.js');


//declarations
let ppa = __dirname;
ppa = ppa.slice(0, -6);
// console.log(ppa);

//Routes
router.get('/', function (req, res) {
    // console.log(global.loged);
    res.render("login", {
        "msg": null
    });
});


router.post("/login", function (req, res) {

    userid = req.body.userid;
    password = req.body.password;
    // console.log(userid+" "+password);
    let list = diskdb.loginDB.find({
        userid: userid
    })
    if (list.length > 0) {
        crypto.pbkdf2(password, 'salt', 10, 64, 'sha512', (err, hash) => {
          if (err) throw err;
          if(list[0].password === hash.toString('hex')){
                global.loged = true;
                // console.log("Logged In Sussesfully");
                // console.log(response);
                res.redirect("/home");
            } else {
                global.loged = false;
                res.render("login", {
                    msg: "Incorrect UserId/Password"
                });
            }
        })
    } else {
        global.loged = false;
        res.render("login", {
            msg: "Incorrect UserId/Password"
        });
    }
});

router.get("/sql", authenticationMiddleware(), function (req, res) {
    res.render("sql",{sql:'',q:'',errors:'',out:''});
});

router.post("/sql",function(req,res){
    let q=req.body.queries
    db.query(q,function(err,output){
        res.render("sql",{"sql":q,errors:err,out:output})
    });
});

router.get('/register',  function (req, res) {
    res.render("register", {
        title: "register",
        "errors": null
    })
});

router.post('/register', function (req, res) {
    let userid = req.body.userid;
    let password = req.body.password;
    // console.log(userid + " " + password);

    req.checkBody('userid', 'User Name is Requiered').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password is not matching').equals(req.body.password2);
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('register', {
            errors: errors
        });
    } else {
        crypto.pbkdf2(password, 'salt', 10, 64, 'sha512', (err, hash) => {
            let record = {
                userid: userid,
                password: hash.toString('hex')
            };
            diskdb.loginDB.save(record);
            record={};
            record = diskdb.loginDB.find({userid});
            if (record.length > 0) {
                global.loged = false;
                // console.log("registered");
                res.redirect("/");
            } else {
                console.log("Error in register registered");
                res.redirect("/register")
            }
        })
    }
});

router.get('/home', authenticationMiddleware(), (req, res) => {
    res.render('home', {
        'title': "Home"
    });
});

//upgrade

router.get('/upgrade',authenticationMiddleware(), (req, res) => {
    res.render("upgrade", {
        'title': "Upgrade"
    });
});
router.get("/upgrade/post/:yr",function(req,res){
    let yr=req.params.yr;
    db.query("select add_no from student where std=12",(err,result)=>{
        if(err){
            console.log(err);
        }else{
            // console.log(result);
            let list=result;
            // let new_list=[];
            for(let i=0;i<result.length;i++){
                // new_list.push(list[i])
                // console.log(list[i].add_no)
                db.query("select add_no,name,mob1,address,emis,img from student where add_no=?",[list[i].add_no],function(err,res1){
                    if(err){
                        console.log(err)
                    }else
                    {
                        // console.log(res1);
                        for(let j=0;j<res1.length;j++){
                            // console.log(res1[j].add_no);
                            db.query("insert into pastpeople values(?,?,?,?,?,?,?)",[res1[j].add_no,res1[j].name,yr,res1[j].mob1,res1[j].address,res1[j].emis,res1[j].img],function(err){
                                if(err){
                                    console.log(err)
                                }
                            })
                        }
                    }
                })
            }
        }
    });
    db.query("UPDATE student SET std=std+1 WHERE 1", (err) => {
        if(err){
            res.send("ERROR in Upgrading student..");
        }else
        {
            db.query("DELETE FROM student WHERE std = 13", (err) => {
                if(err){
                    res.send("ERROR in Deleting student..");
                }else
                {
                    res.render("upgrade",{msg: 'Upgraded!','title': "Upgrade"});
                }
            });
        }
    });
});


router.get("/past-people", authenticationMiddleware(), (req, res) => {
    let page="nullpage";
    db.query('SELECT * FROM pastpeople', (err, result) => {
        if (err)
        {
            console.log(err);
        }else
        {
            // console.log(result);

            if(result ==="")
            {
                result="NO PAST PEOPLE FOUND";
            }else
            {
                page='past-people';
            }
        }
        res.render(page,{'title': "Past-People",'list':result});
    });
});

router.post("/past-people",(req,res)=>{
    let page="nullpage";
    let yea=req.body.year;
    // console.log(yea);
    db.query('SELECT * FROM pastpeople where year_passed=?',[yea], (err, result) => {
        if (err)
        {
            console.log(err);
        }else
        {
            // console.log(result);

            if(result=="")
            {
                result="NO PAST PEOPLE FOUND";
            }else
            {
                page='past-people';
            }
        }
        res.render(page,{'title': "Past-People",'list':result});
    });
});



router.get("/download",authenticationMiddleware(),function(req,res){
    global.disp=[];
    global.fname=[];
    let dirr = ppa + "public/pdf/";
    dir.files(dirr, function(err, files) {
        if (err){
            console.log(err)
        }else{
            // console.log(files);
            let a=files;
            for(let i=0;i<a.length;i++){
                let l=a[i].length-4;
                let ext=a[i].slice(l);
                // console.log(ext);
                if(ext===".pdf"){
                    global.disp.push(a[i])
                    global.fname.push(a[i].slice(-13))
                }
            }
            res.render("download",{title:"Download Report",fname,src:disp});
        }
    });
});

router.get("/download/:src", authenticationMiddleware(), function (req, res) {
    let src=req.params.src;
    let del_file='';
    for(let i=0;i<global.fname.length;i++){
        if(global.fname[i] === src){
            del_file=global.disp[i];
        }
    }
    if(del_file !== ''){
        fs.unlink(del_file, function(err) {
            if(err){
                console.log(err);
            }else{
                res.redirect("/download");
            }
        })
    }
});

router.get('/logout', (req, res) => {
    global.loged = false;
    // console.log("Logged out Succesfully");
    res.redirect('/');
});
module.exports = router;
