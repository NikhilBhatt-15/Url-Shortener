import postgres from 'pg';

const client  = new postgres.Client(process.env.DATABASE_URI);

client.connect()
.then(()=>{
    console.log("Connected to Postgres");
})
.catch((err)=>{
    console.log(err);
})

export default client;