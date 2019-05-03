# Protecting Content for Privileged Access

A quick basic guide to privileged access to content in your web browser

## Before you read on...

This guide explains concepts of how to guide new users through a website and the technology / logic choices that grant access to information.

If you have ever programmed or been involved with the production of an application with some form of authentication or authorization you may find this document containing what may appear to be common knowledge.

This guide is intended for users who are starting out with this topic.

## The web browser

Content in the web browser is accessed by making a connection to an active server which, upon connection, returns to your browser a file (or files) such an HTML document. This HTML document typically contains the elements that you see on the page, these elements can be modified with CSS files and more complex logic can be implemented by including JavaScript files.

What all these technologies have in common is that they all operate or **run** inside of the web browser. Unless specially configured, the server is not going to modify or run any of these files other than simply serving them up to the requesters browser.

What this means is that no matter what kind of restrictions, obfuscations or misdirections is applied to your HTML/CSS/JavaScript, your content is going to reach they users computer whether or not you want it to.

This poses an issue for producing a website or application that contains privileged information only destined for the eyes of certain *privileged* users when all the content is delivered up front. We will come back to this issue later but for now its important to learn the differences between Authentication and Authorization.

## Authentication and Authorization

Often the source of confusion, the terms Authentication and Authorization are generally both used in applications / programs that have some process to access protected content.

### Authentication

*Authentication* is validation that a user is who they say they are. By determining that the user is authentic we can safely identify who this user is. Authentication, by this definition does not grant a user access to protected content. That will require an additional step known as *Authorization*.

### JSON Web Tokens ([JWT](http://jwt.io))

In this repository, the authentication flow ends with a user being issued a JWT. The JWT acts as a users 'passport'.
Like a real passport, the JWT can be given to other users or entities for them to identify who the holder is. Also like a passport, a JWT cannot be transferred to another user by changing the name on the passport / JWT.
These tokens are passed around and used for the purposes of authenticating a user during an authorization.

### Authorization

*Authorization* is the process of checking a user's permissions, confirming that they can access a particular segment of protected content and subsequently delivering it to the user, which in this case means delivering the content to the user's web browser.

## Client and Server differences

Also know as the **front end** and **back end**, successfully and securely implementing the Authentication > Authorization > Content Delivery flow relies upon knowing the difference between client side and server side operations

Coming back the problem earlier - how we can authorize and deliver protected content within a website? The answer is: **we cant**.

The only way we can properly control the content returned to the user is by carrying out the authorization process server-side.

### Client side code

If you have played around with web development before, chances are that you are familiar with HTML, CSS and possibly have experience writing some JavaScript code.

JavaScript itself, being a scripting language, has the capability to implement the logic required to perform the authorization checks, however, these checks are no good if they are happening on the client side as all the outcomes, authorized or not, will have to be packaged up and sent to the user's web browser before they are even run.

So why not run the JavaScript on the server prior to it making it to the user's browser? This is absolutely possible. The catch is that any given server is unlikely to have the ability to run JavaScript code by default, most servers just aren't set up this way. JavaScript running inside the user's browser will almost always work since all modern browsers contain some form of a JavaScript runtime, the most common one at the time of writing being [V8](https://v8.dev/).

### Server side code

To follow on from the example above; JavaScript can run on a server if that server has the ability to do so. The most common server-side JavaScript runtime at the time of writing would be [Node.js](https://nodejs.org/en/). Aside from running JavaScript on the server, there are many other server side languages that may be more commonly installed or available on business-level servers. Some examples include php the .Net runtime.
To complete the authorization process in a number of server-side languages, see the [Examples](./Examples) directory.

## Protecting content

Once a user is authorised, the question remains; by what mechanism do we deliver the protected content.

### Fetching it

Consider the following example:
```html
<html>
  <script type="text/javascript">
    function showMe(){
      // some call to a server where the authorization is performed and content returned
      var contentFromServer = ajax();

      //set the content in our <div> to the response from the server
      Document.getElementById(protected_content).innerHTML = contentFromServer;

    }
  </script>
  <body>
    <div>non-privileged information</div>
    <div id=protected_content onclick="showMe()"></div>
  </body>
</html>

```
> please note that the `ajax()` call above is pseudocode that represents a http request

In the above example, our application has a function `showMe()` that makes a call or 'fetch' to the server where authorization is carried out and some protected content is returned. The returned information is then added to the HTML document. This method is typical in many applications where each bit of content is taken from the server as it is needed.
It also means unauthorized users will still see all of the other non-privileged elements of the website.

### Wrapping it

But what if we have a pre-built website and we don't want to think about it too much. We could make it so that a large chunk, perhaps even the whole website / app is either returned or not based upon an authorization check?

```html
<html>
  <body>
    <div>non-privileged information</div>

    <?php
      if($authorized){
        echo "<div>this is hidden content for authorized users</div>";
      }
    ?>    

  </body>
</html>

```
> please note that the $authorized variable represents a check that has been performed earlier on (not shown above)

Note the php code being run in the above snippet. What you are seeing is part of the app (everthing inside the `<?php ... ?>` tags) is being run on the server before HTML is being delivered to the user. The HTML document that is returned to the user ends up looking like...

```html
<html>
  <body>
    <div>non-privileged information</div>

    <div>this is hidden content for authorized users</div>  

  </body>
</html>
```
For authorised users
and like...
```html
<html>
  <body>
    <div>non-privileged information</div>


  </body>
</html>
```
for non-authorised users.

This concept is known as 'wrapping'. This technique is what is employed when you use on of the example templates in the [Examples](./Examples) directory. I would suggest picking an example that aligns with a language or setup that you can run your server's environment and reading on from the documentation in there.

## Summary
Authentication is the first step in carrying out an authorization, all subsequent authorization 'checks' can be performed using the JWT provided during successful authentication.

Authorizations and protected content delivery can only really be performed server-side.

The client can consume protected content by either sending a http request to receive it or by requesting a wrapped webpage where their authorization is checked server-side.
