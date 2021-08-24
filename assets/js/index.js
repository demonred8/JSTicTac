drawRecordsTable()

document.getElementById('start-game').addEventListener('click', startNewGame)

document.getElementById('search-player-btn').addEventListener('click', drawUserGamesTable)

let player1Input = document.getElementById('player1')
let player2Input = document.getElementById('player2')

let player1 = {
    name: '',
    symbol: 'X'
};

let player2 = {
    name: '',
    symbol: 'O'
};

let gameActive
let currentPlayer
let gameState

// Game start functions here

function startNewGame() {
    gameState = new Array(9).fill('')
    player1.name = player1Input.value
    player2.name = player2Input.value

    if ((player1.name != null && player2.name != null) && (player1.name != player2.name)) {
        createNewGameContainer()
        hideMainMenuButtons()
        hideRecordsContainer()
        removeRecordsTable()
        startGameLogic()
    }
}

function startPlayAgain() {
    gameState = new Array(9).fill('')
    removeGameFinishedElement()
    createNewGameContainer()
    hideRecordsContainer()
    removeRecordsTable()
    startGameLogic()
}

// Game logic here

let pointer = document.getElementById('main')

function setCursorO() {
    pointer.style.cursor = "url('assets/images/o.png'), auto";
}

function setCursorX() {
    pointer.style.cursor = "url('assets/images/x.png'), auto";
}

function setCursorDefault() {
    pointer.style.cursor = "auto"
}

function startGameLogic() {
    gameActive = true; // Set gamestate active
    currentPlayer = player1.name

    let currTurn = document.getElementById('current-turn')
    currTurn.textContent = `Current turn: ${currentPlayer}`

    setCursorX()
}

function move(event) {
    let cell = event.target
    let cellId = Number(cell.getAttribute('data-cell-index'))
    let span = document.createElement('span')
    span.id = 'cell-symbol'

    let symbol;

    if (!isGameStateEmpty()) {
        if (gameState[cellId] === '' && cell.className === 'cell') {
            if (currentPlayer === player1.name) {
                symbol = player1.symbol
                gameState[cellId] = symbol
                span.textContent = symbol
                cell.appendChild(span)
            }
            if (currentPlayer === player2.name) {
                symbol = player2.symbol
                gameState[cellId] = symbol
                span.textContent = symbol
                cell.appendChild(span)
            }
            checkPlayerWin(symbol)
        }
    }
}

function isGameStateEmpty() {
    return gameState.filter(item => item === "").length === 0
}

function setNobodyWin() {
    let text = 'Nobody!'
    gameActive = false
    gameState = new Array(9).fill('')
    removeMoveListener()
    setCursorDefault()
    createGameFinishedElement(text)
    showRecordsContainer()
}

function checkPlayerWin(symbol) {
    let arr = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let winner = false
    let nobody = false

    arr.forEach(function (subArr) {
        let counter = 0;
        subArr.forEach(function (elem) {
            if (gameState[elem] === symbol) {
                counter++;
                if (counter == 3) {
                    winner = true
                }
            }
        });
    });

    if (!winner && isGameStateEmpty()) {
        nobody = true
        setNobodyWin()
        setLocalStorageGamesPlus(nobody)
        drawRecordsTable()
        return
    }

    if (!winner && currentPlayer === player1.name) {
        currentPlayer = player2.name
        setNextTurn(player2.name)
        setCursorO()
        return
    }

    if (!winner && currentPlayer === player2.name) {
        currentPlayer = player1.name
        setNextTurn(player1.name)
        setCursorX()
        return
    }

    let text = `Winner: ${currentPlayer}`

    if (winner && currentPlayer === player1.name) {
        gameActive = false
        removeMoveListener()
        setCursorDefault()
        createGameFinishedElement(text)
        setLocalStorageGamesPlus()
        drawRecordsTable()
        showRecordsContainer()
        return
    }

    if (winner && currentPlayer === player2.name) {
        gameActive = false
        removeMoveListener()
        setCursorDefault()
        createGameFinishedElement(text)
        setLocalStorageGamesPlus()
        drawRecordsTable()
        showRecordsContainer()
        return
    }
}

function setNextTurn(player) {
    let currTurn = document.getElementById('current-turn')
    currTurn.textContent = 'Current turn: ' + player
}

function setLocalStorageGamesPlus(nobody) {
    let localStorage = window.localStorage

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]))
    }

    if (!localStorage.getItem('gameHistory')) {
        localStorage.setItem('gameHistory', JSON.stringify([]))
    }

    if (localStorage.length > 0) {
        let usersObjArray = JSON.parse(localStorage.users)
        let usersGamesArray = JSON.parse(localStorage.gameHistory)

        if (!usersObjArray.find(el => el.username === player1.name)) {
            usersObjArray.push({ username: player1.name, games: 0, wins: 0, winrate: 0 })
        }
        if (!usersObjArray.find(el => el.username === player2.name)) {
            usersObjArray.push({ username: player2.name, games: 0, wins: 0, winrate: 0 })
        }
        // Making users stats
        for (let i = 0; i < usersObjArray.length; i++) {
            if (usersObjArray[i].username === player1.name) {
                if (usersObjArray[i].username === currentPlayer) {
                    usersObjArray[i].wins += 1
                }
                usersObjArray[i].games += 1
                usersObjArray[i].winrate = getWinRate(usersObjArray[i].wins, usersObjArray[i].games)
            }
            if (usersObjArray[i].username === player2.name) {
                if (usersObjArray[i].username === currentPlayer) {
                    usersObjArray[i].wins += 1
                }
                usersObjArray[i].games += 1
                usersObjArray[i].winrate = getWinRate(usersObjArray[i].wins, usersObjArray[i].games)
            }
        }
        // Making users game history
        if (!nobody) {
            usersGamesArray.push({ player1: player1.name, player2: player2.name, winner: currentPlayer, date: new Date() })
        }
        if (nobody) {
            usersGamesArray.push({ player1: player1.name, player2: player2.name, winner: 'Nobody', date: new Date() })
        }
        localStorage.setItem('users', JSON.stringify(usersObjArray))
        localStorage.setItem('gameHistory', JSON.stringify(usersGamesArray))
    }
}

function getWinRate(wins, games) {
    return (((100 * wins) / games).toFixed(2) + '%')
}

// Game logic ^

// Creating UI here

function createNewGameContainer() {
    let div = document.createElement('div')
    div.id = 'game-container'
    createCurrentTurnElement(div)
    createMainMenuButton(div)
    createNewGridContainer(div)
}

function removeGameContainer() {
    let gameContainer = document.getElementById('game-container')
    gameContainer.remove()
}

function createCurrentTurnElement(div) {
    let span = document.createElement('span')
    span.id = 'current-turn'
    div.appendChild(span)
}

function createMainMenuButton(div) {
    let button = document.createElement('button')
    button.type = 'button'
    button.id = 'to-main-menu-ingame'
    button.textContent = 'Return to Main Menu'
    button.addEventListener('click', showMainButtons)
    div.appendChild(button)
}

function hideMainMenuButtons() {
    let cl = document.getElementById('buttons-inputs').classList
    cl.add('hidden')
    cl.remove('flex')
}

function showMainMenuButtons() {
    let cl = document.getElementById('buttons-inputs').classList
    cl.remove('hidden')
    cl.add('flex')
}

function createNewGridContainer(mainDiv) {
    let div = document.createElement('div')
    div.id = 'grid-container'
    div.addEventListener('click', move)
    createNewGrid(mainDiv, div)
}

function removeMoveListener() {
    let listener = document.getElementById('grid-container')
    listener.removeEventListener('click', move)
}

function createNewGrid(mainDiv, div) {
    let cellId = 0;
    let column;
    let grid;
    for (let i = 0; i < 3; i++) {
        column = document.createElement('div')
        column.className = 'column'
        for (let j = 0; j < 3; j++) {
            grid = document.createElement('div')
            grid.className = 'cell'
            grid.setAttribute('data-cell-index', cellId)
            column.appendChild(grid)
            cellId += 1
        }
        div.appendChild(column)
    }
    mainDiv.appendChild(div)
    document.getElementById('main').append(mainDiv)
}

function showMainButtons() {
    if (!gameActive) {
        removeGameFinishedElement()
        removeRecordsTable()
    }
    if (gameActive) {
        removeGameContainer()
        setCursorDefault()
    }
    drawRecordsTable()
    showMainMenuButtons()
    showRecordsContainer()
}

function hideRecordsContainer() {
    let cl = document.getElementById('records-container').classList
    cl.remove("flex")
    cl.add("hidden")
}

function showRecordsContainer() {
    let cl = document.getElementById('records-container').classList
    cl.add("flex")
    cl.remove("hidden")
}

function createGameFinishedElement(text) {
    let element = document.getElementById('main')

    removeGameContainer()

    let div = document.createElement('div')
    div.id = 'winner-container'

    let span = document.createElement('span')
    span.id = 'winner'
    span.textContent = text
    div.appendChild(span)

    let buttonsContainer = document.createElement('div')
    buttonsContainer.id = 'buttons-container'

    let button1 = document.createElement('button')
    button1.type = 'button'
    button1.id = 'to-main-menu'
    button1.className = 'button'
    button1.textContent = 'Return to Main Menu'
    button1.addEventListener('click', showMainButtons)
    buttonsContainer.appendChild(button1)

    let button2 = document.createElement('button')
    button2.type = 'button'
    button2.id = 'play-again'
    button2.className = 'button'
    button2.textContent = 'Play again'
    button2.addEventListener('click', startPlayAgain)
    buttonsContainer.appendChild(button2)

    div.appendChild(buttonsContainer)

    element.appendChild(div)
}

function removeGameFinishedElement() {
    let element = document.getElementById('winner-container')
    element.remove()
}

function drawRecordsTable() {
    let localStorage = window.localStorage
    let usersObjArray = JSON.parse(localStorage.getItem('users'))

    let div = document.createElement('div')
    div.id = 'records-table'

    if (localStorage.getItem('users')) {
        for (let i = 0; i < usersObjArray.length; i++) {
            let span = document.createElement('span')
            span.className = 'user record'
            span.textContent = `User: ${usersObjArray[i].username}, Games: ${usersObjArray[i].games}, Wins: ${usersObjArray[i].wins}, Winrate: ${usersObjArray[i].winrate}`
            div.appendChild(span)
            if (i === 9) {
                break
            }
        }
        document.getElementById('records-container').appendChild(div)
    }
}

function removeRecordsTable() {
    document.getElementById('records-table').remove()
}

function drawUserGamesTable() {
    let user = document.getElementById('search-player').value

    let localStorage = window.localStorage
    let gamesObjArray = JSON.parse(localStorage.getItem('gameHistory'))

    let div = document.createElement('div')
    div.id = 'games-history'

    if (localStorage.getItem('gameHistory') && user !== null) {
        let userExist = gamesObjArray.some(item => (item.player1 === user || item.player2 === user) ? true : false)
        if (userExist) {
            hideRecordsContainer()
            hideMainMenuButtons()
            let button = document.createElement('button')
            let buttonClasses = button.classList
            buttonClasses.add('close_games_table')
            button.textContent = 'Close'

            button.type = 'button'
            button.addEventListener('click', removeUserGamesTable)

            let table = document.createElement('table')
            table.className = 'games_table'

            let tr = document.createElement('tr')

            let tdGame = document.createElement('td')
            tdGame.textContent = 'Game'

            let tdPlayer1 = document.createElement('td')
            tdPlayer1.textContent = 'Player 1'

            let tdPlayer2 = document.createElement('td')
            tdPlayer2.textContent = 'Player 2'

            let tdWinner = document.createElement('td')
            tdWinner.textContent = 'Winner'

            let tdDate = document.createElement('td')
            tdDate.textContent = 'Date'

            tr.appendChild(tdGame)
            tr.appendChild(tdPlayer1)
            tr.appendChild(tdPlayer2)
            tr.appendChild(tdWinner)
            tr.appendChild(tdDate)

            table.appendChild(tr)

            let gamesArray = gamesObjArray.filter(item => item.player1 === user || item.player2 === user ? item : null)
            gamesArray.forEach((item, index) => {
                let tr = document.createElement('tr')

                let tdGame = document.createElement('td')
                tdGame.textContent = index

                let tdPlayer1 = document.createElement('td')
                tdPlayer1.textContent = item.player1

                let tdPlayer2 = document.createElement('td')
                tdPlayer2.textContent = item.player2

                let tdWinner = document.createElement('td')
                tdWinner.textContent = item.winner

                let tdDate = document.createElement('td')
                tdDate.textContent = item.date

                tr.appendChild(tdGame)
                tr.appendChild(tdPlayer1)
                tr.appendChild(tdPlayer2)
                tr.appendChild(tdWinner)
                tr.appendChild(tdDate)

                table.appendChild(tr)
                // let span = document.createElement('span')
                // span.className = 'usergame'
                // span.textContent = `Game ${index}: ${item.player1} vs ${item.player2}, Winner: ${item.winner}, Date: ${item.date}`
                // div.appendChild(span)
            })
            div.appendChild(table)
            div.appendChild(button)
            document.getElementById('main').appendChild(div)
        }
        else {
            alert('User not exist')
        }
    }
    // Apply to button & input form, which allow find userGames if username userExist, if user doesnt exist (alert('User not found!'))
}

function removeUserGamesTable() {
    console.log('show')
    showMainMenuButtons()
    showRecordsContainer()
    document.getElementById('games-history').remove()

    let records = document.getElementById('records-container').classList
    records.toggle('hidden')

    let mainButtons = document.getElementById('buttons-inputs').classList
    mainButtons.toggle('hidden')
}
