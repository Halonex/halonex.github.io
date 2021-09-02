
var cssvalues;

function update() {
    document.getElementById("screen1").innerHTML = document.getElementById("t1").value + " <style> " + document.getElementById("t2").value.replaceAll("body", ".screen1") + " </style> <script>" + document.getElementById("t3").value + " </" + "script>";
    writeUserData("userId", document.getElementById("t1").value, document.getElementById("t2").value, document.getElementById("t3").value);
    if (document.getElementById("t2").value.includes("body")) {
        cssvalues = document.getElementById("t2").value;
        cssvalues = cssvalues.split("body").split("{")[1].split("}")[0];
    }
}

function dragElement(element, direction) {
    var md;
    const first = document.getElementById("first");
    const second = document.getElementById("second");

    element.onmousedown = onMouseDown;

    function onMouseDown(e) {
        md = {
            e,
            offsetLeft: element.offsetLeft,
            offsetTop: element.offsetTop,
            firstWidth: first.offsetWidth,
            secondWidth: second.offsetWidth
        };

        document.onmousemove = onMouseMove;
        document.onmouseup = () => {
            document.onmousemove = document.onmouseup = null;
        }
    }

    function onMouseMove(e) {
        var delta = {
            x: e.clientX - md.e.clientX,
            y: e.clientY - md.e.clientY
        };

        if (direction === "H") {
            delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
                md.secondWidth);

            element.style.left = md.offsetLeft + delta.x + "px";
            first.style.width = (md.firstWidth + delta.x) + "px";
            second.style.width = (md.secondWidth - delta.x) + "px";
        }
    }
}


dragElement(document.getElementById("separator"), "H");


function openPage(pageName, elmnt, color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}

document.getElementById("defaultOpen").click();

function openPage1(pageName, elmnt, color) {
    var i, tabcontent1, tablinks1;
    tabcontent1 = document.getElementsByClassName("tabcontent1");
    for (i = 0; i < tabcontent1.length; i++) {
        tabcontent1[i].style.display = "none";
    }
    tablinks1 = document.getElementsByClassName("tablink1");
    for (i = 0; i < tablinks1.length; i++) {
        tablinks1[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}

document.getElementById("defaultOpen").click();

var firebaseConfig = {
    apiKey: "AIzaSyCy89ifV9bScL0PLP47RXbSKFirVwineyo",
    authDomain: "halonex-companion-usa.firebaseapp.com",
    databaseURL: "https://halonex-companion-usa-default-rtdb.firebaseio.com",
    projectId: "halonex-companion-usa",
    storageBucket: "halonex-companion-usa.appspot.com",
    messagingSenderId: "109538181074",
    appId: "1:109538181074:web:06e4f1bd75a8b2bf11520b",
    measurementId: "G-FRPTL926XE"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function writeUserData(userId, h, c, j) {
    firebase.database().ref('u1srs/uId2').set((h + "<!--HTML-->pp11113242" + c + "/*CSS*/pp11113242/*JS*/" + j).replace(/\s+/g, ' ').trim().replace(/\n/g, '').replaceAll(' ', 'P|p').replace(/\t/g, '').replaceAll('=', 'E|e').replaceAll('/', 'S|s').replaceAll(':', 'I|i').replaceAll('#', 'H|h').replaceAll(';', 'C|c').replaceAll(',', 'CS|cs').replaceAll('.', 'D|d').replaceAll('!', 'EX|ex').replaceAll('{', 'CB1|cb1').replaceAll('}', 'CB2|cb2'));
}

function check11() {
    if ($(window).width() < 1000) {
        window.location = "https://halonex.github.io/mobile"
    }
}


click_event = new CustomEvent('click');
btn_element = document.querySelector('#do');
btn_element.dispatchEvent(click_event);


var tim = setInterval(clickButton, 1000);

var buffer = "";

function clickButton() {

    if (!(document.getElementById("t1").value.includes("iframe")) && (buffer != document.getElementById("t1").value + " <style> " + document.getElementById("t2").value + " </style> <script>" + document.getElementById("t3").value + " </" + "script>")) {
        click_event = new CustomEvent('click');
        btn_element = document.querySelector('#do');
        btn_element.dispatchEvent(click_event);
        buffer = document.getElementById("t1").value + " <style> " + document.getElementById("t2").value + " </style> <script>" + document.getElementById("t3").value + " </" + "script>";
        writeUserData("userId", document.getElementById("t1").value, document.getElementById("t2").value, document.getElementById("t3").value);
    }
}

