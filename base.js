//dependencies
const req = require('request');
const fs = require('fs');
let getToken = process.env.asanaTok;
//user variables
let projectID = `384181481773069`;

let token = `Bearer ${getToken}`;
let projectUrl = `https://app.asana.com/api/1.0/projects/${projectID}/tasks`;

let taskArr = [];

let callPromise = new Promise((resolve, reject)=>{
  let getTaskIds = ()=>{
    req({
      url: projectUrl,
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
  getTaskIds();
})

let totalTime = (taskId)=>{
  return new Promise((resolve,reject)=>{
    req({
      url: `https://app.asana.com/api/1.0/tasks/${taskId}`,
      headers: {
        Authorization: token
      },
      json: true
    },(error, response, body)=>{
      if(error){
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

callPromise.then((response)=>{
  response.data.forEach((task)=>{
    taskArr.push(task.id);
  });
  totalTime(taskArr[0]).then((body=>{
    console.log(body.data.custom_fields);
  })).catch((err)=>console.log(err));
}).catch((err)=>console.log(err));