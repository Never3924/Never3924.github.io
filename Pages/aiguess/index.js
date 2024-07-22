document.addEventListener('DOMContentLoaded', onLoad);

function getTileCoords(lat, lon, zoom) {
    const xTile = parseInt(Math.floor(((lon + 180) / 360) * (1 << zoom)));
    const yTile = parseInt(
        Math.floor(
            ((1 -
                Math.log(
                    Math.tan((lat * Math.PI) / 180) +
                        1 / Math.cos((lat * Math.PI) / 180)
                ) /
                    Math.PI) /
                2) *
                (1 << zoom)
        )
    );
    return { z: zoom, x: xTile, y: yTile };
}

async function getLatLon(nowTile = []) {
    var POS_X = 37.5; //基準点の緯度
    var POS_Y = 136.5; //基準点の経度
    var DIS_WEST = 12.6; //西日本側の距離
    var DIS_EAST = 10.2; //東日本型の距離
    var x = Math.random() * (DIS_EAST + DIS_WEST) - DIS_WEST; //緯度用の乱数

    var DEG_X = x < 0 ? -157.5 : 61.5; //基準点からの角度設定
    var DEG_Y = -30; //基準点からの角度設定
    var Y_MAX = 5.5; //基準点からの距離設定
    var y = Math.random() * Y_MAX; //経度用の乱数

    var ido =
        POS_X +
        Math.abs(x) * Math.sin((DEG_X / 180) * Math.PI) +
        y * Math.sin((DEG_Y / 180) * Math.PI);
    var keido =
        POS_Y +
        Math.abs(x) * Math.cos((DEG_X / 180) * Math.PI) +
        y * Math.cos((DEG_Y / 180) * Math.PI);

    const response = await fetch(
        `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${ido}&lon=${keido}`
    );

    const json = await response.json();

    const isEmpty = (obj) => {
        return Object.keys(obj).length === 0;
    };

    const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

    if (isEmpty(json)) {
        await sleep(1000);
        return getLatLon();
    }

    if (nowTile.includes([ido, keido])) {
        await sleep(1000);
        return getLatLon();
    }

    return [ido, keido];
}

async function getTiles(num) {
    const tiles = [];
    const async = [];

    for (let i = 0; i < num; i++) {
        progress.value += 0.1;
        load.querySelector(
            'p'
        ).textContent = `サンプルの緯度経度を生成しています... ${i + 1} / 3`;

        const latLon = await getLatLon(tiles);

        const tile = getTileCoords(latLon[0], latLon[1], 15);

        tiles.push(tile);
    }

    return tiles;
}

function genUrl(x, y, zoom) {
    return `https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/${zoom}/${x}/${y}.jpg`;
}

async function askGeminiImg(url) {
    try {
        const response = await fetch(url);

        progress.value += 0.1;

        if (response.status === 200) {
            const json = await response.json();

            if (!json.isFailed) {
                if (!json.res.isFailed) {
                    if (json.res.res) {
                        if (json.res.res[0].text) {
                            const text = json.res.res[0].text;

                            return JSON.parse(text);
                        }
                    }
                }
            }
            return null;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

const shuffleArray = (array) => {
    const cloneArray = [...array];

    const result = cloneArray.reduce((_, cur, idx) => {
        let rand = Math.floor(Math.random() * (idx + 1));
        cloneArray[idx] = cloneArray[rand];
        cloneArray[rand] = cur;
        return cloneArray;
    });

    return result;
};

async function questionGen() {
    document.getElementById('load').classList.remove('invisible');
    document.getElementById('load').classList.add('visible');

    document.getElementById('main').classList.add('invisible');
    document.getElementById('main').classList.remove('visible');

    progress.value = 0;
    load.querySelector('p').textContent =
        'サンプルの緯度経度を生成しています... 0 / 3';

    const tiles = await getTiles(3);

    const tileUrls = tiles.map((tile) => genUrl(tile.x, tile.y, tile.z));

    progress.value += 0.1;
    load.querySelector('p').textContent = 'AIの回答を生成しています...';

    const ask = await Promise.all([
        askGeminiImg(
            'https://woozy-valiant-fabrosaurus.glitch.me/api/v1/nvgeminiask?url=' +
                tileUrls[0]
        ),
        askGeminiImg(
            'https://woozy-valiant-fabrosaurus.glitch.me/api/v1/nvgeminiask?url=' +
                tileUrls[1]
        ),
        askGeminiImg(
            'https://woozy-valiant-fabrosaurus.glitch.me/api/v1/nvgeminiask?url=' +
                tileUrls[2]
        ),
    ]);

    progress.value += 0.1;
    load.querySelector('p').textContent = 'シャッフルしています...';

    const asks = shuffleArray(
        ask.map((v) => {
            v.unshift(ask.indexOf(v));

            return v;
        })
    );

    let tileUrl = tileUrls.map((url) => {
        return { index: tileUrls.indexOf(url), url };
    });

    console.log(asks);

    console.log(tileUrl);

    tileUrl = tileUrl.map((url) => {
        return tileUrl[asks[tileUrl.indexOf(url)][0]];
    });

    console.log(tileUrl);

    progress.value += 0.1;
    load.querySelector('p').textContent = '生成が完了しました';

    progress.value += 0.1;

    document.getElementById('load').classList.add('invisible');
    document.getElementById('load').classList.remove('visible');

    document.getElementById('main').classList.remove('invisible');
    document.getElementById('main').classList.add('visible');

    return { asks, tileUrl };
}

function setImages(list) {
    const imgs = document.getElementsByClassName('img');

    for (let i = 0; i < imgs.length; i++) {
        imgs[i].querySelector('label > img').src = list[i];
    }
}

function setAITexts(list) {
    const ais = document.getElementsByClassName('ai');

    for (let i = 0; i < ais.length; i++) {
        ais[i].querySelector('label').innerHTML = list[i];
    }
}

let question = null;
let score = 0;

function getRadio() {
    const ais = document.getElementsByName('ai');
    let val = null;

    for (let i = 0; i < ais.length; i++) {
        if (ais[i].checked) {
            val = i;
        }
    }

    return val;
}

function answerCheck() {
    if (question) {
        const ask = getRadio();
        if (ask == question.tileUrl[0].index) {
            document
                .getElementById('btns')
                .querySelector('div > p:nth-child(1)').innerHTML = '正解!';

            score++;

            document
                .getElementById('btns')
                .querySelector('div > p:nth-child(2)').innerHTML =
                'スコア: ' + score;
        } else {
            document
                .getElementById('btns')
                .querySelector('div > p:nth-child(1)').innerHTML = '不正解...';

            score--;

            document
                .getElementById('btns')
                .querySelector('div > p:nth-child(2)').innerHTML =
                'スコア: ' + score;
        }

        document
            .getElementsByClassName('ai')
            [question.tileUrl[0].index].classList.add('answer');

        const ais = document.getElementsByClassName('ai');

        for (let i = 0; i < ais.length; i++) {
            ais[i].querySelector('input').disabled = true;
        }
    }
}

function reset() {
    question = null;

    setAITexts(['', '', '']);

    setImages(['']);

    document
        .getElementById('btns')
        .querySelector('div > p:nth-child(1)').innerHTML = '';
}

async function skip() {
    reset();

    await setUp();
}

async function setUp() {
    question = await questionGen();

    const ais = document.getElementsByClassName('ai');

    for (let i = 0; i < ais.length; i++) {
        ais[i].querySelector('input').disabled = false;
        ais[i].classList.remove('answer');
    }

    setImages([question.tileUrl[0].url]);

    setAITexts(
        question.asks.map((v) =>
            v
                .map((v2) => v2.feature)
                .filter((v3) => v3)
                .map((v4) => '・' + v4 + '<br>')
        )
    );

    document.getElementsByName('ai')[0].checked = true;
}

async function onLoad() {
    document
        .getElementById('answerCheck')
        .addEventListener('click', answerCheck);

    document.getElementById('skip').addEventListener('click', skip);

    document
        .getElementById('btns')
        .querySelector('div > p:nth-child(2)').innerHTML = 'スコア: ' + score;

    await setUp();
}
