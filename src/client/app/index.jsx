import Chart from 'chart.js';
//import odometer_car_css from './assets/css/odometer-theme-car.css';
//import odometer_train_css from './assets/css/odometer-theme-train-station.css';
import odometer_min_css from './assets/css/odometer-theme-minimal.css';
import odometer_js from './assets/js/odometer.min.js';
import animate from 'animate.css';
import fa from "./assets/css/font-awesome.css"

//import $ from 'jquery';
//import jQuery from 'jquery';
// export for others scripts to use


import bootstrap_css from 'bootstrap/dist/css/bootstrap.css';

require ('./style/style.css');

//socket io start

var socket = require('socket.io-client')();
  socket.on("jobExec", function (data){
    console.log("jobExec");
    console.log(data);
    updateJobExec(data);
  });
  
  socket.on("jobSummary", function (data){
    console.log("jobSummary");
    console.log(data);
    updateJobSummary(myJobSummaryChart, data);
  });
  
  
  
  var SqsListener = function(socket){
    this.sqsImsCount = 0;
    this.sqsDrmCount = 0;
    this.sqsCompassCount = 0;
    this.socket = socket;
  };
  
  SqsListener.prototype = {
    
  
    start: function(){
      setInterval((function(){
      //mySqsChart.data.datasets[srcNumber].data.push(data.data);
          mySqsChart.data.datasets[0].data.push(this.sqsImsCount);
          mySqsChart.data.datasets[1].data.push(this.sqsDrmCount);
          mySqsChart.data.datasets[2].data.push(this.sqsCompassCount);
          
          var currentDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
          //var currentLabel = "";
          //if(startingDate != currentDate) currentLabel = currentDate;
          mySqsChart.data.labels.push(currentDate);
          // Remove the first point so we dont just add values forever
          //if(mySqsChart.data.labels.length == 24){
            mySqsChart.data.datasets[0].data.shift();
            mySqsChart.data.datasets[1].data.shift();
            mySqsChart.data.datasets[2].data.shift();
            mySqsChart.data.labels.shift();
          //}
          mySqsChart.update();

        
      }).bind(this), 5000);  
    },
    
    listen: function() {
      this.socket.on("sqsMessageCount", (function (data){
        console.log("sqsMessageCount");
        console.log(data);
        var srcNumber = 0;
        if(data.sourceSystem == "IMS") this.sqsImsCount = data.data;
        else if (data.sourceSystem == "DRM") this.sqsDrmCount = data.data;
        else if (data.sourceSystem == "COMPASS") this.sqsCompassCount = data.data;
      }).bind(this));
   
    }
    
};
  
var sqsListener = new SqsListener(socket);

sqsListener.listen();
sqsListener.start();

  
//socket io db records count start  
    var DbRecordsCounter = function(socket){
    this.dbRecordsCount = {};
    this.socket = socket;
  };
  
  DbRecordsCounter.prototype = {
    
    start: function(){
      setInterval((function(){
        var dbRecordsImsNCount = 0;  
        var dbRecordsImsSCount = 0;  
        var dbRecordsImsDCount = 0;  
        var dbRecordsDrmNCount = 0;  
        var dbRecordsDrmSCount = 0;  
        var dbRecordsDrmDCount = 0;  
        var dbRecordsCompassNCount = 0;  
        var dbRecordsCompassSCount = 0;  
        var dbRecordsCompassDCount = 0;  
        
        var dbRecordsImsTableCount = 0;
        var dbRecordsDrmTableCount = 0;
        var dbRecordsCompassTableCount = 0;
        var dbRecordsImsNonEmptyTableCount = 0;
        var dbRecordsDrmNonEmptyTableCount = 0;
        var dbRecordsCompassNonEmptyTableCount = 0;
        
        for(var currTableCount in this.dbRecordsCount){
          if(this.dbRecordsCount[currTableCount].dbSource == "ims"){
            dbRecordsImsTableCount++;
            if(this.dbRecordsCount[currTableCount].table_rows != 0){
              dbRecordsImsNonEmptyTableCount++;
            }
            dbRecordsImsNCount += this.dbRecordsCount[currTableCount].table_rows;  
            dbRecordsImsSCount += this.dbRecordsCount[currTableCount].skeletonCount;  
            dbRecordsImsDCount += this.dbRecordsCount[currTableCount].deletedCount;  
          }else if(this.dbRecordsCount[currTableCount].dbSource == "drm"){
            dbRecordsDrmTableCount++;
            if(this.dbRecordsCount[currTableCount].table_rows != 0){
              dbRecordsDrmNonEmptyTableCount++;
            }
            dbRecordsDrmNCount += this.dbRecordsCount[currTableCount].table_rows;  
            dbRecordsDrmSCount += this.dbRecordsCount[currTableCount].skeletonCount;  
            dbRecordsDrmDCount += this.dbRecordsCount[currTableCount].deletedCount;  
          }else if(this.dbRecordsCount[currTableCount].dbSource == "compass"){
            dbRecordsCompassTableCount++
            if(this.dbRecordsCount[currTableCount].table_rows != 0){
              dbRecordsCompassNonEmptyTableCount++;
            }
            dbRecordsCompassNCount += this.dbRecordsCount[currTableCount].table_rows;  
            dbRecordsCompassSCount += this.dbRecordsCount[currTableCount].skeletonCount;  
            dbRecordsCompassDCount += this.dbRecordsCount[currTableCount].deletedCount;  
          }
        }
        //update DB records table
        document.getElementById("db_records_count_ims_n").innerHTML = dbRecordsImsNCount;
        document.getElementById("db_records_count_ims_s").innerHTML = dbRecordsImsSCount;
        document.getElementById("db_records_count_ims_d").innerHTML = dbRecordsImsDCount;
        document.getElementById("db_records_count_drm_n").innerHTML = dbRecordsDrmNCount;
        document.getElementById("db_records_count_drm_s").innerHTML = dbRecordsDrmSCount;
        document.getElementById("db_records_count_drm_d").innerHTML = dbRecordsDrmDCount;
        document.getElementById("db_records_count_compass_n").innerHTML = dbRecordsCompassNCount;
        document.getElementById("db_records_count_compass_s").innerHTML = dbRecordsCompassSCount;
        document.getElementById("db_records_count_compass_d").innerHTML = dbRecordsCompassDCount;
        
        //update Aurora Tables Summary
        myDbSummaryChart.config.data.datasets[0].data[0] = (dbRecordsImsTableCount == 0 ? 0 : Math.round((dbRecordsImsNonEmptyTableCount/dbRecordsImsTableCount) * 10000) / 100);
        myDbSummaryChart.config.data.datasets[0].data[1] = (dbRecordsDrmTableCount == 0 ? 0 : Math.round((dbRecordsDrmNonEmptyTableCount/dbRecordsDrmTableCount) * 10000) / 100);
        myDbSummaryChart.config.data.datasets[0].data[2] = (dbRecordsCompassTableCount == 0 ? 0 : Math.round((dbRecordsCompassNonEmptyTableCount/dbRecordsCompassTableCount) * 10000) / 100);
        myDbSummaryChart.update();
      }).bind(this), 5000);  
    },
    
    listen: function() {
      this.socket.on("dbRecordsCount", (function (data){
        console.log("dbRecordsCount");
        console.log(data);
        
        this.dbRecordsCount[data.table_name] = data;
      }).bind(this));
    }
    
};
  
var dbRecordsCounter = new DbRecordsCounter(socket);

dbRecordsCounter.listen();
dbRecordsCounter.start();

// socket io db records count end
  
  socket.on("s3FileList", function (data){
    console.log("s3FileList");
    console.log(data);
    updateS3Folder(data);
  });
  
  /*socket.on("dbRecordsCount", function (data){
    console.log("dbRecordsCount");
    console.log(data);
  });*/
  
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
    socket.emit('my other event', { my: 'data2' });
    socket.emit('my other event', { my: 'data' });
 
  });
  
//socket io end

  
  console.log(odometer_js);


/*var el = document.querySelector('.odotest');
 
var od = new odometer_js({
  el: el,
  value: 12345.09,
 
  // Any option (other than auto and selector) can be passed in here
  format: '(,ddd).dd',
  theme: 'car'
});*/
 
//od.update(555)
// or
//el.innerHTML = 555


var imsBgColor = {r:255, g:99 , b:132, a:.2};
var imsBorderColor = {r:255, g:99 , b:132, a:1};
var drmBgColor = {r:54, g:162 , b:235, a:.2};
var drmBorderColor = {r:54, g:162 , b:235, a:1};
var compassBgColor = {r:25, g:206 , b:86, a:.2};
var compassBorderColor = {r:25, g:206 , b:86, a:1};

//color function
function getColor(rgba){
  return "rgba("+ rgba.r +","+ rgba.g +","+ rgba.b +","+ rgba.a +")";
}




function renderSqsChart(){

let ctx = document.getElementById("sqsChart").getContext('2d');
console.log("this is context : " + ctx);

let i = 0;

let startingDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");

let startingData = {
			labels: ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", startingDate],
			datasets: [{
				label: '# of messages ims/npa',
				data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				backgroundColor: getColor(imsBgColor),
				borderColor: getColor(imsBorderColor),
				borderWidth: 1
			},
      {
				label: '# of messages drm',
				data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				backgroundColor: getColor(drmBgColor),
				borderColor: getColor(drmBorderColor),
				borderWidth: 1
			},
      {
				label: '# of messages compass',
				data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				backgroundColor: getColor(compassBgColor),
				borderColor: getColor(compassBorderColor),
				borderWidth: 1
			}]
		};

let myChart = new Chart(ctx, {
		type: 'line',
		data: startingData,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});	
  //let latestLabel = startingData.labels[23];

// Reduce the animation steps for demo clarity.
//var myLiveChart = new Chart(ctx).Line(startingData, {animationSteps: 15});
return myChart;


}
//new Chart(ctx).Line(startingData, {animationSteps: 15});	
var mySqsChart = renderSqsChart();



// DB Summary chart

function renderDbSummaryChart(){

let ctx = document.getElementById("dbSummaryChart").getContext('2d');
console.log("this is context : " + ctx);

let i = 0;


let startingData = {
    datasets: [{
        data: [
            0,
            0,
            0
        ],
        backgroundColor: [
            getColor(imsBgColor),
            getColor(drmBgColor),
            getColor(compassBgColor)
        ],
        borderColor: [
            getColor(imsBorderColor),
            getColor(drmBorderColor),
            getColor(compassBorderColor)
        ],
        
        label: 'My dataset' // for legend
    }],
    labels: [
        "ims/npa",
        "drm",
        "compass"
    ]
};

let myChart = new Chart(ctx, {
		type: 'polarArea',
		data: startingData,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});	
  return myChart;
}
//new Chart(ctx).Line(startingData, {animationSteps: 15});	
var myDbSummaryChart = renderDbSummaryChart();


// Job Summary chart

function renderJobSummaryChart(){

let ctx = document.getElementById("jobSummaryChart").getContext('2d');
console.log("this is context : " + ctx);

let i = 0;


let startingData = {
        labels: ["In Progress", "Success", "Failure", "Ignored"],
        datasets: [{
            label: 'Jobs Execution Summary',
            data: [0, 0, 0, 0],
            backgroundColor: [
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };


let myChart = new Chart(ctx, {
		type: 'bar',
		data: startingData,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});	
  return myChart;
}
//new Chart(ctx).Line(startingData, {animationSteps: 15});	
var myJobSummaryChart = renderJobSummaryChart();



// Reduce the animation steps for demo clarity.
//var myLiveChart = new Chart(ctx).Line(startingData, {animationSteps: 15});



/* odometer tests start 
setTimeout(function(){
    document.getElementById("odometer-test").innerHTML = 0;
}, 1000);

setTimeout(function(){
    document.getElementById("odometer-test2").innerHTML = 0;
}, 1000);
 odometer tests end */

/* test add element in list start */



//odometer var

function updateS3Folder(s3FileList){
  var folderId;
  var newFileNames = [];
  if(s3FileList.sourceSystem == "IMS"){
    folderId = "ims_npa_folder";
  }else if(s3FileList.sourceSystem == "DRM"){
    folderId = "drm_folder";
  }else if(s3FileList.sourceSystem == "COMPASS"){
    folderId = "compass_folder";
  }
  for(var i = 0; i < s3FileList.data.length; i++){
    var currentElem = document.querySelector("["+folderId+"_ods_s3_id='" + s3FileList.data[i].fileName + "']");
    newFileNames.push(s3FileList.data[i].fileName);
    if(currentElem == undefined){
      addS3File(s3FileList.data[i].fileName, s3FileList.data[i].fileDate, folderId);
    }
  }
  var currentS3Folder = document.getElementById(folderId);
  var filesToDelete = [];
    for(var i = 1; i < currentS3Folder.children.length; i++){
      var currentChild = currentS3Folder.children[i];
      if(!newFileNames.includes(currentChild.getAttribute(folderId+"_ods_s3_id"))) {
        filesToDelete.push(currentChild);
      }
    }
    for(var i = 0; i < filesToDelete.length; i++){
      currentS3Folder.removeChild(filesToDelete[i]);
    }
    document.getElementById("s3_" + folderId + "_odometer").innerHTML = s3FileList.data.length;
} 

function addS3File(fileName, creationDate, folderId){
  var currentS3Folder = document.getElementById(folderId);
  var currentS3File = document.createElement('a');
  currentS3File.setAttribute("class", "list-group-item list-group-item-action animated fadeInUp");
  currentS3File.setAttribute(folderId+"_ods_s3_id", fileName);
  var currentBadge = document.createElement('span');
  currentBadge.setAttribute("class", "tag tag-pill tag-default");
  currentBadge.setAttribute("style", "float: right;");
  var currentIcon = document.createElement('i');
  currentIcon.setAttribute("class", "fa fa-file-o");
  //currentIcon.setAttribute("area-hidden", "true");
  currentBadge.appendChild(document.createTextNode(creationDate));
  currentS3File.appendChild(currentIcon);
  currentS3File.appendChild(currentBadge);
  currentS3File.appendChild(document.createTextNode(" " + fileName));
  // next line should be improved
  currentS3Folder.insertBefore(currentS3File, currentS3Folder.children[1]);
  
  console.log("done");
  
}

function updateJobExec(jobExecList){
  var folderId = "ods_job_exec";
  var newJobExecList = [];

    var imsExecCnt = 0;
    var drmExecCnt = 0;
    var compassExecCnt = 0;

  
  for(var i = 0; i < jobExecList.length; i++){
    
    if(jobExecList[i].source == "IMS"){
      imsExecCnt++;
    }else if(jobExecList[i].source == "DRM"){
      drmExecCnt++;
    }else if(jobExecList[i].source == "COMPASS"){
      compassExecCnt++;
    }
    
    var currentElem = document.querySelector("[ods_job_exec_id='" + jobExecList[i].id + "']");
    newJobExecList.push("" + jobExecList[i].id);
    if(currentElem == undefined){
      addJobExec(jobExecList[i].id, jobExecList[i].source, jobExecList[i].job_name, jobExecList[i].file_name, jobExecList[i].start_date, jobExecList[i].status, folderId);
    }
  }
  
  document.getElementById("job_exec_ims_cnt").innerHTML = imsExecCnt;
  document.getElementById("job_exec_drm_cnt").innerHTML = drmExecCnt;
  document.getElementById("job_exec_compass_cnt").innerHTML = compassExecCnt;
  var currentJobExecFolder = document.getElementById(folderId);
  var jobExecsToDelete = [];
    for(var i = 1; i < currentJobExecFolder.children.length; i++){
      var currentChild = currentJobExecFolder.children[i];
      if(!newJobExecList.includes(currentChild.getAttribute("ods_job_exec_id"))) {
        jobExecsToDelete.push(currentChild);
      }
    }
    for(var i = 0; i < jobExecsToDelete.length; i++){
      currentJobExecFolder.removeChild(jobExecsToDelete[i]);
    }
}

function addJobExec(jobId, sourceSystem, jobName, fileName, startDate, status, parentId){
  var parentNode = document.getElementById(parentId);
  var currentJobExec = document.createElement('div');
  currentJobExec.setAttribute("class", "animated fadeInUp");
  currentJobExec.setAttribute("ods_job_exec_id", jobId);
  var tagType = "";
  if(sourceSystem == "IMS"){
    tagType = "tag-danger";
  }else if(sourceSystem == "DRM"){
    tagType = "tag-primary";
  }else if(sourceSystem == "COMPASS"){
    tagType = "tag-success";
  }
  
  var statusTag = "";
  if(status == "COMPLETE"){
    statusTag = "fa-check-circle";
  }else if(status == "FAILED"){
    statusTag = "fa-times-circle";
  }else if(status == "PROGRESS"){
    statusTag = "fa-spin fa-fw";
  }
  currentJobExec.innerHTML = '<span class="col-md-9 text-truncate">\
                                <span class="tag tag-default tag-pill ' + tagType + '">' + sourceSystem + '</span>\
                                <b>' + jobName + ' </b>: [' + fileName + ']</span>\
                              <span class="col-md-3 text-truncate">\
                                <b>@ ' + startDate + ' </b>\
                                <i class="fa fa-refresh ' + statusTag + '">\
                                </i>\
                              </span>';
  // next line should be improved
  parentNode.insertBefore(currentJobExec, parentNode.children[1]);
  console.log("done");
  
}


function updateJobSummary(myJobSummaryChart, data){
  myJobSummaryChart.data.datasets[0].data[0] = data[0].progressCount;
  myJobSummaryChart.data.datasets[0].data[1] = data[0].successCount;
  myJobSummaryChart.data.datasets[0].data[2] = data[0].failedCount;
  myJobSummaryChart.update();
}

/*
addJobExec(3, "DRM", "job_ExtSales", "THIS_IS_21q3123_FILE.txt", "22:23:11", "COMPLETE", "ods_job_exec");
addJobExec(3, "COMPASS", "job_ExtSales", "THIS_IS_21q3123_FILE.txt", "22:23:11", "FAILED", "ods_job_exec");
addJobExec(3, "DRM", "job_ExtSales", "THIS_IS_21q3123_FILE.txt", "22:23:11", "PROGRESS", "ods_job_exec");
addJobExec(3, "IMS", "job_ExtSales", "THIS_IS_21q3123_FILE.txt", "22:23:11", "COMPLETE", "ods_job_exec");
addJobExec(3, "DRM", "job_ExtSales", "THIS_IS_21q3123_FILE.txt", "22:23:11", "COMPLETE", "ods_job_exec");
*/

console.log("hello");

//addS3File("toto_yuyu_titi.csv", "20-Jan-2016 17:37", "ims_npa_folder");
//addS3File("toto_yuyu_titi.csv", "20-Jan-2016 17:37", "ims_npa_folder");
//addS3File("toto_yuyu_titi.csv", "20-Jan-2016 17:37", "ims_npa_folder");

/*test li append end */

console.log("start ");