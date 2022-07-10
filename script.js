// console.log('hello')
// make dropped items not hidable by liveSearch DONE!
// implement function drop to user and apply task in order of its date DONE!
// nextbutton to show next week without tasks
// loading indicator DONE!
// show hours for task
// refactor     
const usersUrl =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";

const tasksUrl =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

let isLoaded = false;

const loader = document.querySelector(".loader_wraper")

const start = new Date();
const end = new Date("02/10/2099");
let calender = [];
let loop = new Date(start);
while (loop <= end) {
  const date = loop.toLocaleDateString();
  calender.push(date);
  let newDate = loop.setDate(loop.getDate() + 1);
  loop = new Date(newDate);
}

/* ++++++++++++++++++++++++++ Utility function for drag'n'drop */
const dragStart = function (event) {
  this.classList.add("dragging");
  console.log(event.currentTarget.outerHTML, "outer");
  event.dataTransfer.setData("text/html", event.currentTarget.outerHTML);
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.id);
};

const dragOver = function (event) {
  event.preventDefault();
};

const dragDrop = function (event) {
  event.currentTarget.classList.remove("drop");
};

const dragEnd = (event) => {
  event.currentTarget.classList.remove("dragging");
  event.currentTarget.classList.remove("is-hidden");
};

const drag = (event) => {
  event.dataTransfer.setData("text/html", event.currentTarget.outerHTML);
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.id);
};

const dragEnter = (event) => {
  event.currentTarget.classList.add("drop");
};

const dragLeave = (event) => {
  event.currentTarget.classList.remove("drop");
};

const drop = (event) => {
  Array.from(document.querySelectorAll(".board_user_cell")).forEach((column) =>
    column.classList.remove("drop")
  );
  document
    .querySelector(`[data-id="${event.dataTransfer.getData("text/plain")}"]`)
    .remove();
  console.log(event.currentTarget.className === "board_user_cell", "current");
  event.currentTarget.innerHTML =
    event.currentTarget.innerHTML + event.dataTransfer.getData("text/html");
  Array.from(document.querySelectorAll(".task")).forEach((task) => {
    task.classList.remove("dragging");
  });
  const tasks = event.currentTarget.querySelectorAll(":scope > .task");
  console.log(tasks, 'tasks')
  Array.from(tasks).forEach(task => {
    task.classList.add("applied")
    task.querySelector('.task > #descr')?.remove()
    console.dir(task, 'tasksinside')
  })
};

const dropToUser = (event) => {
  Array.from(document.querySelectorAll(".board_user")).forEach((column) =>
    column.classList.remove("drop")
  );
  const task = document.querySelector(
    `[data-id="${event.dataTransfer.getData("text/plain")}"]`
  );
  const taskStartDate = task.getAttribute("data-date");
  const userId = event.currentTarget.getAttribute("data-user");

  task.remove();

  //   event.currentTarget.innerHTML =
  //     event.currentTarget.innerHTML + event.dataTransfer.getData("text/html");
  Array.from(document.querySelectorAll(".board_user_cell")).forEach((cell) => {
    const cellDateAttr = cell.getAttribute("data-date");
    const cellDateUser = cell.getAttribute("data-user");
    const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
    const cellDate = new Date(
      cellDateAttr.replace(pattern, "$3-$2-$1")
    ).getTime();
    const taskStartDateConvert = new Date(taskStartDate).getTime();
    if (cellDate === taskStartDateConvert && userId === cellDateUser) {
      console.log("cellmatch", cell);
      cell.innerHTML += event.dataTransfer.getData("text/html");
      Array.from(document.querySelectorAll(".task")).forEach((task) => {
        task.classList.remove("dragging");
      });
      const tasksInsideCell = cell.querySelectorAll(":scope > .task");
      console.log(tasksInsideCell, 'tasksinside')
      Array.from(tasksInsideCell).forEach(task => {
        task.classList.add("applied")
        task.querySelector('.task > #descr')?.remove()
      })
    }
  });
};

const allowDrop = (event) => {
  event.preventDefault();
};

/* ++++++++++++++++++++++++++++++++++++++++ */

const calendarElements = document.querySelectorAll(".board_calendar");
const nextButton = document.getElementById("next");
const prevButton = document.getElementById("prev");
const board = document.querySelector(".board");
const aside = document.querySelector("aside");
const input = document.querySelector("input");
const tasksWrapper = document.querySelector(".tasks_wrapper");
let daysCount = 0;
function nextWeek(offset = 0) {
  calendarElements.forEach((node, idx) => {
    node.innerText = calender[idx + offset].slice(0, 5).replace("/", ".");
    prevButton.disabled = daysCount === 0;
  });
}
nextWeek();
nextButton.addEventListener("click", () => {
  daysCount += 15;
  nextWeek(daysCount);
});
prevButton.addEventListener("click", () => {
  daysCount -= 15;
  nextWeek(daysCount);
});

let usersData = [];

const takeUsers = async () => {
  await fetch(usersUrl)
    .then((res) => res.json())
    .then((res) => {
      usersData = res.slice(0, 3);
    });
};

usersData.length;
document.createElement("div");

let tasks = [];

const takeTasks = async () => {
  await fetch(tasksUrl)
    .then((res) => res.json())
    .then((res) => (tasks = [...res]));
};

takeUsers().then((res) => {
  let j = 0;
  let countDate = 0;
  for (let i = 0; i < 17 * usersData.length; i++) {
    const div = document.createElement("div");
    if (i === 0 || i % 17 === 0) {
      div.classList.add("board_user");
      console.log("user", usersData[j]);
      div.innerText = usersData[j].firstName;
      div.setAttribute("data-user", usersData[j].id);
      j++;
      countDate = 0;
      div.addEventListener("dragenter", dragEnter);
      div.addEventListener("dragleave", dragLeave);
      div.addEventListener("dragover", allowDrop);
      div.addEventListener("drop", dropToUser);
    }  else if (i === 16 || i === 33 || i === 50) {
        div.classList.add("empty")
    } else {
      div.classList.add("board_user_cell");
      div.addEventListener("dragenter", dragEnter);
      div.addEventListener("dragleave", dragLeave);
      div.setAttribute("data-user", usersData[j - 1].id);
      div.addEventListener("dragover", allowDrop);
      //   div.addEventListener("drop", dragDrop);
      div.addEventListener("drop", drop);
      div.setAttribute("data-date", calender[countDate + daysCount]);
      div.setAttribute("data-executor", usersData[j - 1].id);
    //   div.innerText = i;
      countDate++;
    }

    board.append(div);
  }
});

takeTasks().then((res) => {
    loader.remove()
  tasks.forEach((taskItem) => {
    const task = document.createElement("div");
    task.classList.add("task");
    const subject = document.createElement("p");
    const span = document.createElement('span')
    let spanTime = (new Date(taskItem.planEndDate).getDay() - new Date(taskItem.planStartDate).getDay()) * 8;
    span.innerText = spanTime;


    subject.innerText = taskItem.subject;
    task.append(subject);
    task.append(span)
    
    if (taskItem.executor === null) {
      // task instance
      const description = document.createElement("p");
      description.id = "descr"
      description.innerText = "Lorem ipsum dolor sit amet";
      task.append(description);

      task.setAttribute("draggable", true);
      task.setAttribute("data-id", taskItem.id);
      task.setAttribute("data-date", taskItem.planStartDate);
      //Add event listeners
      task.addEventListener("dragstart", dragStart);
      task.addEventListener("dragend", dragEnd);

      // aside.append(task);
      tasksWrapper.append(task);
      console.log(taskItem);
    } else {
      task.classList.add("applied");
      const userCells = document.querySelectorAll(".board_user_cell");
      userCells.forEach((item, idx) => {
        const { date, executor } = item.dataset;
        const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
        const cellDate = new Date(date.replace(pattern, "$3-$2-$1")).getTime();
        const taskCreationDate = new Date(taskItem.planStartDate).getTime();
        if (cellDate == taskCreationDate && executor == taskItem.executor) {
          item.append(task);
        }
      });
    }
  })
});

function liveSearch() {
  // Locate the card elements
  let cardsRaw = Array.from(document.querySelectorAll(".task"));
  const cards = cardsRaw.filter((task) => !task.classList.contains("applied"));
  // Locate the search input
  let search_query = document.getElementById("searchbox").value;
  // Loop through the cards
  for (let i = 0; i < cards.length; i++) {
    // If the text is within the card...
    if (
      cards[i].children[0].innerText
        .toLowerCase()
        // ...and the text matches the search query...
        .includes(search_query.toLowerCase())
    ) {
      // ...remove the `.is-hidden` class.
      cards[i].classList.remove("is-hidden");
    } else {
      // Otherwise, add the class.
      cards[i].classList.add("is-hidden");
    }
  }
}

