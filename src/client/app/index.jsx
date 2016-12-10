import React from "react";
import {render} from "react-dom";

class App extends React.Component {
	render () {
		return <p> Hello World with React! yaya</p>
	}
}

render(<App/>, document.getElementById("app"));
