var count = 1;
function Generate(){
  var code = '<br><div class = "card text-center" style = "width = 40%; "><div class="card-header">Dynamic Question</div><div class="card-body"><textarea>' + count + '</textarea></div><div class="card-footer text-muted">Halonex Projects</div></div>';
  document.getElementById( count - 1 ).innerHTML += code + "</div><div id =" + count + ">";
  count += 1;
}