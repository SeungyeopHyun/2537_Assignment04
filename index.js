let gameTimer = undefined;
let seconds = 0;
let images = [];
let firstCard = undefined;
let secondCard = undefined;
let matchedPairs = 0;
let clicksCount = 0;
let isGameOver = false;
let timeUp = false;
let rows = 2;
let cols = 3;
let totalPairs = Math.ceil(rows * cols / 2);
let pairsLeft = totalPairs;

const startTimer = () => {
  gameTimer = setInterval(() => {
    seconds++;
    $('#timer').text(`${seconds} `);

    let timeLimit = 0;
    switch (`${rows}x${cols}`) {
      case '2x3':
        timeLimit = 100;
        break;
      case '3x4':
        timeLimit = 200;
        break;
      case '4x6':
        timeLimit = 300;
        break;
      default:
        timeLimit = 100;
    }

    if (seconds >= timeLimit) {
      clearInterval(gameTimer);
      alert("Time's up.. try again..!");
      timeUp = true;
      gameOver();
    }
  }, 1000);
};

const cardClickHandler = function () {
  if ($(this).hasClass('flip') || $(this).hasClass('matched')) {
    return;
  }

  clicksCount++;
  updateStats();
  $(this).toggleClass("flip");

  if (isGameOver || timeUp) {
    return;
  }

  if (!firstCard) {
    firstCard = this;
  } else if (!secondCard) {
    secondCard = this;

    if ($(firstCard).find("img").attr("data-pokemon") === $(secondCard).find("img").attr("data-pokemon")) {
      console.log("match");
      $(firstCard).addClass('matched');
      $(secondCard).addClass('matched');
      firstCard = undefined;
      secondCard = undefined;

      matchedPairs++;
      pairsLeft--;
      updateStats();

      if (matchedPairs === totalPairs) {
        clearInterval(gameTimer);
        gameOver();
        setTimeout(() => {
          alert("Success! You've found all pairs");
        }, 1000);
      }
    } else {
      console.log("no match");
      setTimeout(() => {
        $(firstCard).toggleClass("flip");
        $(secondCard).toggleClass("flip");
        firstCard = undefined;
        secondCard = undefined;
        updateStats();
      }, 1000);
    }
  } else {
    $(firstCard).toggleClass("flip");
    $(secondCard).toggleClass("flip");
    firstCard = this;
    secondCard = undefined;
    updateStats();
  }
};

const resetGame = () => {
  resetTimer();
  matchedPairs = 0;
  pairsLeft = totalPairs;
  clicksCount = 0;
  updateStats();
  createGameGrid();
  startTimer(); 
};

const resetTimer = () => {
  clearInterval(gameTimer);
  seconds = 0;
  $('#timer').text('0');
  isGameOver = false;
  timeUp = false;
};

const gameOver = () => {
  isGameOver = true;
};

const powerUp = () => {
  $('.card').addClass('flip');
  setTimeout(() => {
    $('.card').removeClass('flip');
  }, 1000);
  seconds += 15;
  $('#timer').text(`${seconds} `);
};

const retrievePokemonImages = () => {
  const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=500';

  $.ajax({
    url: apiUrl,
    method: 'GET',
    success: function (response) {
      try {
        const pokemonList = response.results;
        const shuffledPokemonList = shuffleArray(pokemonList);
        const selectedPokemon = shuffledPokemonList.slice(0, Math.ceil(rows * cols / 2));
        const duplicatedPokemon = [...selectedPokemon, ...selectedPokemon];

        images = duplicatedPokemon.map((pokemon) => {
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`;
          return $('<img>').attr('src', imageUrl).attr('data-pokemon', pokemon.name);
        });

        createGameGrid();
      } catch (error) {
        console.error('Error retrieving Pokemon images:', error);
      }
    },
    error: function (xhr, status, error) {
      console.error('Error retrieving Pokemon list:', error);
    }
  });
};

const shuffleArray = (array) => {
  const shuffledArray = [...array];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
};

const createGameGrid = () => {
  const gameGrid = $('#game_grid');

  gameGrid.empty();

  const cardWidth = (() => {
    switch (`${rows}x${cols}`) {
      case '2x3':
        return '33%';
      case '3x4':
        return '25%';
      case '4x6':
        return '16%';
      default:
        return '25%';
    }
  })();

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const card = $('<div>').addClass('card').css('width', cardWidth);
      const frontFace = $('<img>').addClass('front_face');
      const backFace = $('<img>').addClass('back_face').attr('src', 'back.webp');

      card.append(frontFace).append(backFace);
      gameGrid.append(card);
    }
  }

  images = shuffleArray(images);

  const cards = gameGrid.find('.card');

  cards.each(function (index) {
    $(this).find('.front_face').replaceWith(images[index]);
  });

  setup();
};

const updateStats = () => {
  $('#totalPairs').text(totalPairs);
  $('#matchedPairs').text(matchedPairs);
  $('#pairsLeft').text(pairsLeft);
  $('#clicksCount').text(clicksCount);
};

const setup = () => {
  $(".card").on("click", cardClickHandler);

  $('#start-btn').on('click', () => {
    $('#game_stats').show();
    $('#game_grid').show();
    $('#start-btn').hide();
    resetTimer();
    startTimer();
    retrievePokemonImages();
    $("#dark-mode-btn").show();
    updateStats();
    $("#power-up-btn").show();
  });
  $('#reset-btn').on('click', () => {
    resetGame();
  });

  $('#easy-btn').on('click', () => {
    rows = 2;
    cols = 3;
    totalPairs = Math.ceil(rows * cols / 2);
    pairsLeft = totalPairs;
    $('#easy-btn').addClass('selected');
    $('#medium-btn').removeClass('selected');
    $('#hard-btn').removeClass('selected');
    $('#game_stats').hide();
    $('#game_grid').hide();
    $('#timelevel').text("100");
    $('#start-btn').show();
    resetTimer();
    createGameGrid();
  });

  $('#medium-btn').on('click', () => {
    rows = 3;
    cols = 4;
    totalPairs = Math.ceil(rows * cols / 2);
    pairsLeft = totalPairs;
    $('#medium-btn').addClass('selected');
    $('#easy-btn').removeClass('selected');
    $('#hard-btn').removeClass('selected');
    $('#game_stats').hide();
    $('#game_grid').hide();
    $('#timelevel').text("200");
    $('#start-btn').show();
    resetTimer();
    createGameGrid();
  });

  $('#hard-btn').on('click', () => {
    rows = 4;
    cols = 6;
    totalPairs = Math.ceil(rows * cols / 2);
    pairsLeft = totalPairs;
    $('#hard-btn').addClass('selected');
    $('#easy-btn').removeClass('selected');
    $('#medium-btn').removeClass('selected');
    $('#game_stats').hide();
    $('#game_grid').hide();
    $('#timelevel').text("300");
    $('#start-btn').show();
    resetTimer();
    createGameGrid();
  });

  $("#dark-mode-btn").click(function () {
    $("#game_grid").addClass("dark-mode");
    $("#dark-mode-btn").hide();
    $("#light-mode-btn").show();
  });

  $("#light-mode-btn").click(function () {
    $("#game_grid").removeClass("dark-mode");
    $("#light-mode-btn").hide();
    $("#dark-mode-btn").show();
  });

  $('#power-up-btn').off('click').on('click', () => {
    powerUp();
  });
};

$(document).ready(() => {
  $('#game_stats').hide();
  $('#game_grid').hide();
  $("#light-mode-btn").hide();
  $("#dark-mode-btn").hide();
  $("#power-up-btn").hide();
  setup();
});
