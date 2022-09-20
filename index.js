const child_process = require("child_process")
const cheerio       = require("cheerio")
const express       = require("express")
const http          = require("http")
const fs            = require("fs")

const PORT          = 8001
const app           = express()
const jsonTools     = express.json()
app.use(jsonTools)

const view = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
        <style>
            body{
                display:grid; 
                justify-content: center;
                background: #161b22;
            }
            input{
                width: 200px;
                height: 50px;
                padding: 5px;
            }
            button{
                width: 100px;
                height: 50px;
                padding: 5px;
            }
            #container{
                display: grid;
                grid-gap: 0px;
                width: 100%;
                justify-content: center;
                grid-template-columns: auto auto;
                margin-top: 10px;
            }
            h1{
                text-align:center;
                color: #8e949b;
            }	
            h2{
                text-align:center;
                color: #8e949b;
            }
        </style>
        </head><body><div id="container">
            <input id="input" <="" input="">
            <button id="search" onclick="searchYoutube()">search</button>
        </div>
        <h1 id="title"></h1>
        <h2>videos</h2><h2>
            <div id="videos"></div>
        </h2><h2>playlists</h2><h2>
            <div id="playlists"></div>
        <script>
        
        async function searchYoutube(){
            const value  = document.getElementById("input").value
            const res    = await fetch("/api/search?item="+value)
            const result = await res.json()
            
            document.getElementById("title").innerHTML     = value
            document.getElementById("input").value         = ''
            
            document.getElementById("videos").innerHTML    = String(result['listofembeddivs']['videos'])
            document.getElementById("playlists").innerHTML = String(result['listofembeddivs']['playlists'])
            

        }
        
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault()
                document.getElementById("search").click()
            }
        })
        </script>
    `

function searchYoutube(query){
    const url = "https://www.youtube.com/results?search_query=" + query.replace(/ /g,"+")
    const videos    = []
    const playlists = []
    return {"listofembeddivs":{"videos":videos,"playlists":playlists}}
}

app.get("/api/search", async (req,res)=>{
    const query = req.query.item
    res.send(searchYoutube(query))
})

app.get("/*",(req,res)=>{
    res.send(view)
})

const server = http.createServer(app)
server.listen(PORT, ()=>{
    console.log(`Listening at port ${PORT}`)
})