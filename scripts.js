function Operator() {
    this.hey = 'hey';
}

function Add() {
    this.yo = 'yo';
}
Add.prototype = new Operator();

$(function() {
    var add = new Add();
    console.log('sup', add.yo, add.hey);
});
