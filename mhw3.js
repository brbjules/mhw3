function hidePost(event) {
    let curPost = event.currentTarget;
    for (let i = 0; i < 3; i++)
        curPost = curPost.parentNode;
    for (const child of curPost.querySelectorAll('.votes, .entry, .thumbnail'))
        child.classList.add('hidden');
    curPost.querySelector('.hide-text').classList.remove('hidden');
    curPost.querySelector('.hide-text a').addEventListener('click', unhidePost);
    event.currentTarget.removeEventListener('click', hidePost);
}

function unhidePost(event) {
    const hiddenDiv = event.currentTarget.parentNode;
    let curPost = hiddenDiv.parentNode;
    for (const child of curPost.querySelectorAll('.votes, .entry, .thumbnail'))
        child.classList.remove('hidden');
    hiddenDiv.classList.add('hidden');
    curPost.querySelector('.hide').addEventListener('click', hidePost);
    event.currentTarget.removeEventListener('click', unhidePost);
}

let isShareClick = false;

function clickedOnMenu() {
    isShareClick = true;
}

function shareBlur() {
    const icon = document.querySelector('.share-menu a');
    if (icon) {
        if (!isShareClick)
            icon.parentNode.remove();
        isShareClick = false;
    }
}

function copied(event) {
    clickedOnMenu();
    let button = event.currentTarget;
    button.querySelector('img').src = 'sharecheck.png';
    button.parentNode.querySelector('p').textContent = 'Copied!';
    button.removeEventListener('click', copied);
}

function sharePost(event) {
    let otherMenu = document.querySelector('.share-menu');
    if (otherMenu)
        otherMenu.remove();
    clickedOnMenu();
    const shareDiv = document.createElement('div');
    event.currentTarget.parentNode.appendChild(shareDiv);
    shareDiv.classList.add('share-menu');
    const linkButton = shareDiv.appendChild(document.createElement('a'));
    linkButton.href = '#';
    linkButton.appendChild(document.createElement('img')).src = 'sharebutton.png';
    shareDiv.appendChild(document.createElement('p')).textContent = 'Copy link';
    linkButton.addEventListener('click', copied);
    document.addEventListener('click', shareBlur);
    shareDiv.addEventListener('click', clickedOnMenu);
}

function modalClose(event) {
    document.querySelector('#modal').remove();
    document.body.classList.remove('no-scroll');
}

function modalCreate(event) {
    const modalParent = document.createElement('section');
    modalParent.id = 'modal';
    document.body.appendChild(modalParent);
    const modalDiv = modalParent.appendChild(document.createElement('div'));
    const modalHeader = modalDiv.appendChild(document.createElement('h1'));
    modalHeader.textContent = 'You\'re about to leave LogoSito';
    modalDiv.appendChild(document.createElement('p')).textContent = 'Do you want to continue?';
    const modalText2 = modalDiv.appendChild(document.createElement('p'));
    modalText2.classList.add('link-preview');
    modalText2.textContent = event.currentTarget.textContent;
    const yesButton = modalDiv.appendChild(document.createElement('a'));
    yesButton.href = '#';
    yesButton.textContent = 'Yes';
    const noButton = modalDiv.appendChild(document.createElement('a'));
    noButton.href = '#';
    noButton.textContent = 'No, take me back';
    noButton.addEventListener('click', modalClose);
    document.body.classList.add('no-scroll');
}

const allPosts = document.querySelectorAll('article');
let tempIndex = 1;
for (const post of allPosts) {
    post.dataset.index = tempIndex;
    if (tempIndex % 2 === 1)
        post.classList.add('odd');
    post.querySelector('.rank').textContent = tempIndex;
    post.querySelector('.hide').addEventListener('click', hidePost);
    post.querySelector('.share').addEventListener('click', sharePost);
    let extLink = post.querySelector('.domain a');
    if (extLink)
        extLink.addEventListener('click', modalCreate);
    tempIndex++;
}



function onResponse(response) {
    return response.json();
}

function onJokeJson(json) {
    document.querySelector('#jotd p').textContent = json.attachments[0].text;
}

function onJokeErr(error) {
    document.querySelector('#jotd').remove();
}

function addDay(array, index, entry) {
    array[index] = [];
    array[index][0] = entry.name;
    array[index][1] = 1;
    array[index][2] = entry.date;
}

function insInArr(arr, length, start, elem) {
    for (let j = length; j > start; j--)
        arr[j] = arr[j-1];
    arr[start] = elem;
}

function getCountryCode(day, json) {
    for (const child of json)
        if (child.name === day[0])
            return child.countryCode;
}

function onHolidayJson(json) {
    let holidayArr = [];
    for (const child of json) {
        if (child === json[0])
            addDay(holidayArr, 0, child);
        else {
            for (let i = 0; i < holidayArr.length; i++) {
                if (child.name === holidayArr[i][0] && child.date === holidayArr[i][2]) {
                    holidayArr[i][1]++;
                    break;
                } else if (i + 1 === holidayArr.length) {
                    addDay(holidayArr, i + 1, child);
                    break;
                }
            }
        }
    }
    let dateArr = [];
    for (const holiday of holidayArr) {
        let date = holiday[2];
        let arrLen = dateArr.length;
        if (holiday === holidayArr[0])
            dateArr[0] = date;
        else if (arrLen === 1) {
            if (date === dateArr[0])
                continue;
            else if (date < dateArr[0]) {
                insInArr(dateArr, 2, 0, date);
            } else dateArr[1] = date;
        } else {
            if (dateArr[arrLen-1] < date)
                dateArr[arrLen] = date;
            for (let i = 0; i < arrLen; i++) {
                if (dateArr[i] === date)
                    break;
                if (i > 0 && dateArr[i-1] < date && dateArr[i] > date) {
                    insInArr(dateArr, arrLen, i, date);
                    break;
                }
            }
            if (dateArr[0] > date)
                insInArr(dateArr, arrLen, 0, date);
        }
    }
    for (const date of dateArr) {
        const view = document.querySelector('#holidays');
        const title = document.createElement('h3');
        title.textContent = date + ':';
        view.appendChild(title);
        for (const holiday of holidayArr) {
            if (holiday[2] === date) {
                let parForm = '';
                if (holiday[1] === 1)
                    parForm = getCountryCode(holiday, json);
                else parForm = holiday[1] + ' countries';
                view.appendChild(document.createElement('p'))
                    .textContent = holiday[0] + ', ' + parForm;
            }
        }
    }
}

function onHolidayErr(error) {
    let errText = document.createElement('p');
    errText.textContent = error;
    document.querySelector('#holidays').appendChild(errText);
}

fetch('https://icanhazdadjoke.com/slack')
    .then(onResponse, onJokeErr).then(onJokeJson);

fetch('https://date.nager.at/api/v3/NextPublicHolidaysWorldwide')
    .then(onResponse, onHolidayErr).then(onHolidayJson);
