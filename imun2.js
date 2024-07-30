const Groq = require('groq-sdk');

const groq = new Groq();
async function main() {
  const player = GetPlayer();
  const message = player.GetVar("message");
  const response = player.GetVar("response");
  const chatHistory = player.GetVar("chatHistory");
  const role = player.GetVar("role");
  const apiKey = player.GetVar("apiKey");

  function sendMessage() {
    player.SetVar("response", "Please wait...");
    player.SetVar("message", "");
    var xhr = new XMLHttpRequest();
    var url = 'https://api.groq.com/openai/v1';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', apiKey);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var apiResponse = JSON.parse(xhr.responseText);
          if (apiResponse.choices && apiResponse.choices[0] && apiResponse.choices[0].message && apiResponse.choices[0].message.content) {
            var generatedResponse = apiResponse.choices[0].message.content.trim();
            player.SetVar("response", generatedResponse);
            player.SetVar("chatHistory", `${chatHistory}\nUser: ${message}\nResponse: ${generatedResponse}\n`);
          } else {
            player.SetVar("response", `Error: ${JSON.stringify(apiResponse)}`);
          }
        } else {
          player.SetVar("response", `Error: ${xhr.status} - ${xhr.statusText}`);
        }
      }
    };

    const systemContent = `Act as a ${role} Assistant. Provide a concise answer to the user's question in a maximum of 500 characters.`;
    const userContent = `Question: ${message}`;
    const apiKey = `Bearer ${apiKey}`;

    var data = JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
      ]
    });
    xhr.send(data);
  }

  sendMessage();
}
