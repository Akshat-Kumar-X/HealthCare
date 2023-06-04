// DOM References

const right_pane = document.querySelector('.question_form');
const ques_list = document.querySelector('.questions > ul');
const new_ques_form = document.querySelector('.actions > button');
const search = document.querySelector('.actions > input');

// Variables

let form = null;
let add_comment_form = null;
let resolve = null;
let ques_id = 0;
let ques_details = [];
let curr_ques_id = null;

// check local storage

if(localStorage.getItem('ques_details')) {
    ques_details = JSON.parse(localStorage.getItem('ques_details'));
    ques_id = JSON.parse(localStorage.getItem('ques_id'));
    //console.log(ques_id);
}

// Render Questions

function renderQues(ques) {
    ques_list.innerHTML =  "";
    ques.sort((b, a) => {
        return (a.upvotes + a.downvotes) - (b.upvotes + b.downvotes); 
    })
    ques.forEach((q) => {
        if(!q.fav) return;
        ques_list.innerHTML += `
            <li id="${q.id}">
                <h1>${q.title} ${q.fav ? '<i class="fas fa-star" style="color: #F8C417"></i>' : ''}</h1>
                <p>${q.question}</p>
            </li>
        `;
    })
    ques.forEach((q) => {
        if(q.fav) return;
        ques_list.innerHTML += `
            <li id="${q.id}">
                <h1>${q.title}</h1>
                <p>${q.question}</p>
            </li>
        `;
    })
}

// Ques details renderer

function renderQuesDetails(id) {
    right_pane.innerHTML = ques_details_template(id);
    add_comment_form = document.querySelector('.add_response > form');
    resolve = document.querySelector('.resolve');
    resolve.addEventListener('click', resolver);
    add_comment_form.addEventListener('submit',comment_helper);
    curr_ques_id = id;
}

// Highlight Occurences

function highlightOccurences(word, term) {
    let nextStart = 0;
    let prevEnd = 0;
    let res = '';
    while(nextStart < word.length) {
        nextStart = word.toLowerCase().indexOf(term, nextStart);
        if(nextStart === -1) break;
        res += word.substring(prevEnd, nextStart);
        res += '<span style="background: yellow">' + word.substring(nextStart, nextStart + term.length) + '</span>';
        prevEnd = nextStart + term.length;
        nextStart++;
    }
    if(prevEnd < word.length) {
        res += word.substring(prevEnd, word.length);
    }
    return res;
}

// Render the selected question details

ques_list.addEventListener('click', (e) => {
    if(e.target.tagName === 'LI') {
        const id = e.target.id;
        renderQuesDetails(id);
    }
    else if(e.target.tagName === 'H1' || e.target.tagName === 'P') {
        const id = e.target.parentElement.id;
        renderQuesDetails(id);
    }
})
function renderNoMatchFound() {
    ques_list.innerHTML = `<div id="not_found">No match found</div>`;
}

// add new comment

function comment_helper(e) {
    e.preventDefault();
    const name = add_comment_form.name.value;
    const comment = add_comment_form.comment.value;
    const currQues = ques_details.find((ques) => ques.id == curr_ques_id)
    currQues.responses = [
        ...currQues.responses,
       {
           id: currQues.responses.length,
           name,
           comment,
           upvotes: 0,
           downvotes: 0
       } 
    ]
    renderQuesDetails(curr_ques_id);
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
}

// Resolve the ques i.e. delete it

function resolver() {
    const ques = ques_list.querySelectorAll('li');
    ques_details = ques_details.filter((q) => {
        return q.id != curr_ques_id
    })
    renderQues(ques_details);
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
    init();
}

// Filter the ques

search.addEventListener('keyup', () => {
    const term = search.value.toLowerCase().trim();
    if(term =="") {
        renderQues(ques_details);
    }
    else {
        // Deep copy
        ques_details_copy = JSON.parse(JSON.stringify(ques_details));

        let filteredArr = ques_details_copy.filter((ques) => {
            return ques.title.toLowerCase().includes(term) || ques.question.toLowerCase().includes(term);
        });

        let regex = new RegExp(term,"i");
        filteredArr = filteredArr.map((q) => {
            q.title = q.title.split(' ').map((word) =>highlightOccurences(word, term)).join(' ');
            q.question = q.question.split(' ').map((word) =>highlightOccurences(word, term)).join(' ');
            return q;
        })
        if(filteredArr.length)
            renderQues(filteredArr);
        else
            renderNoMatchFound();    
    }
})

// Display the new ques form

new_ques_form.addEventListener('click', () => {
    init();
})

function addToFav(id) {
    ques = ques_details.find((ques) => ques.id == id);
    ques.fav = 1;
    renderQuesDetails(ques.id);
    renderQues(ques_details);
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
    
}

function rmFromFav(id) {
    ques = ques_details.find((ques) => ques.id == id);
    ques.fav = 0;
    renderQuesDetails(ques.id);
    renderQues(ques_details);
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
}

function upQues(id) {
    ques = ques_details.find((ques) => ques.id == id);
    ques.upvotes = ques.upvotes + 1;
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
    renderQues(ques_details);
    renderQuesDetails(id);
}

function upRes(qid, rid) {
    ques = ques_details.find((ques) => ques.id == qid);
    res = ques.responses.find((response) => response.id == rid);
    res.upvotes += 1;
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
    renderQues(ques_details);
    renderQuesDetails(qid);
}

function downRes(qid, rid) {
    ques = ques_details.find((ques) => ques.id == qid);
    res = ques.responses.find((response) => response.id == rid);
    res.downvotes -= 1;
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
    renderQues(ques_details);
    renderQuesDetails(qid);
}

function downQues(id) {
    ques = ques_details.find((ques) => ques.id == id);
    ques.downvotes = ques.downvotes - 1;
    localStorage.setItem('ques_details', JSON.stringify(ques_details));
    renderQues(ques_details);
    renderQuesDetails(id);
}
// Returns ques details template

function ques_details_template(id) {
    const curr_ques = ques_details.find((ques) => ques.id == id);
    let resp = '';
    curr_ques.responses.sort((b, a) => {
        return (a.upvotes + a.downvotes) - (b.upvotes + b.downvotes); 
    })
    curr_ques.responses.forEach((res) => {
        resp += `
            <div class="responses_dets">
                <h4>${res.name}</h4>
                <p>${res.comment}</p>
                <p class="votes"><i class="fas fa-caret-square-up" onclick="upRes(${id}, ${res.id})"></i> ${res.upvotes} <i class="fas fa-caret-square-down" onclick="downRes(${id}, ${res.id})"></i> ${res.downvotes}</p>
            </div>
        `;
    })
    return `
        <div class="ques_details">
            <h3>Question</h3>
            <div class="ques_dets">
                <h3>${curr_ques.title} ${curr_ques.fav ? `<i class="fas fa-star" onclick="rmFromFav(${curr_ques.id})" style="color: #F8C417"></i>` : `<i class="far fa-star" onclick="addToFav(${curr_ques.id})"></i>`}</h3>
                <p>${curr_ques.question}</p>
                <p class="votes"><i class="fas fa-caret-square-up" onclick="upQues(${curr_ques.id})"></i> ${curr_ques.upvotes} <i class="fas fa-caret-square-down" onclick="downQues(${curr_ques.id})"></i> ${curr_ques.downvotes}</p>
            </div>
            <button class="resolve">Resolve</button>
            <div class="responses">
                <h3>Responses</h3>
                ${resp}
            </div>
            <div class="add_response">
                <h3>Add Response</h3>
                <form>
                    <input type="text" name="name" placeholder="Enter Name" required />
                    <textarea name="comment" placeholder="Enter Comment" required ></textarea>
                    <input type="submit" value="Submit" />
                </form>
            </div> 
        </div>
    `;
}

// Returns the new_ques_form template.

function ques_form_template() {
    return `
        <div class="new_form">
            <h1>Welcome to Discussion Portal</h1>
            <p>Enter a subject and question to get started</p>
            <form>
                <input type="text" name="subject" placeholder="Subject" required />
                <textarea name="question" placeholder="Question" required ></textarea>
                <input type="submit" value="Submit" />
            </form>
        </div>
    `;
}

// Adds event listeners to the new ques form && Submit the new ques

function addEventListeners() {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.subject.value;
        const question = form.question.value;
        ques_details.push({
            id: ques_id,
            title: title,
            question: question,
            upvotes: 0,
            downvotes: 0,
            fav: 0,
            responses: []
        });
        localStorage.setItem('ques_details', JSON.stringify(ques_details));
        form.reset();
        renderQues(ques_details);
        ques_id++;
        localStorage.setItem('ques_id', JSON.stringify(ques_id));
    });
}

// Initalize the App

function init() {
    right_pane.innerHTML = ques_form_template();
    form = document.querySelector('.new_form > form');
    renderQues(ques_details);
    addEventListeners();
}

// Call to init

init();