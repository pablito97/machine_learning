var positiveWordList ='';
var negativeWordList ='';
var net = '';
var brainReady = 0;
var progressbar = 0;

const status = document.getElementById('status');
status.innerText = `Sieć nie wyuczona`;

const progressBar = document.getElementById('progress-bar');
progressBar.style.width = progressbar+'%';

const resultPositive = document.getElementById('resultPositive');
resultPositive.style.display = 'none';

const resultNegative = document.getElementById('resultNegative');
resultNegative.style.display = 'none';

// Pobieranie formularza i przycisku
const form = document.getElementById('file-form');
const submitButton = form.querySelector('button[type="submit"]');

// Obsługa zdarzenia submit formularza
form.addEventListener('submit', async (event) => {
  // Zatrzymanie domyślnej akcji formularza
  event.preventDefault();

  // Wczytywanie plików z pól input
  const positiveWordsFile = form.querySelector('#positive-words-file').files[0];
  const negativeWordsFile = form.querySelector('#negative-words-file').files[0];
  const trainingDataFile = form.querySelector('#training-data-file').files[0];

  // Sprawdzenie, czy wszystkie pliki zostały wybrane
  if (positiveWordsFile && negativeWordsFile && trainingDataFile) {
    // Deaktywacja przycisku submit
    submitButton.setAttribute('disabled', true);

    // Wczytywanie i przetwarzanie plików
    await processFiles(positiveWordsFile, negativeWordsFile, trainingDataFile);

    // Aktywacja przycisku submit
    submitButton.removeAttribute('disabled');

    // Wyświetlenie komunikatu o pomyślnym wczytaniu plików
    //alert('Pliki wczytane pomyślnie!');
	
  } else {
    // Wyświetlenie komunikatu o błędzie
    alert('Należy wybrać wszystkie pliki!');
  }
});

// Funkcja do wczytywania pliku za pomocą FileReader
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Funkcja do przetwarzania plików
async function processFiles(positiveWordsFile, negativeWordsFile, trainingDataFile) {
  // Wczytywanie plików
  //alert('Przetwarzam pliki');
  positiveWords = await readFile(positiveWordsFile);
  negativeWords = await readFile(negativeWordsFile);
  const trainingData = await readFile(trainingDataFile);

  // Podział tekstu na wyrazy i zapisanie ich do tablic
  positiveWordList = positiveWords.split(',');
  negativeWordList = negativeWords.split(',');
	//console.log(positiveWordList);
	
	// Konwersja danych do uczenia na tablicę obiektów
	const trainingDataArray = trainingData.split('\n').map((row) => {
	  const columns = row.split(',');
	  return {
		input: {
		  positive: parseInt(columns[0]),
		  negative: parseInt(columns[1])
		},
		output: {
		  positive: parseInt(columns[2])
		}
	  };
	});

//alert('Piki przetworzone');
status.innerText = `Przetwarzanie plików`;
progressbar = 25;
progressBar.style.width = progressbar+'%';
await sleep(2000);
// Utworzenie sieci neuronowej za pomocą biblioteki brain.js
net = new brain.NeuralNetwork();
status.innerText = `Utworzono sieć neuronową`;
progressbar = 50;
progressBar.style.width = progressbar+'%';
//alert('Utworzono sieć neuronową');
// Uczenie sieci neuronowej na podstawie danych do uczenia
net.train(trainingDataArray);

await sleep(2000);

status.innerText = `Wyuczono sieć neuronową`;
progressbar = 75;
progressBar.style.width = progressbar+'%';
brainReady = 1;
}

// Funkcja do przewidywania sentymentu
function predictSentiment(text) {
  // Podział tekstu na wyrazy i zliczanie wyrazów pozytywnych i negatywnych
  progressbar = 85;
  progressBar.style.width = progressbar+'%';
  status.innerText = `Przetwarzam zdanie`;
  
  const words = text.split(' ');
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach((word) => {
    if (classifyWordPositive(word)) {
      positiveCount += 1;
    } else if (classifyWordNegative(word)) {
      negativeCount += 1;
    }
  });
  
  //console.log('pozytywne = ' + positiveCount);
  //console.log('negatywne = ' + negativeCount);
  
  // Przewidywanie sentymentu za pomocą sieci neuronowej
  const result = net.run({ positive: positiveCount, negative: negativeCount });

  // Określenie, do jakiej klasy zostało zaklasyfikowane zdanie
  let sentiment;
  if (result.positive > 0.5) {
    sentiment = 'pozytywne';
	resultPositive.style.display = 'block';
	resultNegative.style.display = 'none';
  } else {
    sentiment = 'negatywne';
	resultPositive.style.display = 'none';
	resultNegative.style.display = 'block';
  }

  // Wyświetlenie wyniku na stronie
  //const resultContainer = document.getElementById('result');
  //resultContainer.innerText = `Zdanie ${sentiment}`;
  progressbar = 100;
  progressBar.style.width = progressbar+'%';
  status.innerText = `Przetwarzanie zdania zakończone`;
  // Zwracanie wyniku jako pozytywny lub negatywny
  return sentiment;
}

// Funkcja do klasyfikowania słowa jako pozytywne lub negatywne
function classifyWordPositive(word){
  let maxSimilarity = 0.75;

  // Porównaj słowo z każdym słowem pozytywnym ze słownika
  for (const positiveWord of positiveWordList) {
    const similarity = stringSimilarity.compareTwoStrings(word, positiveWord);

    // Jeśli podobieństwo jest wystarczająco wysokie, zaklasyfikuj słowo jako pozytywne
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
		return 1;
    }
  }
  return 0;
}

function classifyWordNegative(word){
  let maxSimilarity = 0.75;

  // Porównaj słowo z każdym słowem pozytywnym ze słownika
  for (const negativeWord of negativeWordList) {
    const similarity = stringSimilarity.compareTwoStrings(word, negativeWord);

    // Jeśli podobieństwo jest wystarczająco wysokie, zaklasyfikuj słowo jako pozytywne
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
		return 1;
    }
  }
  return 0;
}

// Pobranie formularza
const form2 = document.getElementById('sentiment-form');

// Obsługa zdarzenia wysłania formularza
form2.addEventListener('submit', (event) => {
  // Zatrzymanie domyślnego zachowania formularza
  event.preventDefault();

  // Pobranie pola tekstowego z formularza
  const textField = document.getElementById('text');
  const text = textField.value;
  
  if(brainReady == 1){
	  // Wywołanie funkcji do przewidywania sentymentu
	  predictSentiment(text);
  }else{
	  alert('Najpierw wczytaj pliki i wyucz maszynę');
  }
});

function test(){
	const result = net.run({
	  positive: 2,
	  negative: 0
	});

	console.log(result);
}

function clearResult(){
	if(brainReady == 1){
		resultPositive.style.display = 'none';
		resultNegative.style.display = 'none';
		status.innerText = `Wyuczono sieć neuronową`;
		progressbar = 75;
		progressBar.style.width = progressbar+'%';
		console.log('clear');
	}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}