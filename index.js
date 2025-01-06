import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import to_base_62 from "./utility.js";
import {v4 } from 'uuid';
import client from './database.js';
const PORT = process.env.PORT||2000;
const app = express();

app.use(cors());
app.use(express.json());

app.post('/shorten',async (req,res)=>{
    const longUrl = req.body.longurl;
    if(!longUrl){
        return res.status(400).json({error:"Please provide a long url"});
    }
    client.query('SELECT * FROM url WHERE longurl = $1',[longUrl],(err,result)=>{
        if(err){
            return res.status(500).json({error:"Internal Server Error"});
        }
        if(result.rows.length===0){
            const shortcode = to_base_62(Math.random()*10000000000000000);
            console.log(shortcode);
            const shortUrl = `${process.env.BASE_URL}/${shortcode}`;
            client.query('INSERT INTO url(longurl,shorturl) VALUES($1,$2) RETURNING *',[longUrl,shortUrl],(err,result)=>{
                if(err){
                    return res.status(500).json({error:"Internal Server Error"});
                }
                res.status(201).json(result.rows[0]);
            });
        }
        else{
            res.status(200).json(result.rows[0]);
        }
    });
})

app.get('/:shortcode',async (req,res)=>{
    const shortcode = req.params.shortcode;
    client.query('SELECT * FROM url WHERE shorturl = $1',[`${process.env.BASE_URL}/${shortcode}`],(err,result)=>{
        if(err){
            return res.status(500).json({error:"Internal Server Error"});
        }
        if(result.rows.length === 0){
            return res.status(404).json({error:"Shortcode not found"});
        }else{
            res.redirect(result.rows[0].longurl);
        }
    })
}
)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})