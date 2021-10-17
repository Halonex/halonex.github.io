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

questions = {

    1:["who is the chief executive officer of LOF ?", "Dominic", "Walter", "Dominic Walter", "Dominic Walter T"],
    2:["Expansion of WWW :", "World ww", "World wide w", "World wide web"],
    3:["The filament of a light bulb has surface area 64 mm2. The filament can be considered as a blackbody at temperature 2500 K emitting radiation like a point source when viewed from far. At nightthe light bulb is observed from a distance of 100 m. Assume the pupil of the eyes of the observer tobe circular with radius 3 mm. Then(Take Stefan-Boltzmann constant = 5.67 × 10−8 Wm−2K−4, Wien’s displacement constant =2.90 × 10−3 m-K, Planck’s constant = 6.63 × 10−34 Js, speed of light in vacuum = 3.00 ×108 ms−1)", "power radiated by the filament is in the range 642 W to 645 W", "radiated power entering into one eye of the observer is in the range 3.15 × 10−8 W to 3.25 × 10−8 W", "the wavelength corresponding to the maximum intensity of light is 1160 nm", "taking the average wavelength of emitted radiation to be 1740 nm, the total number of photons entering per second into one eye of the observer is in the range 2.75 × 1011 to 2.85 × 1011"]
};

currentQn = "1";
currentObj = "qb1";

for(i=1; i <= Object.keys(questions).length; i++){
    addQnButton(i);
    responses[i] = "&|&";
}

var li = document.getElementsByClassName("li1");

for(var i = 0;i<li.length;i++){
    li[i].addEventListener("click", panbutclick);
}

function panbutclick(e){
    currentObj = e.target.attributes.id.value;
    currentQn = currentObj.split("b")[1];
    if(responses[currentQn] == "&|&"){
        unanswered(currentObj);
    }
    
    renderQuestion();    
}

function renderQuestion(){
    console.log(currentQn);
    document.getElementById("QuesNo").innerHTML = "Question: " + currentQn;
    document.getElementById("QuesMain").innerHTML = questions[currentQn][0];
    x = renderOptions(currentObj);
    renderResponse();
}

function renderOptions(q){
    q = q.split("b")[1];
    document.getElementById("1option").innerHTML = questions[q][1];
    document.getElementById("2option").innerHTML = questions[q][2];
    document.getElementById("3option").innerHTML = questions[q][3];
    document.getElementById("4option").innerHTML = questions[q][4];

}

function checkAnswered(){

}

function optSel(optionID){
    responses[currentQn] = optionID;
    answered(currentObj);
}

function renderResponse(){

    if(responses[currentQn] == "&|&"){
        for(i = 1; i < 5; i++){
            document.getElementById("option" + i).checked = false;
        }
    }
    else{
        document.getElementById("option" + responses[currentQn]).checked = true;
    }
}

document.getElementById("qb1").click();