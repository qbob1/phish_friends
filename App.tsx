import React from 'react';
import sha1 from 'sha1'
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
import { ConsoleSqlOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

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

async function checkPassword(password, setPwned) {
  const hash = sha1(password).toUpperCase()

  const prefix = hash.substr(0, 5)
  const suffix = hash.substr(5)

  await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: {
      Accept: "application/vnd.haveibeenpwned.v2+json"
    }
  })
    .then(resp => resp.ok ? resp.text() : Promise.reject(resp.text()))
    .then(resp => resp.split('\n')
      .map(entry => {
        const [suffix, count] = entry.split(":")
        return {
          suffix,
          count: parseInt(count, 10)
        }
      }))
    .then(results => {
      const result = results.some(result => result.suffix.toLowerCase() === suffix.toLowerCase())
      setPwned(result)
    })
    .catch(e => {
      console.log(e)
    })
}

export function App() {
  const [submitted, setSubmitted] = React.useState(null)
  const [pwned, setPwned] = React.useState(null)

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  const rid = params.rid

  useEffect(x=>{
    if(submitted && pwned != null){
      postData('/log', {submitted,pwned,rid})
    }
  })

  const value = params.template;
  const template = templates[value != null ? parseInt(value) : Math.floor(Math.random() * templates.length)]
  addCss(template[1])

  if (submitted == null) {
    return (
      <div class="flex flex-auto justify-center relative rounded-xl overflow-auto p-8 w-full">
        <div class="relative rounded-xl overflow-auto p-8 w-6/12 justify-center items-center flex flex-col">
          <img style={{ maxWidth: '25vw' }} src={images[Math.floor(Math.random() * images.length)]} />
          <h3>{taglines[Math.floor(Math.random() * taglines.length)]}</h3>
          {render(template[0], {
            schema: schema, onSubmit: e => {
              checkPassword(e.password, setPwned)
              setSubmitted(e.email);
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
            <svg class="mx-auto mb-4 w-14 h-14 text-black " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 class="mb-5 text-lg font-normal text-black ">Uh oh! It looks like you fell for a phishing attempt! {pwned && "\nYour password has been involved in a breach!"}</h2>
            <h2 class="mb-5 text-lg font-normal text-black ">The information security team will assign you training to better understand how you can mitigate falling for phishing attempts.</h2>
          <h2 class="mb-5 text-lg font-normal text-black ">Please watch the below video to gain better awareness</h2>
          </div>
          <video controls className="w-full aspect-video" style={{'aspect-ratio': '12 / 6'}} src="https://phishing-content.us-southeast-1.linodeobjects.com/C3E10%20-%20NANO%20-%20A%20Terminal%20Mistake%20-%20Spear%20Phishing.mp4"/>
        </div>
      </div>
    </div>)

}
