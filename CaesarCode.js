const fs = require('fs');
const readline = require('readline-sync');

let lowerAlphabet = '';
let upperAlphabet = '';
let freqGlobal = [];
let dis = 1039;

for (let i = 1040; i < 1072; i++) {
    upperAlphabet += String.fromCharCode(i);

    if (String.fromCharCode(i) === 'Е')
        upperAlphabet += 'Ё';
}

for (let i = 1072; i <= 1103; i++) {
    lowerAlphabet += String.fromCharCode(i);

    if (String.fromCharCode(i) === 'е')
        lowerAlphabet += 'ё';
}

const completeShift = (symbol, shift) => {
    if (upperAlphabet.indexOf(symbol) !== -1)
        return upperAlphabet[(upperAlphabet.indexOf(symbol) + shift) % upperAlphabet.length];
    else if (lowerAlphabet.indexOf(symbol) !== -1)
        return lowerAlphabet[(lowerAlphabet.indexOf(symbol) + shift) % lowerAlphabet.length];

    return symbol;
}

const cipheringText = (text, shift) => {
    let cipheredText = '';

    for (let i = 0; i < text.length; i++)
        cipheredText += completeShift(text[i], shift);

    return cipheredText;
}

const decipheringText = (text, shift) => {
    let decipheredText = '';
    shift = upperAlphabet.length - shift;

    for (let i = 0; i < text.length; i++)
        decipheredText += completeShift(text[i], shift);

    return decipheredText;
}

// Считывание и обработка сдвига

let shift = readline.question('> ');

shift %= upperAlphabet.length;

if (shift < 0)
    shift += upperAlphabet.length;

// Считывание глобальной таблицы частот 

fs.readFile('freq-global.txt', 'utf-8', (err, data) => {
    freqGlobal = data.split('\n');
    freqGlobal.forEach((value, index) => freqGlobal[index] = Number(value))
});
 

fs.readFile('text.txt', 'utf-8', (err, text) => {

    const cipheredText = cipheringText(text, shift);

    fs.writeFile('ciphered-text.txt', cipheredText, 'utf-8', (err) => !err && console.log('Text ciphered successful!'));

    // Расшифровка

    let decipheredText;

    let minSumFreq = 5;
    let minShift;

    for (let newShift = 1; newShift <= 33; newShift++) {
        let freqLetters = [];

        for (let i = 0; i < 33; i++)
            freqLetters[i] = 0;

        decipheredText = decipheringText(cipheredText, newShift);

        for (let i = 0; i < decipheredText.length; i++) {
            if (upperAlphabet.indexOf(decipheredText[i]) !== -1)
                freqLetters[upperAlphabet.indexOf(decipheredText[i])]++;
            else if (lowerAlphabet.indexOf(decipheredText[i]) !== -1)
                freqLetters[lowerAlphabet.indexOf(decipheredText[i])]++;
        }

        for (let i = 0; i < 33; i++)
            freqLetters[i] = freqLetters[i] / decipheredText.length;

        let sum = 0;

        for (let i = 0; i < 33; i++)
            sum += Math.abs(freqGlobal[i] - freqLetters[i]);

        if (sum < minSumFreq) {
            minSumFreq = sum;
            minShift = newShift;
        }
    }

    decipheredText = decipheringText(cipheredText, minShift);

    fs.writeFile('deciphered-text.txt', decipheredText, 'utf-8', () => console.log('Text deciphered is successful!'));
})