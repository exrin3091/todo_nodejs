const express = require("express")
const session = require("express-session")
const app = express()
const mongoose = require('mongoose')
const TodoTask = require("./models/todoTask")
const UserList = require("./models/userList")

var moment = require('moment')
var path = require('path')
require("dotenv").config()

mongoose.connect('mongodb+srv://ina3213:' + process.env.DB_PASS + '@cluster0.jaeynv1.mongodb.net/')
.then(()=> console.log('connect'))
.catch((error) => {throw error})

app.listen(process.env.PORT, () =>{
    console.log(`App listening at http://localhost:${process.env.PORT}`)
})

//body-parser설정, qs모듈을 사용
app.use(express.urlencoded({extended: true}))
//public 디렉토리에서 정적 파일을 제공
app.use('/public',express.static(__dirname + '/public'))
app.use('/node_modules', express.static(path.join(__dirname + '/node_modules')))

app.use(session({
    secret: "lilalila", // 세션 암호화를 위한 비밀 키
    resave: false, // 세션을 항상 저장할 지 여부
    saveUninitialized: true // 초기화되지 않은 세션도 저장할 지 여부
}))
//view 엔진을 ejs로 설정
app.set("view engine", "ejs")

//----------------------------------------------

app.get("/", (req,res)=>{
    res.render("login");
})

app.get("/register", (req, res)=>{
    res.render("signup");
})

app.get("/todo", (req, res)=>{
    TodoTask.find({user: req.session.user}, null, {sort:{date:-1}})
    .then(tasks => {
        res.render("todos", {todoTasks: tasks, username: req.session.user});
    })
    .catch(error => {
        console.error(error);
        return res.status(500).send(error);
    });
})

app.post("/signin", async function(req, res){
    try{
        const userData = new UserList({
            name: req.body.reg_name, 
            id: req.body.reg_id, 
            pw: req.body.reg_pw
        })
        await userData.save()
        console.log("==== Success!! Save New User ====");
        res.redirect("/");
    }
    catch(error){
        console.error("==== Fail!! Save New User ====");
        res.redirect("/register")
    }
})

app.post("/login", (req, res)=>{
    const loginID = req.body.login_id
    const loginPW = req.body.login_pw

    UserList.find({id: loginID, pw: loginPW})
    .then((user)=>{
        if(user.length === 1){
            req.session.user = req.body.login_id
            res.redirect("/todo")
            console.log(req.session.user, "로그인 성공")
        }else{
            console.error("로그인 실패")
            res.send("<script>alert('회원 정보가 없습니다');window.location.replace('/');</script>");
        }
        
    })
    .catch(error=>{
        console.error(error);
        return res.status(500).send(error);
    })
})

app.post("/write", async function(req, res){
    try{
        const todoTask = new TodoTask({ //새로운 TodoTask를 만들어서 todoTask에 저장
            content: req.body.content, //입력한 부분
            date: moment().format("YYYY-MM-DD"), //현재 시간
            user: req.session.user
        });
        await todoTask.save(); //save()를 통해 db에 저장
        console.log("==== Success!! Save New TodoTask ====");
        console.table([{id: todoTask._id, content: todoTask.content, date: todoTask.date, user: todoTask.user}]);
        res.redirect("/todo");
    }catch(error){
        console.error("==== Fail!! Save TodoTask ====");
        res.redirect("/todo");
    } 
})

app.post("/remove/:id", async function(req, res){
    const id = req.params.id;

    try{
        await TodoTask.deleteOne({_id : id})

        console.log("==== Success!! Remove TodoTask ====");
        console.log("id: " + id);
        res.redirect("/todo");

    } catch(error){
        console.log("==== Fail!! Remove TodoTask ====")
        console.error(error);
        res.status(500).send("Internal Server Error");
    }  
})