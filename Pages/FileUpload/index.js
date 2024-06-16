document.addEventListener('DOMContentLoaded', () => {
    function addFile(text, link) {
        let element = document.getElementById('files');
        let file = document.createElement('span');
        file.classList.add('file');
        let aTag = document.createElement('a');
        aTag.href = link;
        aTag.textContent = text;
        aTag.download = text;
        file.appendChild(aTag);
        file.innerHTML += "<br />"
        element.appendChild(file);
    }

    addFile('test.txt', './files/test.txt');
    addFile('わあああ.exe', './files/わあああ.exe');
    addFile('わあああ.exe', './files/文字認識.sb3');
    addFile('わあああ.exe', './files/文字認識.txt');
});
