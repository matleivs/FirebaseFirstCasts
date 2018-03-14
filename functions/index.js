// import { posix } from 'path';
// import { retry } from '../../Library/Caches/typescript/2.6/node_modules/@types/async';

const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

/* // First Cloud function example :)
 exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Lexikon!");
 console.log('helloWorld Function was triggered');
}); */

exports.sanitizePost = functions.database
// specify the event I want it to triger on
.ref('/posts/{pushId}') // <- database trigger, looking at the path /posts, uses a wildcard
.onWrite(event => { // <- i'm interested in Write Events => use the onWrite method, it receives an Event object which describes what changed. 
/*     event object has a bunch of properties, 2 most interesting are:
    event.params property: 
    --> contains an object with key-value pairs of all the wildcards from this path
    --> here: params has an entry for the pushId that was generated from the client sdk
    event.data (it is of type DeltaSnapshot): 
    --> contains an objet with a description of everything that changed When the Write happend
    --> has a property "key" = name of location where the write happend (here: the pushId)
    --> methods to call on the DeltaSnapshot, for navigating, iterating the data at the location of the change,
    and val() = returns all the data inside the DeltaSnapshot as a JS object. 
    e.g. call val() on the deltasnapshot for my function sanitizePost -> get json object with
    title, body, date, from  */
    const post = event.data.val() // this is the post as a json object
    
    /* To prevent the cloud function being triggered at the post of an already sanitized post,
    and thereby an infinite loop, use a boolean flag on the post & check it before running the sanitize function on it: */
    if(post.sanitized){
        return
    }
    console.log("Sanitizing new post "+ event.params.pushId)
    console.log(post)
    post.sanitized = true

    // takes a string and returns a modified string, overwrite the previous value in the object
    post.title = sanitize(post.title) 
    post.body = sanitize(post.body)
    // write the post back to the location where it came from
    const promise = event.data.ref.set(post)
    return promise
})

function sanitize(s){
    var sanitizedText = sanitizedText.replace(/\bstupid\b/ig, "wonderful")
    return sanitizedText
}
/* ! The function should not return before the Write back to the DB is complete.
But as the set-method is asynchronous => it returns right away, while the write happens in the bg.
However, it returns an object called a promise, used to track the Completion of that Write.
So Cloud functions can use this promise to wait, until the write is complete.
A promise has 3 possible states: pending, rejected, fulfilled (last 2 = settled)*/ 