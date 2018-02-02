//dependencies
const req = require('request');
const fs = require('fs');
let getToken = process.env.asanaTok;
//user variables
let projectID = `358074576413536`;

let token = `Bearer ${getToken}`;
let projectUrl = `https://app.asana.com/api/1.0/projects/${projectID}/tasks`;

let totalTasks = 0;
let taskArrContainer = {};
let totalTime = 0.0;
let procTime = 0.0;
let instManagementTime = 0.0;
let scriptTime = 0.0;
let projectManagementTime = 0.0;
let resourceGatheringTime = 0.0;
let miscTime = 0.0;
let quizzesTime = 0.0;
let gaugeTime = 0.0;
let meetingTime = 0.0;
let ltiTime = 0.0;
let numOfArrs = 1;

let categorizeTime = (time,id)=>{
  if(id == "489809463131044"){
    procTime = procTime + time;
  }
  if(id == "489809463131033"){
    instManagementTime = instManagementTime + time;
  }
  if(id == "490010230308930"){
    scriptTime = scriptTime + time;
  }
  if(id == "490020383917402"){
    projectManagementTime = projectManagementTime + time;
  }
  if(id == "490020383917401"){
    resourceGatheringTime = resourceGatheringTime + time;
  }
  if(id == "489900010718831"){
    miscTime = miscTime + time;
  }
  if(id == "504887827798400"){
    quizzesTime = quizzesTime + time;
  }
  if(id == "489809463131031"){
    gaugeTime = gaugeTime + time;
  }
  if(id == "518968256082262"){
    meetingTime = meetingTime + time;
  }
  if(id == "478952064986393"){
    ltiTime = ltiTime + time;
  }
}

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
        resolve(body);
      }
    }) 
  }
  getTaskIds();
})

let getTaskTime = (taskId)=>{
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
      } else if(response.statusCode == "429"){
        reject("too many requests");
      } else {
        let getAddedTime = body.data.custom_fields.filter((obj)=>{
          return obj.id == '427581708538669';
        });
        let addedTime = getAddedTime[0].number_value;
        if(addedTime != null){
          categorizeTime(addedTime,body.data.tags[0].id);
          totalTasks++;
          resolve(addedTime);
        } else {
          resolve(0.0);
        }
        
      }
    });
  });
};

let timePromise = (arr,num)=>{
  let finished = false;
  if(numOfArrs == num){
    finished = true;
  }
  return new Promise((res,rej)=>{
    let count = -1;
    arr.forEach((task,index,array)=>{
        getTaskTime(task).then((time)=>{
          count++;
          console.log(`${count} of ${array.length - 1}`);
          totalTime = totalTime + time;
          if(count === array.length - 1){
            setTimeout(()=>{
              res({
                lastArr: finished,
                name: num
              });
            }, 500);
          }
        }).catch((err)=>{
          rej(err)
        })
    });
  });
}

let loopThroughArr = (num)=>{
  timePromise(taskArrContainer[`fiftyArr${num}`],num).then((obj)=>{
    if(obj.lastArr === false){
      loopThroughArr(obj.name + 1);
    } else {
      console.log(`Total Time: ${totalTime}`);
      console.log(`Process Time: ${procTime}`);
      console.log(`Canvas Instance Management Time: ${instManagementTime}`);
      console.log(`Scripting Time: ${scriptTime}`);
      console.log(`Project Management Time: ${projectManagementTime}`);
      console.log(`Resource Gathering Time: ${resourceGatheringTime}`);
      console.log(`Misc Time: ${miscTime}`);
      console.log(`Quizzes Time: ${quizzesTime}`);
      console.log(`Gauge Time: ${gaugeTime}`);
      console.log(`Meeting/Calls Time: ${meetingTime}`);
      console.log(`LTI Setup Time: ${ltiTime}`);
      console.log(`Total Tasks: ${totalTasks}`);
    }
  });
}

callPromise.then((response)=>{
  let numOfTasks = 0;
  taskArrContainer[`fiftyArr${numOfArrs}`] = [];
  response.data.forEach((task)=>{
    numOfTasks++
    if(numOfTasks < 51){
      taskArrContainer[`fiftyArr${numOfArrs}`].push(task.id);
    } else {
      taskArrContainer[`fiftyArr${numOfArrs}`].push(task.id);
      numOfArrs++
      taskArrContainer[`fiftyArr${numOfArrs}`] = [];
      numOfTasks = 0;
    }
  });
  loopThroughArr(1);
}).catch((err)=>console.log(err));

