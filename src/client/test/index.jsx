import {renderChart} from './testChart';
import React from "react";
import {render} from "react-dom";
 

class App extends React.Component {
	render () {
		return <div><App2/><App1/></div>;
	}
}


class App2 extends React.Component {
	render () {
		return <h1>I m component 2 </h1>;
	}
}

class App1 extends React.Component {

	render () {
		return 	<div style={{width:'300px', height:'500px'}}>
				<canvas id="myChart" width="300" height="300"></canvas>
				<p>Hello World with React! yaya</p></div>;
		
	}
}

/*function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}*/


render(<App/>, document.getElementById("app"));



renderChart();
//render(<App2/>, document.getElementById("app2"));


