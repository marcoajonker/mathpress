function Operator() {
    this.hey = 'hey';
}

function Add(x) {
    this.act = function(n) {
        return n + x;
    };
    this.toString = function() {
        return '+' + x;
    };
}
Add.prototype = new Operator();

$(function() {
    var add5 = new Add(5);
    var number = 4;
    console.log(number);
    setInterval(function() {
        console.log(number, '' + add5, number = add5.act(number));
    }, 1000);
});
