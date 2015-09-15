function Add(x) {
    this.act = function(n) {
        return n + x;
    };
    this.toString = function() {
        return '+' + x;
    };
    this.reverse = function() {
        return this.__reverse || (this.__reverse = new Subtract(x));
    }
}

function Subtract(x) {
    this.act = function(n) {
        return n - x;
    };
    this.toString = function() {
        return '-' + x;
    };
    this.reverse = function() {
        return this.__reverse || (this.__reverse = new Add(x));
    }
}

$(function() {
    var add5 = new Add(5);
    var number = 4;
    console.log(number);
    setInterval(function() {
        console.log(number, '' + add5, number = add5.act(number));
        console.log(number, '' + add5.reverse(), number = add5.reverse().act(number));
    }, 1000);
});
