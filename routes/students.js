let express = require('express');
let router = express.Router();
let multer = require('multer');
let fs =require('fs'),
path = require("path")
const b64 = require('base64-async');
let moment = require("moment");
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



//students

router.get('/add', authenticationMiddleware(), function (req, res) {
    res.render('add-student', {title:"Add Student"});
});


router.post('/add',upload.any(), function (req, res) {
    let name = req.body.sname.toUpperCase();
    let bg = req.body.blood_group.toUpperCase();
    let exno = req.body.exam_no.toUpperCase();
    let add_no = req.body.add_no.toUpperCase();
    let std = req.body.sstd.toUpperCase();
    let sec = req.body.ssec.toUpperCase();
    let emis = req.body.emis;
    let aadhar = req.body.aadhar;
    let dob = req.body.dob;
    let gender = req.body.gender.toUpperCase();
    let fname = req.body.fname.toUpperCase();
    let foc = req.body.foc.toUpperCase();
    let mname = req.body.mname.toUpperCase();
    let moc = req.body.moc.toUpperCase();
    let mob1 = req.body.mob1;
    let mob2 = req.body.mob2;
    let address = req.body.address.toUpperCase();
    let religion = req.body.religion.toUpperCase();
    let caste = req.body.caste.toUpperCase();
    let community = req.body.Community.toUpperCase();

    let loc='./public/uploads/'+global.fn;
    let newloc='./public/uploads/'+name+'-'+add_no+'.jpg';
    let img=name+'-'+add_no;
    fs.renameSync(loc,newloc);
    // console.log("\nname \t" + name + "\n add_no \t" + add_no + "\n std \t" + std + "\t sec \t" + sec + "\n phno \t" + mob1 + "\t" + mob2 + '\n image \t' + img + '\n blood group\t' + bg + '\n exno \t' + exno + '\n emis\t' + emis + '\n addha\t' + aadhar + '\n dob\t' + dob + '\n gender\t' + gender + '\n fname \t' + fname + '\n foc\t' + foc + '\n mname\t' + mname + '\n moc\t' + moc + '\n address\t' + address + '\n relegion\t' + religion + '\n caste\t' + caste + '\n comunity\t' + community);
    //name,bg,exno,add_no,std,sec,emis,aadhar,dob,gender,fname,foc,mname,moc,mob1,mob2,address,religion,caste,community
    let buffer  = fs.readFileSync(newloc)
    b64.encode(buffer).then((base64Image)=>{
        // console.log(base64Image.length)
        db.query("insert into student values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[name,bg,exno,add_no,std,sec,emis,aadhar,dob,gender,fname,foc,mname,moc,mob1,mob2,address,religion,caste,community,base64Image],function(err) {
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
                        res.render('add-student', {msg: 'Uploaded!',title:"Add Student"});
                    }
                  });
            }
        })
    });
});

router.get('/show', authenticationMiddleware(), function (req, res) {
    res.render("show-class", {
        'title': "Class"
    });
});


router.get('/edit/:std/:sec', authenticationMiddleware(), function (req, res) {
    let std = req.params.std.toUpperCase();
    let sec = req.params.sec.toUpperCase();
    let sca = 0, st = 0, sc = 0, mbc = 0, bcm = 0, bc = 0, oc = 0, fc = 0, others = 0,male=0,female=0,christian=0,muslim=0,hindu=0;
    let page="nullpage";
    db.query('select * from student where std =? and sec=? ORDER BY name',[std,sec],function (err, result) {
        if(err){
            console.log(err)
        }else{
            if (result == "") {
                result = "NO Student FOUND";
                res.render(page, { 'list': result, 'title': "Edit A Student", 'std': std, 'sec': sec });
            } else {
                // console.log(result);
                for (let key in result) {
                    if (result.hasOwnProperty(key)) {
                        let val = result[key];
                        val.dob = moment(val.dob, "YYYY-MM-DD").format("DD-MMM-YYYY").toUpperCase();
                        if(val.caste==='SCA'){
                            sca++;
                        }
                        if (val.caste === 'SC') {
                            sc++;
                        }
                        if (val.caste === 'ST') {
                            st++;
                        }
                        if (val.caste === 'MBC') {
                            mbc++;
                        }
                        if (val.caste === 'BCM') {
                            bcm++;
                        }
                        if (val.caste === 'BC') {
                            bc++;
                        }
                        if (val.caste === 'OC') {
                            oc++;
                        }
                        if (val.caste === 'FC') {
                            fc++;
                        }
                        if(val.gender==='MALE'){
                            male++;
                        }
                        if(val.gender==='FEMALE'){
                            female++;
                        }
                        if (val.religion ==='CHRISTIAN'){
                            christian++;
                        }
                        if (val.religion ==='HINDU'){
                            hindu++
                        }
                        if (val.religion ==='MUSLIM'){
                            muslim++
                        }
                    }
                }

                db.query("select count(add_no) as total from student where std=?and sec=?", [std, sec], function (err, result1) {
                    if (err) {
                        console.log(err)
                    } else {
                        let totalstudents = result1[0].total
                        page = 'edit-student';
                        let tcast = sca + st + sc + mbc + bcm + bc + oc + fc + others;
                        others = totalstudents-tcast;
                        let listoff = { sca, st, sc, mbc, bcm, bc, oc, fc, others,male,female,christian,muslim,hindu}
                        res.render(page, {listoff,'list': result, 'title': "Edit A Student", 'std': std, 'sec': sec, "total": totalstudents });
                    }
                });
            }
        }
    });
});

router.get('/modify/:add/:sname', authenticationMiddleware(), function (req, res) {
    let add_no=req.params.add;
    let name = req.params.sname.trim();
    // console.log(add_no+" \t "+ name);

    db.query("SELECT * FROM `student` WHERE `add_no`= ? and name = ?",[add_no,name], function (err, result) {
        if (err)
        {
            console.log(err);
        }else
        {
            // console.log(result);
            res.render('editspecial', {'title': "Edit Student",'list':result[0]});
        }
    });
});

router.post('/update/:addno', function (req, res) {
    let old_id=req.params.addno;
    let name = req.body.sname.toUpperCase();
    let bg = req.body.blood_group.toUpperCase();
    let exno = req.body.exam_no.toUpperCase();
    let add_no = req.body.add_no.toUpperCase();
    let std = req.body.sstd.toUpperCase();
    let sec = req.body.ssec.toUpperCase();
    let emis = req.body.emis;
    let aadhar = req.body.aadhar;
    let dob = req.body.dob;
    let gender = req.body.gender.toUpperCase();
    let fname = req.body.fname.toUpperCase();
    let foc = req.body.foc.toUpperCase();
    let mname = req.body.mname.toUpperCase();
    let moc = req.body.moc.toUpperCase();
    let mob1 = req.body.mob1;
    let mob2 = req.body.mob2;
    let address = req.body.address.toUpperCase();
    let religion = req.body.religion.toUpperCase();
    let caste = req.body.caste.toUpperCase();
    let community = req.body.Community.toUpperCase();

    let img=name+'-'+add_no;
    db.query("SELECT * FROM `student` WHERE `add_no`= ?",[old_id], function (err, result1) {
        if (err)
        {
            console.log(err);
        }else
        {
            // console.log(result1[0].name)
            // console.log(result1[0].add_no)
            let fnn=result1[0].name+"-"+result1[0].add_no;
            let loc='./public/uploads/'+fnn+".jpg";
            let newloc='./public/uploads/'+name+'-'+add_no+'.jpg';
            // console.log("\nloc:\t"+loc)
            // console.log("\nnew loc:\t"+newloc)
            // console.log(result1);
            fs.rename(loc, newloc, function(err) {
                if ( err ) console.log('ERROR: ' + err);
            });

            db.query("UPDATE student SET name=?,bg=?,exno=?,add_no=?,std=?,sec=?,emis=?,aadhar=?,dob=?,gender=?,fname=?,foc=?,mname=?,moc=?,mob1=?,mob2=?,address=?,religion=?,caste=?,community=?,img=? WHERE add_no = ? ", [name,bg,exno,add_no,std,sec,emis,aadhar,dob,gender,fname,foc,mname,moc,mob1,mob2,address,religion,caste,community,img,old_id], function (err, result) {
                if (err)
                {
                    console.log(err);
                }else
                {
                    // console.log(result);
                    res.redirect('/students/edit/'+std+'/'+sec);
                }
            });
        }
    });
});


router.get('/delete/:add_no/:sname', authenticationMiddleware(), function (req, res) {
    let add_no = req.params.add_no;
    let name = req.params.sname;
    // console.log(add_no+'\n'+name);

    db.query("DELETE FROM `student` WHERE `add_no` = ? AND `name` = ?",[add_no,name], function (err) {
        if(err){
            res.send("ERROR in Deleting student..");
        }else {
            res.redirect('/students/show');
        }
    });
});

router.get("/atnd-report/:std/:sec", authenticationMiddleware(), function (req, res) {
    let std = req.params.std.toUpperCase();
    let sec = req.params.sec.toUpperCase();
    res.render("atnd-report", {
        "sec": sec,
        "std": std
    });
});

router.get("/report/:std/:sec", authenticationMiddleware(), function (req, res) {
    let std = req.params.std.toUpperCase();
    let sec = req.params.sec.toUpperCase();
    res.render("student-report", {
        "sec": sec,
        "std": std
    });
});

module.exports = router;
