var cl = console.log;

const state = {
    postsArr: [],
    edit_id: null
}

const BASE_URL = `https://gaurav2-1b96d-default-rtdb.firebaseio.com/`;
const POST_URL = `${BASE_URL}/PostsfetchGeneric2.json`


const addPostBtn = document.getElementById("addPostBtn")
const postform = document.getElementById("postform")
const title = document.getElementById("title")
const author = document.getElementById("author")
const addBtn = document.getElementById("addBtn")
const updateBtn = document.getElementById("updateBtn")
const closeBtn = document.getElementById("closeBtn")
const tbody = document.getElementById("tbody")
const formRow = document.getElementById("formRow")

//===================== Generic ==============================
async function makeGenericApiCall(url, method, body) {
    body = body ? JSON.stringify(body) : null
    let res = await fetch(url, {
        body: body,
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Autherization": "Token"
        }
    })

    if (!res.ok) {
        throw new Error(`HTTP Error : ${res.status}`)
    }
    let data = await res.json()
    return data
}
//===================== Create ==============================
async function addingNewPost(eve) {
    try {
        eve.preventDefault()

        let newPostObj = {
            title: title.value,
            author: author.value,
            createdAt: Date.now()
        }
        showSpinner("text-success")
        let data = await makeGenericApiCall(POST_URL, "POST", newPostObj)
        newPostObj.id = data.name

        state.postsArr.unshift(newPostObj)
        let tr = document.createElement("tr")
        tr.id = data.name
        tr.innerHTML = `
                            <td>${newPostObj.title}</td>
                            <td>${newPostObj.author}</td>
                            <td>${new Date(newPostObj.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div class="actions text-center">
                                    <button onClick="editPost(this)" class="btn btn-warning">✎ Edit</button>
                                    <button onClick="deletePost(this)" class="btn btn-danger">🗑 Delete</button>
                                </div>
                            </td>
                            `
        tbody.prepend(tr)
        hideSpinner("text-success")
        hideForm()
        postform.reset()
        showSnackBar("Added!", "Post Added successfully", "success")

    } catch (err) {
        cl("hello catch")
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }
}
//===================== Read ==============================
async function fetchPostsData(arr) {
    try {
        showSpinner("text-success")
        let data = await makeGenericApiCall(POST_URL, "GET")
        for (const key in data) {
            data[key].id = key
            state.postsArr.unshift(data[key])
        }

        let result = ``
        arr.forEach(ele => {
            result += `     <tr id${ele.id}>
                            <td>${ele.title}</td>
                            <td>${ele.author}</td>
                            <td>${new Date(ele.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div class="actions text-center">
                                    <button onClick="editPost(this)" class="btn btn-warning">✎ Edit</button>
                                    <button onClick="deletePost(this)" class="btn btn-danger">🗑 Delete</button>
                                </div>
                             </td>
                        </tr>
        `
        });

        tbody.innerHTML = result
        hideSpinner("text-success")
    } catch (err) {
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }
}
fetchPostsData(state.postsArr)
//===================== Edit ==============================
async function editPost(ele) {
    try {
        let EDIT_ID = ele.closest("tr").id
        let EDIT_URL = `${BASE_URL}/PostsfetchGeneric2/${EDIT_ID}.json`
        showSpinner("text-success")
        let data = await makeGenericApiCall(EDIT_URL, "GET")

        title.value = data.title
        author.value = data.author

        addBtn.classList.add("d-none")
        updateBtn.classList.remove("d-none")

        state.edit_id = EDIT_ID
        showForm()
        hideSpinner("text-success")
    } catch (err) {
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }
}
//===================== Update ==============================
async function updatePost(ele) {
    try {
        let UPDATE_ID = state.edit_id
        let UPDATE_URL = `${BASE_URL}/PostsfetchGeneric2/${UPDATE_ID}.json`

        let updatedPost = {
            title: title.value,
            author: author.value,
        }

        showSpinner("text-success")
        let data = makeGenericApiCall(UPDATE_URL, "PATCH", updatedPost)
        let getIndex = state.postsArr.findIndex(ele => ele.id === UPDATE_ID)
        updatedPost.createdAt = state.postsArr[getIndex].createdAt //adding createdAt value
        state.postsArr[getIndex] = updatedPost

        document.getElementById(UPDATE_ID).innerHTML = ` 
                            <td>${updatedPost.title}</td>
                            <td>${updatedPost.author}</td>
                            <td>${new Date(updatedPost.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div class="actions text-center">
                                    <button onClick="editPost(this)" class="btn btn-warning">✎ Edit</button>
                                    <button onClick="deletePost(this)" class="btn btn-danger">🗑 Delete</button>
                                </div>
                            </td>`

        addBtn.classList.remove("d-none")
        updateBtn.classList.add("d-none")

        state.edit_id = null
        hideSpinner("text-success")
        hideForm()
        postform.reset()
        showSnackBar("Updated!", "Post updated successfully", "success")

    } catch (err) {
        hideSpinner("text-success")
        showSnackBar("Error", err, "error")
    }
}
//===================== Delete ==============================
function deletePost(ele) {
    try {
        let DELETE_ID = ele.closest("tr").id
        let DELETE_URL = `${BASE_URL}/PostsfetchGeneric2/${DELETE_ID}.json`

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                showSpinner("text-danger")
                let data = makeGenericApiCall(DELETE_URL, "DELETE")

                let getIndex = state.postsArr.findIndex(ele => ele.id === DELETE_ID)
                state.postsArr.splice(getIndex, 1)

                ele.closest("tr").remove()
                hideSpinner("text-danger")
                showSnackBar("Removed!", "Post removed successfully", "success")
            }
        });
    } catch (err) {
        hideSpinner("text-danger")
        showSnackBar("Error", err, "error")
    }



}

function showSnackBar(title, msg, icon) {
    Swal.fire({
        title: title,
        text: msg,
        icon: icon
    });
}
function showSpinner(color) {
    spinner.classList.remove("d-none")
    spinner.classList.add(color)
}
function hideSpinner(color) {
    spinner.classList.add("d-none")
    spinner.classList.remove(color)
}

function showForm() {
    formRow.classList.remove("d-none")
}
function hideForm() {
    formRow.classList.add("d-none")
}

postform.addEventListener("submit", addingNewPost)
updateBtn.addEventListener("click", updatePost)
closeBtn.addEventListener("click", hideForm)
addPostBtn.addEventListener("click", showForm)












