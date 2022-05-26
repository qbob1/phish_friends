import React from 'react';
import { AutoForm as form1 } from 'uniforms-unstyled';
import { AutoForm as form2 } from 'uniforms-antd';
import { AutoForm as form3 } from 'uniforms-bootstrap3';
import { AutoForm as form4 } from 'uniforms-bootstrap4';
import { AutoForm as form5 } from 'uniforms-bootstrap5';
import { AutoForm as form6 } from 'uniforms-material';
import { AutoForm as form7 } from 'uniforms-semantic';
import { bridge as schema } from './schema/json-schema';
import { images as images } from './images';
import { taglines } from './PhonyTaglines';
import { postData } from './HttpService';
import { ContactSupportOutlined } from '@material-ui/icons';
const templates = [
  [form1, null],
  [form2, "https://cdnjs.cloudflare.com/ajax/libs/antd/3.25.3/antd.min.css"],
  [form3, "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css"],
  [form4, "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css"],
  [form5, "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.0-beta3/css/bootstrap.min.css"],
  [form6, null],
  [form7, "https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"]
]

const render = (tmp, props) => React.createElement(tmp, props)

function addCss(fileName) {
  if (fileName != null) {
    var head = document.head;
    var link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = fileName;

    head.appendChild(link);
  }
}

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function checkPwned(submission, callback) {
  const digest = await digestMessage(submission.password.slice(0, 5))
  const resp = await postData('/log', { username: submission.username, digest }).then(d=>d.json);
  console.log(resp)
  /*
  if (callback != null) {

    callback(await postData('/log', { username: submission.username, digest }))
  }*/

}

export function App() {
  const [submitted, setSubmitted] = React.useState(false)
  const [pwned, setPwned] = React.useState(false)

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  const value = params.template;
  const template = templates[value != null ? parseInt(value) : Math.floor(Math.random() * templates.length)]
  addCss(template[1])

  if (!submitted) {
    return (
      <div class="flex flex-auto justify-center relative rounded-xl overflow-auto p-8 w-full">
        <div class="relative rounded-xl overflow-auto p-8 w-6/12 justify-center items-center flex flex-col">
          <img style={{ maxWidth: '25vw' }} src={images[Math.floor(Math.random() * images.length)]} />
          <h3>{taglines[Math.floor(Math.random() * taglines.length)]}</h3>
          {render(template[0], {
            schema: schema, onSubmit: e => {
              checkPwned(e, setPwned)
              setSubmitted(true);
            }
          })}
        </div>
      </div>)
  }
  return (
    <div id="popup-modal" tabindex="-1" class="overflow-y-auto overflow-x-hidden top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full">
      <div class="relative p-4 w-full h-full md:h-auto">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="p-6 text-center">
            <svg class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Uh oh! It looks like you fell for a phishing attempt!</h3>
            <div class="h-14 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <button data-modal-toggle="popup-modal" type="button" class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    </div>)

}
