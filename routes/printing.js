let express = require("express");
let router = express.Router();

let Pagination = require("./pagination");

const db = require('./db.js');
let puppeteer = require("puppeteer");
let merge = require("easy-pdf-merge");
let fs = require("fs");
let moment = require("moment");
let datesBetween = require("dates-between");

let authenticationMiddleware = require('./authentication.js').authenticationMiddleware;

//declaration
let ppa = __dirname;
ppa = ppa.slice(0, -6);
let std, sec;
let pdfUrls = [];
let names = [];
let files2gather = [];
let ppage = 0;

let year;
let next_yr;

// router.get("*",(req,res)=>{
//   res.send(`Under Construction <br> <button onclick="window.history.go(-1); return false;">Back</button>`)
// })

router.get("/year/:yr/:std/:sec/:page",authenticationMiddleware(), (req, res)=>{
  pdfUrls = []
  names = [];
  files2gather = [];
  let std = req.params.std;
  let sec = req.params.sec;
  let pg = req.params.page;
  year = req.params.yr;
  next_yr = parseInt(year) + 1;
  // console.log("year.  "+year);
  res.redirect("/report/" + std + "/" + sec + "/" + pg)
});

router.get("/:std/:sec/:page",authenticationMiddleware(),(req, res)=>{
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  let nopg = req.params.page;

  let sca = 0,
    st = 0,
    sc = 0,
    mbc = 0,
    bcm = 0,
    bc = 0,
    oc = 0,
    fc = 0,
    others = 0,
    male = 0,
    female = 0,
    christian = 0,
    muslim = 0,
    hindu = 0;
  // console.log("year: \t"+year);
  // console.log("next year: \t"+next_yr);
  (page_id = parseInt(req.params.page)),
  (currentPage = page_id > 0 ? page_id : currentPage),
  (pageUri = "/report/" + std + "/" + sec + "/");

  db.query("SELECT COUNT(add_no) as totalCount FROM student where std=? and sec=?", [std, sec], function(err, result) {
    let perPage = 5,
      totalCount = result[0].totalCount;

    let Paginate = new Pagination(totalCount, currentPage, pageUri, perPage);

    let countdet = "not ok";
    if (Paginate.pageCount === parseInt(nopg)) {
      // console.log("last page reached");
      countdet = "ok";
    } else {
      // console.log("not the last page");
      countdet = "not ok";
    }
    ppage = Paginate.pageCount;
    /*Query items*/
    db.query(
      "SELECT * FROM student where std=? and sec=? order by name LIMIT " +
      Paginate.perPage +
      " OFFSET " +
      Paginate.offset, [std, sec],function(err, result){
        if (err) {
          console.log("err :\n" + err);
        }
        // console.log(result);
        for (let key in result) {
          if (result.hasOwnProperty(key)) {
            let val = result[key];
            val.dob = moment(val.dob, "YYYY-MM-DD").format("DD-MMM-YYYY").toUpperCase();
            if (val.community === 'SCA') {
              sca++;
            }
            if (val.community === 'SC') {
              sc++;
            }
            if (val.community === 'ST') {
              st++;
            }
            if (val.community === 'MBC') {
              mbc++;
            }
            if (val.community === 'BCM') {
              bcm++;
            }
            if (val.community === 'BC') {
              bc++;
            }
            if (val.community === 'OC') {
              oc++;
            }
            if (val.community === 'FC') {
              fc++;
            }
            if (val.gender === 'MALE') {
              male++;
            }
            if (val.gender === 'FEMALE') {
              female++;
            }
            if (val.religion === 'CHRISTIAN') {
              christian++;
            }
            if (val.religion === 'HINDU') {
              hindu++
            }
            if (val.religion === 'MUSLIM') {
              muslim++
            }
          }
        }
          let tcast = sca + st + sc + mbc + bcm + bc + oc + fc + others;
        others = Paginate.totalCount - tcast;

        data = {
          items: result,
          pages: Paginate.links(),
          pageCount: Paginate.pageCount,
          last: countdet,
          year:year,
          std:std,
          sec:sec,
          start: Paginate.offset,
          sca:sca,
          st:st,
          sc:sc,
          mbc:mbc,
          bcm:bcm,
          bc:bc,
          oc:oc,
          fc:fc,
          others:others,
          male:male,
          female:female,
          christian:christian,
          muslim:muslim,
          hindu:hindu
        };
        // Send data to view
        res.render("STUDENTSPARTICULARS", data);
      }
    );
  });
});

router.get("/print/:count/:std/:sec", authenticationMiddleware(), (req, res)=>{
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  count = req.params.count;
  // console.log("count: \t"+count)
  // console.log("year: \t"+year);
  // console.log("next year: \t"+next_yr);
  let pagesisay;

  if (count > 1){
    // pagesisay = "/report/mergefile";
    for (let i = 0; i < ppage; i++) {
      let str = "http://127.0.0.1:"+global.port+"/report/" + std + "/" + sec + "/" + (i + 1);
      pdfUrls.push(str);
      let fn = ppa + "public/pdf/sample";
      names.push(fn + i + ".pdf");
      pp = async () => {
        let browser = await puppeteer.launch({headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox']});
        let page = await browser.newPage();
        for (let i = 0; i < pdfUrls.length; i++) {
          await page.goto(pdfUrls[i], {
            waitUntil: "networkidle2"
          });
          let pdfFileName = ppa + "public/pdf/sample" + i + ".pdf";

          await page.pdf({
            path: pdfFileName,
            format: "legal"
          });
        }
        await browser.close();
      }
      pp()
      .then(()=>{
        res.redirect('/report/mergefile');
      })
      .catch((e)=>{
        if(e){
          console.log(e);
        }
      })
    }
  }else{
    // pagesisay = "/report/daily1/" + std + "/" + sec + "/1/page1/1";
    files2gather.push(ppa + "public/pdf/final.pdf");
    let str = "http://127.0.0.1:"+global.port+"/report/" + std + "/" + sec + "/" + 1;
    // pdfUrls.push(str);
    let fn = ppa + "public/pdf/final";
    names.push(fn + ".pdf");
    async function print() {
      let browser = await puppeteer.launch({headless: true,args:['--no-sandbox', '--disable-setuid-sandbox']});
      let page = await browser.newPage();
      page.on('error', err => {
        console.log('error happen at the page: ', err);
        throw err
      });
      // console.log(pdfUrls)
      // for (let i = 0; i < pdfUrls.length; i++) {
        await page.goto(str, {
          waitUntil: "networkidle2"
        });
        let pdfFileName = ppa + "public/pdf/final.pdf";

        await page.pdf({
          path: pdfFileName,
          format: "legal"
        });
      // }
      await browser.close();
      await res.redirect("/report/daily1/" + std + "/" + sec + "/1/page1/1");
    }
    print();
  }
});

router.get("/mergefile", authenticationMiddleware(), (req, res) =>{
  merge(names, ppa + "public/pdf/final.pdf", function (err) {
    if (err) {
      return err
    } else {
      // console.log("Success");
      for (let i = 0; i < pdfUrls.length; i++) {
        fs.unlink(names[i], function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
      files2gather.push(ppa + "public/pdf/final.pdf");
      res.redirect("/report/daily1/" + std + "/" + sec + "/1/page1/1");
    }
  });
});

let currentmonth = "";
router.get("/daily1/:std/:sec/:mon/page1/:count", authenticationMiddleware(), (req, res) =>{
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  let c = req.params.mon;
  let nopg = req.params.count;
  // console.log("year: \t"+year);
  // console.log("next year: \t"+next_yr);
  switch (parseInt(c)) {
    case 1:
      {
        currentmonth = "JUNE";
      }
      break;
    case 2:
      {
        currentmonth = "JULY";
      }
      break;
    case 3:
      {
        currentmonth = "AUGUST";
      }
      break;
    case 4:
      {
        currentmonth = "SEPTEMBER";
      }
      break;
    case 5:
      {
        currentmonth = "OCTOBER";
      }
      break;
    case 6:
      {
        currentmonth = "NOVEMBER";
      }
      break;
    case 7:
      {
        currentmonth = "DECEMBER";
      }
      break;
    case 8:
      {
        year = next_yr
        currentmonth = "JANUARY";
      }
      break;
    case 9:
      {
        year = next_yr
        currentmonth = "FEBRUARY";
      }
      break;
    case 10:
      {
        year = next_yr
        currentmonth = "MARCH";
      }
      break;
    case 11:
      {
        year = next_yr
        currentmonth = "APRIL";
      }
      break;
  }
  (page_id = parseInt(req.params.count)),
  (currentPage = page_id > 0 ? page_id : currentPage),
  (pageUri = "/report/daily1/" + std + "/" + sec + "/" + c + "/page1/");

  db.query("SELECT COUNT(add_no) as totalCount FROM student where std=? and sec=?", [std, sec], (err, result) => {
    let perPage = 30,
      totalCount = result[0].totalCount;

    let Paginate = new Pagination(totalCount, currentPage, pageUri, perPage);

    ppage = Pagination.pageCount;
    let countdet = "not ok";
    if (Paginate.pageCount === parseInt(nopg)) {
      // console.log("last page reached");
      countdet = "ok";
    } else {
      // console.log("not the last page");
      countdet = "not ok";
    }

    db.query(
      "SELECT * FROM student where std=? and sec=? order by name LIMIT " +
      Paginate.perPage +
      " OFFSET " +
      Paginate.offset, [std, sec],function(err, result){
        if (err) {
          console.log("err :\n" + err);
        } else {
          str = [];
          let date = gendate(parseInt(c), year);
          // console.log(date.length);
          for (let i = 0; i < date.length; i++) {
            str[i] = moment(date[i]).format("DD-MMM-YYYY-ddd");
            if (moment(date[i]).format("ddd") === "Sun") {
              sun[i] = moment(date[i]).format("DD-MMM-YYYY");
            }
          }
          let cc = [];
          for (let i = 0; i < 15; i++) {
            if (str[i].match("Sun")) {
              cc.push("Sun");
            } else {
              cc.push("a");
            }
          }
          // console.log(str.length);
          data = {
            items: result,
            pages: Paginate.links(),
            pageCount: Paginate.pageCount,
            month: currentmonth,
            year: year,
            std:std,
            sec:sec,
            start: Paginate.offset
          };
          res.render("daily-right", {
            data: data,
            start: str.length,
            days: cc,
            last: countdet
          });
        }
      }
    );
  });
});

router.get("/daily2/:std/:sec/:mon/page2/:count", function (req, res) {
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  c = req.params.mon;
  let nopg = req.params.count;
  // console.log("year: \t"+year);
  // console.log("next year: \t"+next_yr);
  switch (parseInt(c)) {
    case 1:
      {
        currentmonth = "JUNE";
      }
      break;
    case 2:
      {
        currentmonth = "JULY";
      }
      break;
    case 3:
      {
        currentmonth = "AUGUST";
      }
      break;
    case 4:
      {
        currentmonth = "SEPTEMBER";
      }
      break;
    case 5:
      {
        currentmonth = "OCTOBER";
      }
      break;
    case 6:
      {
        currentmonth = "NOVEMBER";
      }
      break;
    case 7:
      {
        currentmonth = "DECEMBER";
      }
      break;
    case 8:
      {
        year = next_yr
        currentmonth = "JANUARY";
      }
      break;
    case 9:
      {
        year = next_yr
        currentmonth = "FEBRUARY";
      }
      break;
    case 10:
      {
        year = next_yr
        currentmonth = "MARCH";
      }
      break;
    case 11:
      {
        year = next_yr
        currentmonth = "APRIL";
      }
      break;
  }

  (page_id = parseInt(req.params.count)),
  (currentPage = page_id > 0 ? page_id : currentPage),
  (pageUri = "/report/daily2/" + std + "/" + sec + "/" + c + "/page2/");

  db.query("SELECT COUNT(add_no) as totalCount FROM student where std=? and sec=?", [std, sec], (err, result) => {
    let perPage = 30,
      totalCount = result[0].totalCount;

    let Paginate = new Pagination(totalCount, currentPage, pageUri, perPage);

    ppage = Pagination.pageCount;

    let countdet = "not ok";
    if (Paginate.pageCount === parseInt(nopg)) {
      // console.log("last page reached");
      countdet = "ok";
    } else {
      // console.log("not the last page");
      countdet = "not ok";
    }
    db.query(
      "SELECT * FROM student where std=? and sec=? order by name LIMIT " +
      Paginate.perPage +
      " OFFSET " +
      Paginate.offset, [std, sec],function(err, result){
        if (err) {
          console.log("err :\n" + err);
        } else {
          let d = gendate(parseInt(c), year);
          str = [];
          for (let i = 0; i < d.length; i++) {
            str[i] = moment(d[i]).format("DD-MMM-YYYY-ddd");
            if (moment(d[i]).format("ddd") == "Sun") {
              sun[i] = moment(d[i]).format("DD-MMM-YYYY");
            }
          }
          if (moment([year]).isLeapYear()) {
            if (moment(year + "-02-29").isValid()) {
              let d = moment(year + "-02-29").format("DD-MMM-YYYY-ddd");
              str.push(d);
            }
          }
          if (c === 2 && moment([year]).isLeapYear()) {
            if (moment(year + "-02-29").isValid()) {
              let d = moment(year + "-02-29").format("DD-MMM-YYYY-ddd");
              str.push(d);
            }
          }
          let cc = [];
          for (let i = 15; i < str.length; i++) {
            if (str[i].match("Sun")) {
              cc.push("Sun");
            } else {
              cc.push("a");
            }
          }
          data = {
            items: result,
            pages: Paginate.links(),
            pageCount: Paginate.pageCount,
            month: currentmonth,
            year: year,
            std:std,
            sec:sec,
            start: Paginate.offset
          };
          res.render("daily-left", {
            data: data,
            start: str.length,
            days: cc,
            last: countdet
          });
        }
      }
    );
  });
});

router.get("/daily/print/daily/:totalpage", authenticationMiddleware(), (req, res,) =>{
  pdfUrls = [];
  names = [];
  let totalpage = req.params.totalpage;
  for (let j = 1; j < 12; j++) {
    for (let i = 0; i < totalpage; i++) {
      for (let x = 1; x <= 2; x++) {
        let str = "http://127.0.0.1:"+global.port+"/report/daily" + x + "/" + std + "/" + sec + "/" + j + "/page" + x + "/" + (i + 1);
        pdfUrls.push(str);
      }
    }
  }
  // console.log(pdfUrls)
  for (let i = 0; i < pdfUrls.length; i++) {
    let fn = ppa + "public/pdf/dayssample";
    names.push(fn + i + ".pdf");
  }

  pp = async ()=>{
    let browser = await puppeteer.launch({headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox']});
    let page = await browser.newPage();
    for (let i = 0; i < pdfUrls.length; i++) {
      await page.goto(pdfUrls[i], {
        waitUntil: "networkidle2"
      });
      let pdfFileName = "dayssample" + i + ".pdf";
      await page.pdf({
        path: ppa + "public/pdf/" + pdfFileName,
        format: "legal"
      });
    }
    await browser.close();
  }
  pp()
  .then(()=>{
    res.redirect("/report/mergefile/days/" + std + "/" + sec);
  })
  .catch((e)=>{
    if(e){
      console.log(e);
    }
  })
});

router.get("/mergefile/days/:std/:sec", authenticationMiddleware(), (req, res) => {
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  merge(names, ppa + "public/pdf/daysfinal.pdf", function (err) {
    if (err) {
      return err
    } else {
      // console.log("Success");
      for (let i = 0; i < pdfUrls.length; i++) {
        fs.unlink(names[i], function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
      files2gather.push(ppa + "public/pdf/daysfinal.pdf");
      res.redirect("/report/console-1/"+std+"/"+sec+'/1');
      // res.redirect("/report/merge/finished-a-class/" + std + "/" + sec);
    }
  });
});

router.get("/console-1/console-2/print/:std/:sec/:totalpage",authenticationMiddleware(),(req,res)=>{
  pdfUrls = [];
  names = [];
  const std= req.params.std;
  const sec = req.params.sec;
  let totalpage = req.params.totalpage;
    for (let i = 0; i < totalpage; i++) {
      for (let x = 1; x <= 2; x++) {
        let str = "http://localhost/report/console-"+x+"/"+std + "/" + sec + "/" + (i + 1);
        pdfUrls.push(str);
      }
  }

  for (let i = 0; i < pdfUrls.length; i++) {
    let fn = ppa + "public/pdf/consol";
    names.push(fn + i + ".pdf");
  }

  pp = async ()=>{
    let browser = await puppeteer.launch({headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox']});
    let page = await browser.newPage();
    for (let i = 0; i < pdfUrls.length; i++) {
      await page.goto(pdfUrls[i], {
        waitUntil: "networkidle2"
      });
      let pdfFileName = "consol" + i + ".pdf";
      await page.pdf({
        path: ppa + "public/pdf/" + pdfFileName,
        format: "legal"
      });
    }
    await browser.close();
  }
  pp()
  .then(()=>{
    res.redirect("/report/mergefile/consol/" + std + "/" + sec);
  })
  .catch((e)=>{
    if(e){
      console.log(e);
    }
  })
})


router.get('/console-1/:std/:sec/:count',authenticationMiddleware(),(req,res)=>{
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  let c = req.params.mon;
  let nopg = req.params.count;
  
  (page_id = parseInt(req.params.count)),
  (currentPage = page_id > 0 ? page_id : currentPage),
  (pageUri = "/console-1/" + std + "/" + sec + "/");

  db.query("SELECT COUNT(add_no) as totalCount FROM student where std=? and sec=?", [std, sec], (err, result) => {
    let perPage = 30,
      totalCount = result[0].totalCount;

    let Paginate = new Pagination(totalCount, currentPage, pageUri, perPage);

    ppage = Pagination.pageCount;
    let countdet = "not ok";
    if (Paginate.pageCount === parseInt(nopg)) {
      // console.log("last page reached");
      countdet = "ok";
    } else {
      // console.log("not the last page");
      countdet = "not ok";
    }

    db.query(
      "SELECT * FROM student where std=? and sec=? order by name LIMIT " +
      Paginate.perPage +
      " OFFSET " +
      Paginate.offset, [std, sec],function(err, result){
        if (err) {
          console.log("err :\n" + err);
        } else {
          data = {
            items: result,
            pages: Paginate.links(),
            pageCount: Paginate.pageCount,
            year: `${year-1} - ${next_yr}`,
            std:std,
            sec:sec,
            start: Paginate.offset
          };
          res.render("consolidate-right", {
            data: data,
            last: countdet
          });
        }
      }
    );
  });
})

router.get('/console-2/:std/:sec/:count',authenticationMiddleware(),(req,res)=>{
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  let c = req.params.mon;
  let nopg = req.params.count;
  
  (page_id = parseInt(req.params.count)),
  (currentPage = page_id > 0 ? page_id : currentPage),
  (pageUri = "/console-2/" + std + "/" + sec + "/");

  db.query("SELECT COUNT(add_no) as totalCount FROM student where std=? and sec=?", [std, sec], (err, result) => {
    let perPage = 30,
      totalCount = result[0].totalCount;

    let Paginate = new Pagination(totalCount, currentPage, pageUri, perPage);

    ppage = Pagination.pageCount;
    let countdet = "not ok";
    if (Paginate.pageCount === parseInt(nopg)) {
      // console.log("last page reached");
      countdet = "ok";
    } else {
      // console.log("not the last page");
      countdet = "not ok";
    }

    db.query(
      "SELECT * FROM student where std=? and sec=? order by name LIMIT " +
      Paginate.perPage +
      " OFFSET " +
      Paginate.offset, [std, sec],function(err, result){
       if (err) {
          console.log("err :\n" + err);
        } else {
          data = {
            items: result,
            pages: Paginate.links(),
            pageCount: Paginate.pageCount,
            year: `${year-1} - ${next_yr}`,
            std:std,
            sec:sec,
            start: Paginate.offset
          };
          res.render("consolidate-left", {
            data: data,
            last: countdet
          });
        }
      }
    );
  });
})

router.get("/mergefile/consol/:std/:sec", authenticationMiddleware(), (req, res) => {
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  merge(names, ppa + "public/pdf/consol.pdf", function (err) {
    if (err) {
      return err
    } else {
      // console.log("Success");
      for (let i = 0; i < pdfUrls.length; i++) {
        fs.unlink(names[i], function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
      files2gather.push(ppa + "public/pdf/consol.pdf");
      res.redirect("/report/merge/finished-a-class/" + std + "/" + sec);
    }
  });
});


router.get("/merge/finished-a-class/:std/:sec", authenticationMiddleware(), (req, res) =>{
  std = req.params.std.toUpperCase();
  sec = req.params.sec.toUpperCase();
  year = year - 1;
  let filename = ppa + "public/pdf/" + std + "-" + sec + "-" + year + ".pdf"
  // console.log(files2gather);
  merge(files2gather, filename, function (err) {
    if (err) {
      return console.log(err);
    } else {
      // console.log("Success");
      for (let i = 0; i < files2gather.length; i++) {
        fs.unlink(files2gather[i], function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
      pdfUrls = []
      names = [];
      files2gather = [];
      res.redirect("/download");
    }
  });
});

//dates generation yyyy - mm - dd
function gendate(c, year) {
  let startDate, endDate;
  switch (c) {
    case 1:
      {
        startDate = new Date(year + "-06-01");
        endDate = new Date(year + "-06-30");
      }
      break;
    case 2:
      {
        startDate = new Date(year + "-07-01");
        endDate = new Date(year + "-07-31");
      }
      break;
    case 3:
      {
        startDate = new Date(year + "-08-01");
        endDate = new Date(year + "-08-31");
      }
      break;
    case 4:
      {
        startDate = new Date(year + "-09-01");
        endDate = new Date(year + "-09-30");
      }
      break;
    case 5:
      {
        startDate = new Date(year + "-10-01");
        endDate = new Date(year + "-10-31");
      }
      break;
    case 6:
      {
        startDate = new Date(year + "-11-01");
        endDate = new Date(year + "-11-30");
      }
      break;
    case 7:
      {
        startDate = new Date(year + "-12-01");
        endDate = new Date(year + "-12-31");
      }
      break;
    case 8:
      {
        startDate = new Date(year + "-01-01");
        endDate = new Date(year + "-01-31");
      }
      break;
    case 9:
      {
        startDate = new Date(year + "-02-01");
        endDate = new Date(year + "-02-28");
      }
      break;
    case 10:
      {
        startDate = new Date(year + "-03-01");
        endDate = new Date(year + "-03-31");
      }
      break;
    case 11:
      {
        startDate = new Date(year + "-04-01");
        endDate = new Date(year + "-04-30");
      }
      break;
  }
  str = [];
  sun = [];
  let date = Array.from(datesBetween(startDate, endDate));
  return date;
}

module.exports = router;
