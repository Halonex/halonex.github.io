$('.btn-expand-collapse').click(function(e) {
    $('.navbar-primary').toggleClass('collapsed');
});

function addQnButton(n){
    var cc = "qb" + n;
    document.getElementById("qBpan").innerHTML += '<li class="item unvis float-item" id = "' + cc + '"><p class = "li1" id = "'+ cc +'">' + n +'</p></li>';
}

function markForReview(qn){
    x = document.getElementById(qn);
    x.classList = "item unvis float-item mforrev";
}

function answered(qn){
    x = document.getElementById(qn);
    x.classList = "item ans float-item";
}

function unanswered(qn){
    x = document.getElementById(qn);
    x.classList = "item unans float-item";
}

responses = {};

currentQn = "qb1";

for(i=1; i <= 20; i++){
    addQnButton(i);
    responses["qb" + i] = "&|&";
}

var li = document.getElementsByClassName("li1");

for(var i = 0;i<li.length;i++){
    li[i].addEventListener("click", panbutclick);
}

function panbutclick(e){
    x = e.target.attributes.id.value;
    if(responses[x] == "&|&"){
        unanswered(x);
        responses[x] = "|&|"
    }
    currentQn = x;
    renderQuestion(x);
    return x;       
}

function renderQuestion(q){
    document.getElementById("").innerHTML = "";
    x = renderOptions(q);
    document.getElementById("").innerHTML = "";
}

function renderOptions(q){

}