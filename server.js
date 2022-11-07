const express = require("express");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const multer = require("multer");
//파일업로드 라이브러리 multer

//데이터베이스의 데이터 입력, 출력을 위한 함수명령어 불러들이는 작업
const app = express();
const port = process.env.PORT || 5000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      (file.originalname = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      ))
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return cb(new Error("PNG, JPG, 또는 JPEG만 업로드하세요"));
    }
    cb(null, true);
  },
});

//ejs 태그를 사용하기 위한 세팅
app.set("view engine", "ejs");
//사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({ extended: true }));
//css/img/js를 사용하기 위한 코드
app.use(express.static("public"));
app.use(session({ secret: "secret", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
let flash = require("connect-flash");
app.use(flash());

//데이터베이스 연결작업

let db; //데이터베이스 연결을 위한 변수세팅
MongoClient.connect(
  "mongodb+srv://admin:Qwe3834poi^(@testdb.d3uk0xi.mongodb.net/?retryWrites=true&w=majority",
  function (err, result) {
    //에러가 발생했을경우 메세지 출력(선택사항)
    if (err) return console.log(err);

    //위에서 만든 db변수에 최종연결 ()안에는 mongodb atlas 사이트에서 생성한 데이터베이스 이름
    db = result.db("testdb");

    //db연결이 제대로 되었다면 서버실행
    app.listen(port, function () {
      console.log("서버연결 성공");
    });
  }
);

//회원가입 경로 get 요청
app.get("/join", function (req, res) {
  res.render("join");
});

//회원가입 페이지에서 보내준 데이터를 db에 저장요청
app.post("/joinresult", function (req, res) {
  // db.collection("port1_join").findOne(
  //   { joinname: req.body.username },
  //   function (err, result) {
  //     //db베이스에서 해당 회원닉네임이 존재하는경우
  //     if (result) {
  //       res.send(
  //         "<script>alert('이미 존재하는 닉네임입니다'); location.href='/join'; </script>"
  //       );
  //     } else {
  //       db.collection("port1_join").findOne(
  //         { joinemail: req.body.useremail},
  //         function (err, result) {
  //           //db베이스에서 해당 회원아이디가 존재하는경우
  //           if (result) {
  //             res.send(
  //               "<script>alert('이미 가입된 이메일입니다'); location.href='/join'; </script>"
  //             );
  //           } else {
  //             db.collection("port1_count").findOne(
  //               { name: "회원정보" },
  //               function (err, result) {
  //                 db.collection("port1_join").insertOne(
  //                   {
  //                     joinno: result.joinCount + 1,
  //                     joinname: req.body.username,
  //                     joinemail: req.body.useremail,
  //                     joinpass: req.body.userpass,
  //                     //프로퍼티명 작명하고 값은 이메일,전화번호 값 추가
  //                   },
  //                   function (err, result) {
  //                     db.collection("port1_count").updateOne(
  //                       { name: "회원정보" },
  //                       { $inc: { joinCount: 1 } },
  //                       function (err, result) {
  //                         res.send(
  //                           "<script>alert('회원가입이 완료되었습니다.'); location.href='/login'; </script>"
  //                         );
  //                       }
  //                     );
  //                   }
  //                 );
  //               }
  //             );
  //           }
  //         }
  //       );
  //     }
  //   }
  // );

  db.collection("port1_join").findOne(
    {
      $or: [{ joinname: req.body.username }, { joinemail: req.body.useremail }],
    },
    function (err, result) {
      //db베이스에서 해당 회원아이디가 존재하는경우
      console.log(result);
      if (result) {
        if (result.joinemail === req.body.useremail) {
          res.send(
            "<script>alert('이미 가입된 이메일입니다'); location.href='/join'; </script>"
          );
        } else if (result.joinname === req.body.username) {
          res.send(
            "<script>alert('중복된 이름입니다.'); location.href='/join'; </script>"
          );
        }
      } else {
        db.collection("port1_count").findOne(
          { name: "회원정보" },
          function (err, result) {
            db.collection("port1_join").insertOne(
              {
                joinno: result.joinCount + 1,
                joinname: req.body.username,
                joinemail: req.body.useremail,
                joinpass: req.body.userpass,
              },
              function (err, result) {
                db.collection("port1_count").updateOne(
                  { name: "회원정보" },
                  { $inc: { joinCount: 1 } },
                  function (err, result) {
                    res.send(
                      "<script>alert('회원가입이 완료되었습니다.'); location.href='/login'; </script>"
                    );
                  }
                );
              }
            );
          }
        );
      }
    }
  );
});

//메인페이지 get 요청
app.get("/", function (req, res) {
  res.render("index", { userData: req.user }); //로그인시 회원정보데이터 ejs 파일로 전달
});

//게시글 목록 get 요청
app.get("/brdlist", function (req, res) {
  db.collection("port1_board")
    .find()
    .toArray(function (err, result) {
      res.render("brdlist", { brdData: result });
    });
  //db안에 게시글 콜렉션 찾아서 데이터 전부 꺼내오고 ejs파일로 응답
});

//게시글 작성 페이지 get 요청
app.get("/brdinsert", function (req, res) {
  //게시글 작성페이지 ejs 파일 응답
  res.render("brdinsert", { userData: req.user });
});

//게시글 작성 후 데이터베이스에 넣는 작업 요청
app.post("/add", upload.single("filetest"), function (req, res) {
  console.log(req.file);
  if (req.file) {
    fileUpload = req.file.originalname;
  } else {
    fileUpload = null;
  }

  db.collection("port1_count").findOne(
    { name: "게시판" },
    function (err, result1) {
      db.collection("port1_board").insertOne(
        {
          brdid: result1.totalBoard + 1,
          brdtitle: req.body.title,
          brdcontext: req.body.context,
          brdauther: req.user.joinname,
          brdprice: req.body.price,
          fileName: fileUpload,
        },
        function (err, result2) {
          db.collection("port1_count").updateOne(
            { name: "게시판" },
            { $inc: { totalBoard: 1 } },
            function (err, result3) {
              res.redirect("/brddetail/" + (result1.totalBoard + 1)); //게시글 작성 후 게시글 목록경로 요청
            }
          );
        }
      );
    }
  );
});

//게시글 상세화면 get 요청  /:변수명  작명가능
//db안에 해당 게시글번호에 맞는 데이터만 꺼내오고 ejs파일로 응답
app.get("/brddetail/:no", function (req, res) {
  db.collection("port1_board").findOne(
    { brdid: Number(req.params.no) },
    function (err, result) {
      res.render("brddetail", {
        brdData: result,
        userData: req.user,
      });
    }
  );
});

//마이페이지(회원정보수정) 페이지 요청 경로
app.get("/mypage", function (req, res) {
  res.render("mypage", { userData: req.user });
});

//마이페이지에서 수정한 데이터를 db에 수정반영처리
app.post("/myupdate", function (req, res) {
  //회원정보(ex13_join) 콜렉션에 접근해서 해당 아이디에 맞는
  //비번/닉네임/이메일주소/전화번호 수정한걸 변경처리 updateOne

  //원래는 mypage.ejs파일에서 원래 비밀번호 입력창과 / 변경할 비밀번호 입력창
  //조건문으로 db에 있는 비밀번호와 mypage에서 입력한 원래비밀번호가 일치하면

  //db에 있는 로그인한 유저의 비밀번호값은 findOne으로 찾아와서
  //if(mypage에서 입력한 비번과 db에 있는 비밀번호가 똑같다면)
  db.collection("port1_join").findOne(
    { joinname: req.body.username },
    function (err, result) {
      if (result) {
        //db베이스에 회원 닉네임이 이미 존재하는 경우
        res.send(
          "<script>alert('이미 존재하는 닉네임입니다'); location.href='/mypage';</script>"
        );
      } else {
        db.collection("port1_join").findOne(
          { joinpass: req.user.joinpass },
          function (err, result) {
            if (req.body.passorigin == result.joinpass) {
              db.collection("port1_join").updateOne(
                { joinname: req.user.joinname },
                {
                  $set: {
                    joinname: req.body.username,
                    joinpass: req.body.userpass,
                  },
                },
                function (err, result) {
                  res.send(
                    "<script>alert('회원정보 수정완료'); location.href='/';</script>"
                  );
                }
              );
            } else {
              res.send(
                "<script>alert('현재 비밀번호를 잘못 입력하셨습니다'); location.href='/mypage';</script>"
              );
            }
          }
        );
      }
    }
  );
});

//게시글 수정화면 페이지 get 요청
app.get("/brdupt/:no", function (req, res) {
  //db안에 해당 게시글번호에 맞는 데이터를 꺼내오고 ejs파일로 응답
  db.collection("port1_board").findOne(
    { brdid: Number(req.params.no) },
    function (err, result) {
      res.render("brdupt", {
        brdData: result,
        userData: req.user,
      });
    }
  );
  //input, textarea에다가 작성내용 미리 보여줌
});

app.post("/update", upload.single("filetest"), function (req, res) {
  //db에 해당 게시글 번호에 맞는 게시글 수정처리
  if (req.file) {
    fileUpload = req.file.originalname;
  } else {
    fileUpload = req.body.fileOrigin;
  }

  db.collection("port1_board").updateOne(
    { brdid: Number(req.body.id) },
    {
      $set: {
        brdtitle: req.body.title,
        brdcontext: req.body.context,
        brdauther: req.body.auther,
        fileName: fileUpload,
      },
    },
    //해당 게시글 상세화면 페이지로 이동
    function (err, result) {
      res.redirect("/brddetail/" + req.body.id);
    }
  );
});

//게시글 삭제처리 get 요청
app.get("/delete/:no", function (req, res) {
  //db안에 해당 게시글 번호에 맞는 데이터만 삭제 처리
  db.collection("port1_board").deleteOne(
    { brdid: Number(req.params.no) },
    function (err, result) {
      //게시글 목록페이지로 이동
      res.redirect("/brdlist");
    }
  );
});

//로그인 경로 get 요청
app.get("/login", function (req, res) {
  res.render("login");
});

//로그아웃 경로 get 요청
app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    // 요청 -> 세션제거
    res.clearCookie("connect.sid"); // 응답 -> 본인접속 웹브라우저 쿠키 제거
    res.redirect("/"); // 메인페이지 이동
  });
});

//서브페이지 경로 get 요청
app.get("/subpage", function (req, res) {
  res.render("subpage", { userData: req.user });
});

//로그인 페이지에서 입력한 아이디 비밀번호 검증 처리 요청
app.post(
  "/loginresult",
  passport.authenticate("local", {
    failureRedirect: "/fail",
    failureFlash: true,
  }),
  //실패시 /fail 경로로 요청
  function (req, res) {
    res.render("index", { userData: req.user }); //로그인 성공시 메인페이지로 이동
  }
);

app.get("/fail", function (req, res) {
  // res.render("fail");
  res.send(
    "<script>  alert('아이디나 비밀번호가 잘못되었습니다. 다시 입력해주세요.'); location.href = '/login';</script>"
  );
});

//  /loginresult 경로 요청시 passport.autenticate() 함수구간이 아이디 비번 로그인 검증구간
passport.use(
  new LocalStrategy(
    {
      usernameField: "useremail",
      passwordField: "userpass",
      session: true,
      passReqToCallback: false,
    },
    function (useremail, userpass, done) {
      // console.log(userid, userpass);
      db.collection("port1_join").findOne(
        { joinemail: useremail },
        function (err, result) {
          if (err) return done(err);

          if (!result)
            return done(null, false, {
              message: "존재하지않는 이메일 입니다.",
            });
          if (userpass == result.joinpass) {
            return done(null, result);
          } else {
            return done(null, false, { message: "비밀번호가 틀렸습니다" });
          }
        }
      );
    }
  )
);

//처음 로그인 했을 시 해당 사용자의 아이디를 기반으로 세션을 생성함
//  req.user
passport.serializeUser(function (user, done) {
  done(null, user.joinemail); //서버에다가 세션만들어줘 -> 사용자 웹브라우저에서는 쿠키를 만들어줘
  console.log(user);
});

// 로그인을 한 후 다른 페이지들을 접근할 시 생성된 세션에 있는 회원정보 데이터를 보내주는 처리
// 그전에 데이터베이스 있는 아이디와 세션에 있는 회원정보중에 아이디랑 매칭되는지 찾아주는 작업
passport.deserializeUser(function (id, done) {
  db.collection("port1_join").findOne(
    { joinemail: id },
    function (err, result) {
      done(null, result);
    }
  );
});
