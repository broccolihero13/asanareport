//dependencies
const req = require('request');
const fs = require('fs');
let getToken = process.env.asanaTok;
//user variables
let projectID = ``;
let token = `Bearer ${getToken}`;
let projectUrl = `https://app.asana.com/api/1.0/projects/384181481773069/tasks`;
let url = `https://app.asana.com/api/1.0/tasks/515637204541674`;

let callPromise = new Promise((resolve, reject)=>{
  let allTasks = [];
  let getTasks = ()=>{
    req({
      url: url,
      headers: {
        Authorization: token
      },
      json: true
    }, (error, response, body)=>{
      if(error){
        reject(`Could not reach Gauge servers: ${error}`)
      } else if (response.statusCode != "200") {
        reject(`Something went wrong with the API call, it returned with a ${response.statusCode} status code.`)
      } else {
        // body.forEach((task)=>{
        //   allTasks.push(task);
        // })
        // resolve(allTasks)
        resolve(body);
      }
    }) 
  }
  getTasks();
})
callPromise.then((response)=>{
  console.log(response);
  console.log('finished');
});