//REACT CODE
//creating page lyouts for nav buttons

"use strict";

const e = React.createElement;

const domContainer = document.querySelector("#render-main");

$("#home").click(function () {
  console.log(this.id);
  let message = e("h3", { className: "greeting" }, "I'm Home!");
  ReactDOM.render(message, domContainer);
});

var example = React.createClass({
  render: function () {
    return <h2>this is an example of code</h2>;
  },
});

ReactDOM.render(<example />, document.getElementById9("render-main"));
