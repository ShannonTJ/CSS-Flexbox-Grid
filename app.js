document.addEventListener("DOMContentLoaded", () => {
  //QUERY SELECTORS
  const userGrid = document.querySelector(".grid-user");
  const computerGrid = document.querySelector(".grid-computer");
  const displayGrid = document.querySelector(".grid-display");
  const ships = document.querySelectorAll(".ship");
  const destroyer = document.querySelector(".destroyer-container");
  const submarine = document.querySelector(".submarine-container");
  const cruiser = document.querySelector(".cruiser-container");
  const battleship = document.querySelector(".battleship-container");
  const carrier = document.querySelector(".carrier-container");
  const startBtn = document.querySelector("#start");
  const rotateBtn = document.querySelector("#rotate");
  const turn = document.querySelector("#whose-turn");
  const infoDisplay = document.querySelector("#info");

  //VARIABLES
  const width = 10;
  const userSquares = [];
  const computerSquares = [];
  let isHorizontal = true;
  let selectedShipNameWithIndex;
  let draggedShip;
  let draggedShipLength;

  //EVENT LISTENERS
  rotateBtn.addEventListener("click", rotate);
  ships.forEach((ship) => ship.addEventListener("dragstart", dragStart));

  //CREATE BOARD
  function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.dataset.id = i;
      grid.appendChild(square);
      squares.push(square);
    }
  }

  //SHIP ARRAY
  const shipArray = [
    {
      name: "destroyer",
      directions: [
        [0, 1], //horizontal config
        [0, width], //vertical config
      ],
    },
    {
      name: "submarine",
      directions: [
        [0, 1, 2], //horizontal config
        [0, width, width * 2], //vertical config
      ],
    },
    {
      name: "cruiser",
      directions: [
        [0, 1, 2], //horizontal config
        [0, width, width * 2], //vertical config
      ],
    },
    {
      name: "battleship",
      directions: [
        [0, 1, 2, 3], //horizontal config
        [0, width, width * 2, width * 3], //vertical config
      ],
    },
    {
      name: "carrier",
      directions: [
        [0, 1, 2, 3, 4], //horizontal config
        [0, width, width * 2, width * 3, width * 4], //vertical config
      ],
    },
  ];

  //RANDOMLY GENERATE COMPUTER SHIPS
  function generate(ship) {
    //get horizontal or vertical config
    let randomDirection = Math.floor(Math.random() * ship.directions.length);
    let current = ship.directions[randomDirection];

    if (randomDirection === 0) direction = 1;
    if (randomDirection === 1) direction = width;

    //grid length (100) - (ship length * horizontal/vertical)
    //randomStart is where the ship starts
    //example: for the longest ship, the ship's tip can't be placed past index 50 or it'll go out of bounds
    let random = computerSquares.length - ship.directions[0].length * direction;
    let randomStart = Math.floor(Math.random() * random);

    //check if a ship has already been placed at the generated spot
    //current = a ship's vertical/horizontal configuration
    //current[index] is added to randomStart to check the  indices in computerSquares
    const isTaken = current.some((index) =>
      computerSquares[randomStart + index].classList.contains("taken")
    );

    //check for the right edge
    const atRightEdge = current.some(
      (index) => (randomStart + index) % width === width - 1
    );

    //check for the left edge
    const atLeftEdge = current.some(
      (index) => (randomStart + index) % width === 0
    );

    if (!isTaken && !atRightEdge && !atLeftEdge) {
      current.forEach((index) =>
        computerSquares[randomStart + index].classList.add("taken", ship.name)
      );
    } else {
      generate(ship);
    }
  }

  //ROTATE THE PLAYER SHIPS
  function rotate() {
    destroyer.classList.toggle("destroyer-container-vertical");
    submarine.classList.toggle("submarine-container-vertical");
    cruiser.classList.toggle("cruiser-container-vertical");
    battleship.classList.toggle("battleship-container-vertical");
    carrier.classList.toggle("carrier-container-vertical");
    isHorizontal = !isHorizontal;
    return;
  }

  ships.forEach((ship) =>
    ship.addEventListener("mousedown", (e) => {
      selectedShipNameWithIndex = e.target.id;
    })
  );

  function dragStart() {
    draggedShip = this;
    draggedShipLength = this.childNodes.length;
  }
  function dragOver(e) {
    e.preventDefault();
  }
  function dragEnter(e) {
    e.preventDefault();
  }
  function dragLeave() {
    console.log("drag leave");
  }

  function dragDrop() {
    let shipNameWithLastId = draggedShip.lastChild.id; //shipname + id : 'destroyer-01'
    let shipClass = shipNameWithLastId.slice(0, -2); //shipname by itself : 'destroyer'
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1)); //ship length in array notation : 1 (for destroyer)
    let shipLastIdHorizontal = lastShipIndex + parseInt(this.dataset.id); //ship length in array notation + userSquare index
    let shipLastIdVertical = parseInt(this.dataset.id) + width * lastShipIndex;
    let shipFirstIdVertical = parseInt(this.dataset.id) - width * lastShipIndex;

    console.log("ship FIRST id vertical 1: " + shipFirstIdVertical);
    // console.log("ship last id vertical 1: " + shipLastIdVertical);

    let notAllowedHorizontal = [];
    let notAllowedTopVertical = [];
    let notAllowedBottomVertical = [];

    //define horizontal boundaries
    for (let i = 0; i < 4; i++) {
      notAllowedHorizontal.push(i);
      for (let j = 10; j < 100; j = j + 10) {
        notAllowedHorizontal.push(j + i);
      }
    }
    let newNotAllowedHorizontal = notAllowedHorizontal.splice(
      0,
      10 * lastShipIndex
    );

    //define top boundaries
    for (let i = -50; i < 0; i++) {
      notAllowedTopVertical.push(i);
    }

    //define bottom boundaries
    for (let i = 100; i < 150; i++) {
      notAllowedBottomVertical.push(i);
    }

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1)); //where the user clicks on the ship (at the beginning, middle, end of the ship)
    shipLastIdHorizontal = shipLastIdHorizontal - selectedShipIndex; //ship length + userSquare index - where the user clicked on the ship...gives consistent last id number
    shipLastIdVertical = shipLastIdVertical - selectedShipIndex * width; //get the last id of vertical ships

    if (selectedShipIndex === 0)
      shipFirstIdVertical = shipFirstIdVertical + lastShipIndex * width;
    else
      shipFirstIdVertical =
        shipFirstIdVertical + (lastShipIndex - selectedShipIndex) * width;

    if (
      isHorizontal &&
      !newNotAllowedHorizontal.includes(shipLastIdHorizontal)
    ) {
      for (let i = 0; i < draggedShipLength; i++) {
        userSquares[
          parseInt(this.dataset.id) - selectedShipIndex + i
        ].classList.add("taken", shipClass);
      }
    } else if (
      !isHorizontal &&
      !notAllowedBottomVertical.includes(shipLastIdVertical) &&
      !notAllowedTopVertical.includes(shipFirstIdVertical)
    ) {
      for (let i = 0; i < draggedShipLength; i++) {
        let num = width * i;
        let total;
        //grab ship at the top, render all pieces straight down
        if (selectedShipIndex === 0) {
          total = parseInt(this.dataset.id) + num - selectedShipIndex;
        }
        //grab ship at index 1, render top 2 pieces up and the other pieces down
        else if (selectedShipIndex === 1 && i <= 1) {
          total = parseInt(this.dataset.id) - num;
        } else if (selectedShipIndex === 1 && i > 1) {
          for (let j = 0; j < draggedShipLength - selectedShipIndex; j++) {
            total = parseInt(this.dataset.id) + width * j;
            userSquares[total].classList.add("taken", shipClass);
          }
          displayGrid.removeChild(draggedShip);
          return;
          //grab ship at index 2, render top 3 pieces up and the other pieces down
        } else if (selectedShipIndex === 2 && i <= 2) {
          total = parseInt(this.dataset.id) - num;
        } else if (selectedShipIndex === 2 && i > 2) {
          for (let j = 0; j < draggedShipLength - selectedShipIndex; j++) {
            total = parseInt(this.dataset.id) + width * j;
            userSquares[total].classList.add("taken", shipClass);
          }
          displayGrid.removeChild(draggedShip);
          return;
          //grab ship at index 3, render top 4 pieces up and the other pieces down
        } else if (selectedShipIndex === 3 && i <= 3) {
          total = parseInt(this.dataset.id) - num;
        } else if (selectedShipIndex === 3 && i > 3) {
          for (let j = 0; j < draggedShipLength - selectedShipIndex; j++) {
            total = parseInt(this.dataset.id) + width * j;
            userSquares[total].classList.add("taken", shipClass);
          }
          displayGrid.removeChild(draggedShip);
          return;
        }
        //grab lowest piece of the biggest ship, render all pieces up
        else if (selectedShipIndex === 4)
          total = parseInt(this.dataset.id) - num;

        // console.log("total: " + total);

        userSquares[total].classList.add("taken", shipClass);
      }
    } else return;
    displayGrid.removeChild(draggedShip);
  }

  function dragEnd() {}

  createBoard(userGrid, userSquares);
  createBoard(computerGrid, computerSquares);

  generate(shipArray[0]);
  generate(shipArray[1]);
  generate(shipArray[2]);
  generate(shipArray[3]);
  generate(shipArray[4]);

  userSquares.forEach((square) =>
    square.addEventListener("dragstart", dragStart)
  );
  userSquares.forEach((square) =>
    square.addEventListener("dragover", dragOver)
  );
  userSquares.forEach((square) =>
    square.addEventListener("dragenter", dragEnter)
  );
  userSquares.forEach((square) =>
    square.addEventListener("dragleave", dragLeave)
  );
  userSquares.forEach((square) => square.addEventListener("drop", dragDrop));
  userSquares.forEach((square) => square.addEventListener("dragend", dragEnd));
});
