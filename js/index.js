document.addEventListener('DOMContentLoaded', () => {
    function link(title, text, link) {
        let root = document.createElement('div');
        root.classList.add('link');
        let h1 = document.createElement('h1');
        h1.innerHTML = title;
        let textContent = document.createElement('p');
        textContent.innerHTML = text;

        root.onclick = (e) => {
            window.location.href = link;
        };

        root.appendChild(h1);
        root.appendChild(textContent);
        document.getElementById('links').appendChild(root);
    }

    link(
        'Never3924のファイルアップローダー',
        'いろいろなファイルをアップロードしてます。',
        getLink('Pages/FileUpload/')
    );
});
