var express = require('express');
var http = require('http');
var app = express();
var path = require('path');
var reload = require('reload');
var dateFormat = require('dateformat');

//aws source start 
var aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/src/server/config/aws-config.json');
/*var config = new aws.Config({ 
  accessKeyId: 'AKIAJUCN4ECEPCVCIBGA', secretAccessKey: 'welcome123+', region: 'eu-west-1'
});*/
var sqs = new aws.SQS();

var params = {
  AttributeNames: [
     "All"
  ], 
  QueueUrl: "https://sqs.eu-west-1.amazonaws.com/538866728692/my-first-queue"
 };
 
sqs.getQueueAttributes(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     {
     console.log(data);
     console.log(data.Attributes.ApproximateNumberOfMessages + data.Attributes.ApproximateNumberOfMessagesNotVisible);
     
   }// successful response
   /*
   data = {
    Attributes: {
     "ApproximateNumberOfMessages": "0", 
     "ApproximateNumberOfMessagesDelayed": "0", 
     "ApproximateNumberOfMessagesNotVisible": "0", 
     "CreatedTimestamp": "1442426968", 
     "DelaySeconds": "0", 
     "LastModifiedTimestamp": "1442426968", 
     "MaximumMessageSize": "262144", 
     "MessageRetentionPeriod": "345600", 
     "QueueArn": "arn:aws:sqs:us-east-1:80398EXAMPLE:MyNewQueue", 
     "ReceiveMessageWaitTimeSeconds": "0", 
     "RedrivePolicy": "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:80398EXAMPLE:MyDeadLetterQueue\",\"maxReceiveCount\":1000}", 
     "VisibilityTimeout": "30"
    }
   }
   */
 });
 
var s3 = new aws.S3();

var params = { 
 Bucket: 'investbook.io.myfistbucket',
 Delimiter: '/',
 Prefix: 'ims/Input/'
};

s3.listObjects(params, function (err, data) {
 if(err)throw err;
 console.log(data);
});
 
 function s3LogFileList(fileList){
   var res = "";
   for(var i = 0; i < fileList.length; i++){
     res += "{" + fileList[i].fileName + "," + fileList[i].fileDate.toUTCString() + "}";
   }
   console.log("S3 file list (" + fileList.length + "): " + res);
 }
 

 
 function s3GetFileList(s3, bucketName, folderName, callback){
   var params = { 
     Bucket: bucketName,
     Delimiter: '/',
     Prefix: folderName
    };
   s3.listObjects(params, function (err, data) {
     if(err)throw err;
     var fileList = [];
     for(var i = 0; i < data.Contents.length; i++){
       var posFileName = data.Contents[i].Key.lastIndexOf('/');
       var keyLen = data.Contents[i].Key.length;
       if(posFileName !== keyLen - 1){
         fileList.push({"fileName" : data.Contents[i].Key.substring(posFileName + 1), "fileDate" : data.Contents[i].LastModified});
       }
       
       //
       //res += );
       
     };
     callback(fileList);
    });
 }
 
 function sqsLogMessageCnt(cnt){
   console.log("SQS # of messages : " + cnt);
 }
 

 
 function sqsGetMessageCnt(sqs, sqsUrl, callback){
  var params = {
    AttributeNames: [
       "All"
    ], 
    QueueUrl: sqsUrl
   };
   

  sqs.getQueueAttributes(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else {
       var res = parseInt(data.Attributes.ApproximateNumberOfMessages) + parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible);
       callback(res);
     }// successful response
     

 });
 }
 
var s3Interval =  setInterval(s3GetFileList,  5000, s3,  'investbook.io.myfistbucket', 'ims/', s3LogFileList);
var sqsInterval = setInterval(sqsGetMessageCnt, 5000, sqs, 'https://sqs.eu-west-1.amazonaws.com/538866728692/my-first-queue', sqsLogMessageCnt);
 //aws source end
 
 //mysql source start
var mysql      = require('mysql');
var connection = mysql.createConnection(require("./src/server/config/mysql-config.json"));

 
connection.connect();
 
connection.query('SELECT value AS solution from test_table', function(err, rows, fields) {
  if (err) throw err;
 
  console.log('The solution is: ', rows[0].solution + "&" + rows[1].solution);
});
  
//connection.end(); 

function dbLogJobExecution(data){
  var drmCount = 0;
  var imsCount = 0;
  var compassCount = 0;
  var res = "";
  for (var i = 0; i < data.length; i++){
    res += "job exe : " + data[i].source + "," + data[i].job_name + "," + data[i].file_name + "," + data[i].start_date.toUTCString() + "," + data[i].status +"\n";
    if(data[i].source === "drm"){
      drmCount++;
    }else if(data[i].source === "ims"){
      imsCount++;
    }else if(data[i].source === "compass"){
      compassCount++;
    } 
    
  }
  console.log("************ Job Execution : drm:" + drmCount + ", ims:" + imsCount + ", compass:" + compassCount);
  console.log(res);
  console.log("*************************************");
}

function dbGetJobExecution(connection, query, callback){
  connection.query(query, function(err, rows, fields) {
  if (err) throw err;
 
    callback(rows);
  });
}

function dbLogJobSummary(data){
  console.log("job summary : success = " + (data[0].successCount == null ? 0 : data[0].successCount) + 
                          ", in progress = " + (data[0].progressCount == null ? 0 : data[0].progressCount) + 
                          ", failed = " + (data[0].failedCount == null ? 0 : data[0].failedCount));
}

function dbGetJobSummary(connection, query, callback){
  connection.query(query, function(err, rows, fields) {
  if (err) throw err;
    
    callback(rows); 
  });
}



function dbLogJobRecordsCount(connection, currentTable){
  var query = 'select sum(ETL_IS_SKELETON_FLG) skeletonCount, sum(ETL_IS_DELETED_FLG) deletedCount from ' + currentTable.table_name;
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    currentTable.skeletonCount = (rows[0].skeletonCount === null ? 0 : rows[0].skeletonCount);
    currentTable.deletedCount = (rows[0].deletedCount === null ? 0 : rows[0].deletedCount);
    console.log(currentTable);
  });
}

function dbGetJobRecordsCount(connection, query, dbSource, callback){
  connection.query(query, function(err, rows, fields) {
  if (err) throw err;
    var countIms = 0;
    var countDrm = 0;
    var countCompass = 0;
    for(var i = 0; i< rows.length; i++){
      if(dbSource[rows[i].table_name] !== undefined){
        //console.log(dbSource);
        rows[i].dbSource = dbSource[rows[i].table_name];
        callback(connection, rows[i]);
      }
    }
  });
}
var jobExecutionQuery = 'select * from cdr.job_execution';
var dbJobExecutionInterval =  setInterval(dbGetJobExecution,  5000, connection,  jobExecutionQuery, dbLogJobExecution);


var jobSummaryQuery = 'select sum(if(status="COMPLETE",  1, 0)) successCount, \
                              sum(if(status="PROGRESS",  1, 0)) progressCount, \
                              sum(if(status="FAILED",  1, 0)) failedCount \
                          from job_execution';
var dbJobSummaryInterval =  setInterval(dbGetJobSummary,  5000, connection,  jobSummaryQuery, dbLogJobSummary);

var jobRecordsCountQuery = "select table_name, table_rows from information_schema.tables \
                            where table_schema = 'cdr'";
var dbJobRecordsCountInterval =  setInterval(dbGetJobRecordsCount,  5000, connection,  jobRecordsCountQuery, require("./src/server/config/db-src-config.json"), dbLogJobRecordsCount);

 //mysql source end
 
 
 var publicDir = path.join(__dirname, 'public');


var server = http.createServer(app);
 
 
app.use(express.static('src/client'));

app.get('/', function (req, res) {
  //res.send('Hello Worrgrrrrllld!!!');
  res.sendFile(path.join(__dirname, 'src/client', 'index.html'));
});



/*app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})*/


// socket io start


function sioGetJobExec(connection, socket, query){
  connection.query(query, function(err, rows, fields) {
    for(var i =0; i < rows.length; i++){
      rows[i].start_date = dateFormat(rows[i].start_date, "HH:MM:ss");
    }
  if (err) throw err;
 
    socket.emit('jobExec', rows);
  });
}

function sioGetJobSummary(connection, socket, query){
  connection.query(query, function(err, rows, fields) {
  if (err) throw err;
    
    socket.emit('jobSummary', rows); 
  });
}

 function sioS3GetFileList(s3, socket, bucketName, folderName, source){
   var params = { 
     Bucket: bucketName,
     Delimiter: '/',
     Prefix: folderName
    };
   s3.listObjects(params, function (err, data) {
     if(err)throw err;
     var fileList = [];
     for(var i = 0; i < data.Contents.length; i++){
       var posFileName = data.Contents[i].Key.lastIndexOf('/');
       var keyLen = data.Contents[i].Key.length;
       if(posFileName !== keyLen - 1){
         fileList.push({"fileName" : data.Contents[i].Key.substring(posFileName + 1), "fileDate" : dateFormat(data.Contents[i].LastModified, "dd mmm mmm HH:MM:ss")});
       }
       
       //
       //res += );
       
     };
     socket.emit("s3FileList", {sourceSystem : source, data : fileList});
    });
 }

  function sioSqsGetMessageCnt(sqs, socket, sqsUrl, source){
  var params = {
    AttributeNames: [
       "All"
    ], 
    QueueUrl: sqsUrl
   };
   

  sqs.getQueueAttributes(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else {
       var res = parseInt(data.Attributes.ApproximateNumberOfMessages) + parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible);
       socket.emit("sqsMessageCount", {sourceSystem : source, data : res});
     }// successful response
     

 });
 }

function sioDbEmitJobRecordsCount(connection, socket, currentTable){
  var query = 'select sum(ETL_IS_SKELETON_FLG) skeletonCount, sum(ETL_IS_DELETED_FLG) deletedCount from ' + currentTable.table_name;
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    currentTable.skeletonCount = (rows[0].skeletonCount === null ? 0 : rows[0].skeletonCount);
    currentTable.deletedCount = (rows[0].deletedCount === null ? 0 : rows[0].deletedCount);
    socket.emit("dbRecordsCount", currentTable);
  });
}

function sioDbGetJobRecordsCount(connection, socket, query, dbSource, callback){
  connection.query(query, function(err, rows, fields) {
  if (err) throw err;
    var countIms = 0;
    var countDrm = 0;
    var countCompass = 0;
    for(var i = 0; i< rows.length; i++){
      if(dbSource[rows[i].table_name] !== undefined){
        //console.log(dbSource);
        rows[i].dbSource = dbSource[rows[i].table_name];
        callback(connection, socket, rows[i]);
      }
    }
  });
}
 
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.emit('news', { hello: 'world2' });
  socket.emit('news', { hello: 'world3' });
  socket.emit('news', "yet another hello"); 

  socket.on('my other event', function (data) {
    console.log(data);
  });
  
//socket io job exec start
var sioJobExecQuery = 'select * from cdr.job_execution';
var sioInterval =  setInterval(sioGetJobExec,  5000, connection, socket, sioJobExecQuery);
//socket io job exec end
//socket io job summary start
var sioJobSummaryQuery = 'select sum(if(status="COMPLETE",  1, 0)) successCount, \
                              sum(if(status="PROGRESS",  1, 0)) progressCount, \
                              sum(if(status="FAILED",  1, 0)) failedCount \
                          from job_execution';
var sioJobSummaryInterval =  setInterval(sioGetJobSummary,  5000, connection, socket, sioJobSummaryQuery);
//socket io job summary end
//socket io s3 start
var sioImsS3Interval =  setInterval(sioS3GetFileList,  5000, s3,  socket, 'investbook.io.myfistbucket', 'ims/', 'IMS');
var sioDrmS3Interval =  setInterval(sioS3GetFileList,  5000, s3,  socket, 'investbook.io.myfistbucket', 'drm/', 'DRM');
var sioCompassS3Interval =  setInterval(sioS3GetFileList,  5000, s3,  socket, 'investbook.io.myfistbucket', 'compass/', 'COMPASS');
//socket io s3 end
//socket io sqs start
var sioImsSqsInterval = setInterval(sioSqsGetMessageCnt, 5000, sqs, socket, 'https://sqs.eu-west-1.amazonaws.com/538866728692/ims', 'IMS');
var sioDrmSqsInterval = setInterval(sioSqsGetMessageCnt, 5000, sqs, socket, 'https://sqs.eu-west-1.amazonaws.com/538866728692/drm', 'DRM');
var sioCompassSqsInterval = setInterval(sioSqsGetMessageCnt, 5000, sqs, socket, 'https://sqs.eu-west-1.amazonaws.com/538866728692/compass', 'COMPASS');
//socket io sqs end
// socket db records start
var sioJobRecordsCountQuery = "select table_name, table_rows from information_schema.tables \
                               where table_schema = 'cdr'";
var sioDbJobRecordsCountInterval =  setInterval(sioDbGetJobRecordsCount,  5000, connection, socket, sioJobRecordsCountQuery, require("./src/server/config/db-src-config.json"), sioDbEmitJobRecordsCount);
//socket db records end

});


//socket io end

server.listen(3000, function(){
  console.log("Web server listening on port " + 3000);
  
});
 
reload(server, app);
 


