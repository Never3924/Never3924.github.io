document.addEventListener('DOMContentLoaded', function() {
    const resultInput = document.getElementById('result');
    const addButton = document.getElementById('add-button');
    const formulaToggle = document.getElementById('formula-toggle');
    const formulaDisplay = document.getElementById('formula');
    const totalDisplay = document.getElementById('total');
    const resetButton = document.getElementById('reset-button');

    let results = [];
    const costPerGame = 350;

    addButton.addEventListener('click', function() {
        const result = parseInt(resultInput.value);
        if (!isNaN(result)) {
            results.push(result);
            updateDisplay();
            resultInput.value = '';
        } else {
            alert('有効な数字を入力してください。');
        }
    });

    resetButton.addEventListener('click', function() {
        results = [];
        updateDisplay();
        formulaDisplay.style.display = 'none'; // リセット時に計算式を非表示にする
    });

    formulaToggle.addEventListener('click', function() {
        formulaDisplay.style.display = formulaDisplay.style.display === 'none' ? 'block' : 'none';
    });

    function updateDisplay() {
        let formula = '';
        let total = 0;
        results.forEach((result, index) => {
            const profit = result - costPerGame;
            formula += `(${profit})`;
            if (index < results.length - 1) {
                formula += '+';
            }
            total += profit;
        });
        
        formulaDisplay.textContent = formula || 'まだデータがありません。';
        totalDisplay.textContent = total;
    }
});