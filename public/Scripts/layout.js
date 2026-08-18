fetch('/sidebar.html')
    .then(function(repuesta){
        return repuesta.text();
    })
    .then(function(html){
        document.getElementById('sidebar-container').innerHTML = html;
    });