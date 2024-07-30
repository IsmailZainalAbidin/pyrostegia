function SendMessage() {
  var player = GetPlayer();
  var message = player.GetVar("message");
  var response = player.GetVar("response");
  var chatHistory = player.GetVar("chatHistory");
  var role = player.GetVar("role");
  var apiKey = player.GetVar("apiKey");
  var systemContent = `Act as a ${role} Assistant. Provide a concise answer to the user's question in a maximum of 500 characters.`;
  var userContent = `Question: ${message}`;
  apiKey = `Bearer ${apiKey}`;

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
    var data = JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null
    });
    xhr.send(data);
  }

  sendMessage();
}
