# Content Security Policy (CSP)

## 1. Introduction

The **`Content-Security-Policy`** HTTP response header adds a layer of protection against XSS and clickjacking attacks. It's a relatively new header: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP>.

In this header you define which dynamic resources (JavaScript, CSS, images, ...) are allowed to load and the URLs that they can be loaded from.

Let's start an interactive introduction to this pretty extensive and exciting header!

---

## 2. Investigate app

1. Install all dependencies

   ```bash
   npm install
   ```

1. Start **_`server.js`_**

   ```bash
   npm start
   ```

1. Browse to <http://localhost:3000/>

1. Inspect **_`index.html`_** and summarize for yourself _what_ is being loaded from _where_.

   a. own stylesheet\
   b. google font stylesheet\
   c. fonts from google\
   d. bootstrap stylesheet (over CDN)\
   e. image\
   f. youtube embeds\
   g. external javascript (**_`vue.js`_**)\
   h. inline javascript (**`new Vue(/* .. */)`**)

---

## 3. Implement CSP

1. In **_`server.js`_** add the CSP policy which will restrict styles, fonts, images, embeds and script to sameorigin only.

   Set the header in the middleware (replace the TODO comment):

   ```js
   app.use((_req, res, next) => {
     res.setHeader(
       'Content-Security-Policy',
       "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'; script-src 'self'"
     );

     next();
   });
   ```

   In the browser almost nothing is shown anymore. Great!

1. The header currently contains 6 policy directives. Most are self-explanatory.

   - **`'self'`** means sameorigin
   - **`frame-src`** defines allowed sources for frame embeds
   - **`default-src`** is always the first policy directive in a CSP; it defines a fallback policy for directives not explicitly mentioned in the header

1. Inspect the console in the browser. For all refused resources a neat log statement is shown.

1. Change the header name slightly:

   - from: **_'Content-Security-Policy'_**
   - into: **_'Content-Security-Policy-Report-Only'_**

   Refresh the browser with **CTRL+F5**. Everything is shown again AND the console is showing all refusions (8 in total). This header is great when you need to determine which policies to activate!

1. Let's enable each resource one by one. **Pay attention when copy-pasting!**

   a. Two stylesheets (Google font & Bootstrap):

   ```js
   style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net;
   ```

   _Console: 6 refusions left_

   b. Infosupport image:

   ```js
   img-src 'self' https://training.infosupport.com;
   ```

   _Console: 5 refusions left_

   c. YouTube embed:

   ```js
   frame-src 'self' https://www.youtube.com;
   ```

   _Console: 3 refusions left_

   d. Font files:

   ```js
   font-src 'self' https://fonts.gstatic.com;
   ```

   _Console: 2 refusions left_

   e. External Vue.js script:

   ```js
   script-src 'self' https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js
   ```

   We provided the full path this time. We could have done this for the other policies as well.

   _Console: 1 refusion left_

---

## 4. Implement CSP for inline JavaScript

The only refusion left is the one about the inline script. The best way to solve this is probably making it an external script and then handle it like we did with the **_`vue.js`_** script.

Let's keep it an inline script and pick the best of three options 👉 **hash**ing the script.

1. The browser already calculated a hash (thanks to the report-only header). Copy-paste the full string from the console:

   ```js
   script-src 'self' 'sha256-HmVGArCncWNVcEc8OrH4EJ+qC+9WzpzUWnMICWbfwFI=' https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js
   ```

   From a developer perspective the only disadvantage is that you have to replace the hash as soon you make a change in the script.
   For completeness the other two options are given at the very bottom of this document.

---

## 5. Montoring

(only if time permits)

When the CSP is active in Production, it's important to keep an eye upon the CSP:

- Are new and legitimate sources forgotten?
- Is there an XSS attack going on which needs to be identified and stopped immediately?

There is a 3rd related header **`Report-To`** where you can specify the urls where JSON-formatted violation reports should be POSTed to.

1. Add this header:

   ```js
   res.setHeader(
     'Report-To',
     '{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"http://localhost:3000/cspreport"}],"include_subdomains":true}'
   );
   ```

1. In the other header add a directive where you attach the group **`csp-endpoint`** to a URI:

   ```js
   res.setHeader(
     'Content-Security-Policy',
     "default-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://training.infosupport.com; frame-src 'self' https://www.youtube.com; script-src 'self' 'sha256-HmVGArCncWNVcEc8OrH4EJ+qC+9WzpzUWnMICWbfwFI=' https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js; report-uri /cspreport;"
   );
   ```

1. As browsers send the report payload in different ways, we'll need to account for all the possible **`Content-Type`** values. Update the existing line of code to:

   ```js
   app.use(
     express.urlencoded({
       extended: true,
       type: [
         // 👈 add
         'application/json',
         'application/csp-report',
         'application/reports+json',
       ],
     })
   );
   ```

1. Add the endpoint where the report should be sent to:

   ```js
   app.post('/cspreport', (req, _res) => {
     console.log(req.body);
   });
   ```

1. You can test this functionality easily by changing a character in the inline script, for example:

   ```js
   CSP is awesome!!
   ```

---

## 6. Inline script alternatives

(only if time permits)

Two other options to include inline scripts:

a. add **'unsafe-unline'** which is a **BAD** idea as we want to prevent code-injection attacks:

```js
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js
```

b. using a **NONCE** which is most often not the way to go. A new nonce (cryptographically strong token) would need to be generated with each request.

Main disadvantage is that the script cannot be cached anymore:

```js
script-src 'self' 'nonce-s2yb0mf+t3pBt97h6K9pyQ==' https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js
```

```js
<script nonce="s2yb0mf+t3pBt97h6K9pyQ==">// Inline code</script>
```
