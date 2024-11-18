document.addEventListener('DOMContentLoaded', () => {
    function setOc(value) {
        if (
            ![
                'F1',
                'F#1',
                'G1',
                'G#1',
                'A1',
                'A#1',
                'B1',
                'C2',
                'C#2',
                'D2',
                'D#2',
                'E2',
                'F2',
                'F#2',
                'G2',
                'G#2',
                'A2',
                'A#2',
                'B2',
                'C3',
                'C#3',
                'D3',
                'D#3',
                'E3',
            ].hasOwnProperty(value)
        ) {
            if (/[A-G]#?\d+/.test(value)) {
                const [d, m, s, l] = value.match(/([A-G])(#?)(\d+)/);
                if (l == '2') {
                    return value;
                } else {
                    if (l == '3') {
                        return m + s + '2';
                    }
                    return m + s + '2';
                }
            }
        }

        return value;
    }

    async function midi2Recorder(file) {
        // MIDIファイルを解析
        const arrayBuffer = await file.arrayBuffer();
        const midi = new Midi(arrayBuffer);

        // トラックのノートを解析
        const fingeringSequence = [];
        let lastNoteEndTime = 0; // 前回のノートの終了時刻を追跡

        midi.tracks.forEach((track) => {
            track.notes.forEach((note) => {
                // 休符の検出
                if (note.time > lastNoteEndTime) {
                    fingeringSequence.push({
                        type: 'note',
                        note: 'rest',
                        time: note.time, // 開始時刻
                        duration: note.time - lastNoteEndTime, // 音の長さ
                    });
                }

                // ノートの運指を追加
                const noteName = setOc(note.name); // ノート名 (例: C4, D4)
                fingeringSequence.push({
                    type: 'note',
                    note: noteName,
                    time: note.time, // 開始時刻
                    duration: note.duration, // 音の長さ
                });

                // 終了時刻を更新
                lastNoteEndTime = note.time + note.duration;
            });
        });

        return fingeringSequence;
    }
    const table = {
        C1: 261.616,
        'C#1': 277.183,
        D1: 293.665,
        'D#1': 311.127,
        E1: 329.628,
        F1: 349.228,
        'F#1': 369.994,
        G1: 391.995,
        'G#1': 415.305,
        A1: 440.0,
        'A#1': 466.164,
        B1: 493.883,

        C2: 523.251,
        'C#2': 554.365,
        D2: 587.33,
        'D#2': 622.254,
        E2: 659.255,
        F2: 698.456,
        'F#2': 739.989,
        G2: 783.991,
        'G#2': 830.609,
        A2: 880.0,
        'A#2': 932.328,
        B2: 987.767,
    };

    // AudioContextの使い回し
    let audioContext;

    function getAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
        }
        return audioContext;
    }

    // ビープ音を再生する関数
    function playBeep(note, duration) {
        return new Promise((resolve, reject) => {
            if (note === 'rest') {
                // 'rest' が指定された場合は音を鳴らさずに待機
                console.log('Rest for ' + duration + ' ms');
                setTimeout(resolve, duration); // 休符の間はただ待機
                return;
            }

            if (!table[note]) {
                console.error('Invalid note: ', note);
                reject('Invalid note');
                return;
            }

            const audioContext = getAudioContext();

            // AudioContextがsuspended状態か確認し、必要に応じてresumeする
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            // オシレーターを作成
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine'; // 波形をサイン波に設定
            oscillator.frequency.setValueAtTime(
                table[note],
                audioContext.currentTime
            ); // 音の周波数を設定

            // ゲインノードを作成して音量を設定
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(1, audioContext.currentTime); // 音量を最大に設定

            // オシレーターとゲインノードを接続
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // オシレーターの開始と停止のタイミングを設定
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration / 1000); // ミリ秒単位で停止時間を設定

            // 再生が終了したらresolveで次の処理へ進む
            oscillator.onended = () => resolve();
        });
    }

    // MIDIファイルを読み込んでリコーダー運指配列を生成
    document
        .getElementById('midiFileInput')
        .addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const fingeringSequence = await midi2Recorder(file);
            let index = 0;
            function setImg(idx) {
                console.log(idx);
                document.getElementById(
                    'output'
                ).src = `./imgs/${encodeURIComponent(
                    fingeringSequence[idx].note
                )}.png`;

                document.getElementById('page').innerText = `${idx} / ${
                    fingeringSequence.length - 1
                }`;
            }
            setImg(index);

            document.getElementById('back').addEventListener('click', () => {
                index--;
                if (index < 0) index = fingeringSequence.length - 1;
                setImg(index);
            });
            document.getElementById('forw').addEventListener('click', () => {
                index++;
                if (fingeringSequence.length <= index) index = 0;
                setImg(index);
            });
            document
                .getElementById('play')
                .addEventListener('click', async () => {
                    const sleep = (m) => new Promise((r) => setTimeout(r, m));
                    for (let i = 0; i < fingeringSequence.length; i++) {
                        const value = fingeringSequence[i];
                        const duration = value.duration;

                        await playBeep(value.note, duration * 1000);
                        if (value.note != 'rest') {
                            setImg(i);
                        }
                    }
                });
        });
});
