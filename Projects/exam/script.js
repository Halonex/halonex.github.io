responses = {};

const firebaseConfig = {
    apiKey: "AIzaSyBXwIkKrsabwkwqQJNgs65f6UhPEfNBkjc",
    authDomain: "halonex-exams.firebaseapp.com",
    databaseURL: "https://halonex-exams-default-rtdb.firebaseio.com",
    projectId: "halonex-exams",
    storageBucket: "halonex-exams.appspot.com",
    messagingSenderId: "119803462",
    appId: "1:119803462:web:14eeaf057c0b5d1ee88447",
    measurementId: "G-J0HX1VPS63"
  };
  
  firebase.initializeApp(firebaseConfig);

questions = {
    1: ["who is the chief executive officer of LOF ?", "Dominic", "Walter", "Dominic Walter", "Dominic Walter T"],
    2: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    3: ["The filament of a light bulb has surface area 64 mm2. The filament can be considered as a blackbody at temperature 2500 K emitting radiation like a point source when viewed from far. At nightthe light bulb is observed from a distance of 100 m. Assume the pupil of the eyes of the observer tobe circular with radius 3 mm. Then(Take Stefan-Boltzmann constant = 5.67 × 10−8 Wm−2K−4, Wien’s displacement constant =2.90 × 10−3 m-K, Planck’s constant = 6.63 × 10−34 Js, speed of light in vacuum = 3.00 ×108 ms−1)", "power radiated by the filament is in the range 642 W to 645 W", "The filament of a light bulb has surface area 64 mm2. ", "the wavelength corresponding to the maximum intensity of light is 1160 nm", "taking the average wavelength of emitted radiation to be 1740 nm, the total number of photons entering per second into one eye of the observer is in the range 2.75 × 1011 to 2.85 × 1011"],
    4: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    5: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    6: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    7: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    8: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    9: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    10: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    11: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
    12: ["Expansion of WWW :", "Wrong Water Web", "Wage for Wilde Work", "World Wide Web", "Wakeup Work Worry"],
};

$('.btn-expand-collapse').click(function (e) {
    $('.navbar-primary').toggleClass('collapsed');

});

/* Code to avoid xss or code injection attacks and tampering attempts */

document.addEventListener('contextmenu', event => event.preventDefault());

$('body').keydown(function (e) {
    if (e.which == 123) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.which == 73) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.which == 75) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.which == 67) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.which == 74) {
        e.preventDefault();
    }
});
!function () {
    function detectDevTool(allow) {
        if (isNaN(+allow)) allow = 100;
        var start = +new Date();
        debugger;
        var end = +new Date();
        if (isNaN(start) || isNaN(end) || end - start > allow) {
            console.log('DEVTOOLS detected ' + allow);
        }
    }
    if (window.attachEvent) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            detectDevTool();
            window.attachEvent('onresize', detectDevTool);
            window.attachEvent('onmousemove', detectDevTool);
            window.attachEvent('onfocus', detectDevTool);
            window.attachEvent('onblur', detectDevTool);
        } else {
            setTimeout(argument.callee, 0);
        }
    } else {
        window.addEventListener('load', detectDevTool);
        window.addEventListener('resize', detectDevTool);
        window.addEventListener('mousemove', detectDevTool);
        window.addEventListener('focus', detectDevTool);
        window.addEventListener('blur', detectDevTool);
    }
}();


/*---- Code to avoid xss and code injection attacks and tampering attempts ends ----*/


/*Exam window rendering functions and logics*/

function addQnButton(n) {
    var cc = "qb" + n;
    document.getElementById("qBpan").innerHTML += '<li class="item unvis float-item" id = "' + cc + '"><p class = "li1" id = "' + cc + '">' + n + '</p></li>';
}

function markForReview(qn) {
    x = document.getElementById(qn);
    x.classList = "item unvis float-item mforrev";
}

function answered(qn) {
    x = document.getElementById(qn);
    x.classList = "item ans float-item";
}

function unanswered(qn) {
    x = document.getElementById(qn);
    x.classList = "item unans float-item";
}

currentQn = "1";
currentObj = "qb1";

for (i = 1; i <= Object.keys(questions).length; i++) {
    addQnButton(i);
    responses[i] = "&|&";
}

var li = document.getElementsByClassName("li1");

for (var i = 0; i < li.length; i++) {
    li[i].addEventListener("click", panbutclick);
}

function panbutclick(e) {
    currentObj = e.target.attributes.id.value;
    currentQn = currentObj.split("b")[1];
    if (responses[currentQn] == "&|&") {
        unanswered(currentObj);
    }

    renderQuestion();
}

function renderQuestion() {
    console.log(currentQn);
    document.getElementById("QuesNo").innerHTML = "Question: " + currentQn;
    document.getElementById("QuesMain").innerHTML = questions[currentQn][0];
    x = renderOptions(currentObj);
    renderResponse();
}

function renderOptions(q) {
    q = q.split("b")[1];
    document.getElementById("1option").innerHTML = questions[q][1];
    document.getElementById("2option").innerHTML = questions[q][2];
    document.getElementById("3option").innerHTML = questions[q][3];
    document.getElementById("4option").innerHTML = questions[q][4];

}

function checkAnswered() {

}

function optSel(optionID) {
    responses[currentQn] = optionID;
    answered(currentObj);
}

function renderResponse() {

    if (responses[currentQn] == "&|&") {
        for (i = 1; i < 5; i++) {
            document.getElementById("option" + i).checked = false;
        }
    }
    else {
        document.getElementById("option" + responses[currentQn]).checked = true;
    }
}

document.getElementById("qb1").click();


function res() {
    if (document.getElementsByClassName("main-content")[0].style.marginRight == "100px") {
        document.getElementsByClassName("main-content")[0].style.marginRight = "300px";
        console.log("to 300");
    }
    else {
        document.getElementsByClassName("main-content")[0].style.marginRight = "100px";
        console.log("to 100");
    }

}

function downloadQn() {

}

function autoSubmit() {

}

function autoSave() {

}

function submitUpload() {

}

var countDownDate = new Date("Oct 17, 2022 22:00:00").getTime();

var x = setInterval(function () {

    var now = new Date().getTime();

    var distance = countDownDate - now;
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("timerDis").innerHTML = "Remaining : " + (minutes + hours * 60) + "m " + seconds + "s ";

    if (now < countDownDate) {
        clearInterval(x);
        document.getElementById("timerDis").innerHTML = "EXPIRED";
    }
}, 1000);


function Overlay(overlay) {
    document.getElementById(overlay).style.visibility = true;
    setTimeout(function () {
        document.getElementById(overlay).style.visibility = false;
    }, 2000);
}