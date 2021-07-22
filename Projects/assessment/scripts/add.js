var mybutton = document.getElementById("myBtn");

var input = document.getElementById("Se");

input.addEventListener("keydown", function(event) {

  if (event.keyCode === 13) {
   event.preventDefault();
   document.getElementById("f132").click();
  }
});

window.onscroll = function() {scrollFunction()};

 var count = 1;
 optionCount = [1];
 optionCount[1] = 1

function Generate(){
  var code = '<br><div style = "width: 80%;"><div class="card"><div class="card-header">Question No : <input type="number" name="qnno" style="width : 50px; text-align: center;" placeholder="' + (count + 1) + '" value = "' + (count + 1) + '"></div><div class="card-body"><div class="form-floating"><textarea class="form-control" placeholder="" id="floatingTextarea2" style="height:  100px"></textarea><label for="floatingTextarea2">Question</label></div><p class="card-text" style="color: grey; font-size : 11px; ">Question Supports html formats (Bold, Headings, underlining)</p><hr><button type="button" class="btn btn-primary" onclick="addOption(' + (count + 1)+ ');">Add Options</button> </div><div id = "Options"><div id = "'+ (count + 1) + "o" + 0 + '"></div></div></div>';
  document.getElementById(count).innerHTML += code + "</div><div id =" + (count + 1) + ">";
  count += 1;
  optionCount[count] = 1
}

function addOption(c){
  count = c;
  var id = c + "o" + (optionCount[c] - 1);
  console.log(id);
  var code = '<br><div class="container"><div class="row"><div class="col-1"><input type = "checkbox"></div><div class="col"><div class="form-floating"><textarea class="form-control" placeholder="Option" id="floatingTextarea"></textarea><label for="floatingTextarea">Option ' + optionCount[c] +'</label></div></div></div>';
  document.getElementById(id).innerHTML += code + "</div><div id = " + count + "o" + optionCount[c] + ">";
  optionCount[c]  += 1;
}


function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


window.smoothScroll = function(target) {
    var scrollContainer = target;
    do { 
        scrollContainer = scrollContainer.parentNode;
        if (!scrollContainer) return;
        scrollContainer.scrollTop += 1;
    } while (scrollContainer.scrollTop == 0);

    var targetY = 0;
    do { 
        if (target == scrollContainer) break;
        targetY += target.offsetTop;
    } while (target = target.offsetParent);

    scroll = function(c, a, b, i) {
        i++; if (i > 30) return;
        c.scrollTop = a + (b - a) / 30 * i;
        setTimeout(function(){ scroll(c, a, b, i); }, 20);
    }
    scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
}
