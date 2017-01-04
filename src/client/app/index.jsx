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
			labels: [startingDate, startingDate, startingDate, startingDate, startingDate,
               startingDate, startingDate, startingDate, startingDate, startingDate,
               startingDate, startingDate, startingDate, startingDate, startingDate,
               startingDate, startingDate, startingDate, startingDate, startingDate,
               startingDate, startingDate, startingDate, startingDate
               ],
			datasets: [{
				label: '# of messages ims/npa',
				data: [12, 19, 3, 45, 10, 12, 19, 3, 45, 10, 12, 19, 3, 45, 10, 12, 19, 3, 45, 10, 12, 19, 3, 0],
				backgroundColor: getColor(imsBgColor),
				borderColor: getColor(imsBorderColor),
				borderWidth: 1
			},
      {
				label: '# of messages drm',
				data: [3, 88, 12, 14, 3, 3, 88, 12, 14, 3, 3, 88, 12, 14, 3, 3, 88, 12, 14, 3, 3, 88, 12, 14],
				backgroundColor: getColor(drmBgColor),
				borderColor: getColor(drmBorderColor),
				borderWidth: 1
			},
      {
				label: '# of messages compass',
				data: [0, 0, 0, 0, 3, 3, 88, 12, 14, 3, 3, 45, 12, 2, 30, 30, 8, 120, 14, 13, 3, 0, 0, 14, 89],
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
  let latestLabel = startingData.labels[23];

// Reduce the animation steps for demo clarity.
//var myLiveChart = new Chart(ctx).Line(startingData, {animationSteps: 15});


setInterval(function(){
  // Add two random numbers for each dataset
  myChart.data.datasets[0].data.push(Math.random() * 100);
  myChart.data.datasets[1].data.push(Math.random() * 100);
  myChart.data.datasets[2].data.push(Math.random() * 100);
  
  var currentDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
  //var currentLabel = "";
  //if(startingDate != currentDate) currentLabel = currentDate;
  myChart.data.labels.push(currentDate);
  // Remove the first point so we dont just add values forever
  myChart.data.datasets[0].data.shift();
  myChart.data.datasets[1].data.shift();
  myChart.data.datasets[2].data.shift();
  myChart.data.labels.shift();
  
  myChart.update();
  
}, 5000);  
}
//new Chart(ctx).Line(startingData, {animationSteps: 15});	
renderSqsChart();




// DB Summary chart

function renderDbSummaryChart(){

let ctx = document.getElementById("dbSummaryChart").getContext('2d');
console.log("this is context : " + ctx);

let i = 0;


let startingData = {
    datasets: [{
        data: [
            .45,
            0.86,
            .12
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
  
}
//new Chart(ctx).Line(startingData, {animationSteps: 15});	
renderDbSummaryChart();


// Job Summary chart

function renderJobSummaryChart(){

let ctx = document.getElementById("jobSummaryChart").getContext('2d');
console.log("this is context : " + ctx);

let i = 0;


let startingData = {
        labels: ["In Progress", "Success", "Failure", "Ignored"],
        datasets: [{
            label: 'Jobs Execution Summary',
            data: [1, 85, 2, 4],
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
  
}
//new Chart(ctx).Line(startingData, {animationSteps: 15});	
renderJobSummaryChart();



// Reduce the animation steps for demo clarity.
//var myLiveChart = new Chart(ctx).Line(startingData, {animationSteps: 15});



/* odometer tests start */
setTimeout(function(){
    document.getElementById("odometer-test").innerHTML = 0;
}, 1000);

setTimeout(function(){
    document.getElementById("odometer-test2").innerHTML = 0;
}, 1000);
/* odometer tests end */

/* test add element in list start */



//odometer var
let imsFilesCount = 0;


function addS3File(fileName, creationDate, folderId){
  var currentS3Folder = document.getElementById(folderId);
  var currentS3File = document.createElement('a');
  currentS3File.setAttribute("class", "list-group-item list-group-item-action animated fadeInUp");
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
  
  document.getElementById("odometer-test").innerHTML = (++imsFilesCount);
  
}
console.log("hello");

addS3File("toto_yuyu_titi.csv", "20-Jan-2016 17:37", "ims_npa_folder");
addS3File("toto_yuyu_titi.csv", "20-Jan-2016 17:37", "ims_npa_folder");
addS3File("toto_yuyu_titi.csv", "20-Jan-2016 17:37", "ims_npa_folder");

/*test li append end */

console.log("start ");