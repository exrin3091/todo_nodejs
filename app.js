const express = require("express")
const app = express()
const port = 3000
const mongoose = require('mongoose')
const TodoTask = require("./models/todoTask")
const UserList = require("./models/userList")

var moment=require('moment')

mongoose.connect('mongodb+srv://ina3213:CS177143@cluster0.jaeynv1.mongodb.net/')
.then(()=> console.log('connect'))
.catch((error) => {throw error})

app.listen(port, () =>{
    console.log(`App listening at http://localhost:${port}`)
})

//body-parser설정, qs모듈을 사용
app.use(express.urlencoded({extended: true}))
//public 디렉토리에서 정적 파일을 제공
app.use('/public',express.static(__dirname + '/public'))
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
    TodoTask.find({}, null, {sort:{date:-1}})
    .then(tasks => {
        res.render("index", {todoTasks: tasks});
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

app.post("/write", async function(req, res){
    try{
        const todoTask = new TodoTask({ //새로운 TodoTask를 만들어서 todoTask에 저장
            content: req.body.content, //입력한 부분
            date: moment().format("YYYY-MM-DD HH:mm:ss"), //현재 시간
            user: "test"
        });
        await todoTask.save(); //save()를 통해 db에 저장
        console.log("==== Success!! Save New TodoTask ====");
        console.table([{id: todoTask._id, content: todoTask.content, date: todoTask.date}]);
        res.redirect("/");
    }catch(error){
        console.error("==== Fail!! Save TodoTask ====");
        res.redirect("/");
    } 
})

app.post("/remove/:id", async function(req, res){
    const id = req.params.id;

    try{
        await TodoTask.deleteOne({_id : id})

        console.log("==== Success!! Remove TodoTask ====");
        console.log("id: " + id);
        res.redirect("/");

    } catch(error){
        console.log("==== Fail!! Remove TodoTask ====")
        console.error(error);
        res.status(500).send("Internal Server Error");
    }  
})