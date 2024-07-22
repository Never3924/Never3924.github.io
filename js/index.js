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

    link(
        'Never3924のパンジャンドラムのゲーム',
        '2日で作った。クオリティ低すぎてヤバい',
        getLink('Pages/Panjandrum/')
    );

    link(
        'Never3924のMap Guess',
        'GeoGuessrの(ほぼ)逆で、指定したポイントの航空写真を選択肢から選ぶ。',
        getLink('Pages/mapguess/')
    );

    link(
        'Never3924のAI Guess',
        'どの文がAIに指定の画像を読み込ませて生成した文かを当てる',
        getLink('Pages/aiguess/')
    );
});
