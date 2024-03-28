document.addEventListener('DOMContentLoaded', () => {
    function addFile(text, link) {
        let element = document.getElementById('files');
        let file = document.createElement('span');
        file.classList.add('file');
        let aTag = document.createElement('a');
        aTag.href = link;
        aTag.textContent = text;
        aTag.download = true;
        file.appendChild(aTag);
        element.appendChild(file);
    }

    addFile('test.txt', './files/test.txt');
});
