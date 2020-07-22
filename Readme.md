Name: Arushi Rastogi

Level: Graduate

Program Description: 
1. This is a speech interface which provides up-to-the-date information about the covid-19 virus. 
2. It enables a user to ask a question regarding coronavirus statistics and receive the updated response.
3. According to the API, user is able to ask the agent: 
- about the number of latest worldwide cases, deaths and recovered people. 
- about the number of cases by any country.
- about the statistics for any state or county in the United States.

Tools used to develop:
1. DialogFlow - for back end
2. Unity - for front end
3. Visual Studio Code - for debugging the fulfillment code
4. API used: Coronavirus-tracker API (https://coronavirus-tracker-api.herokuapp.com/) 
5. OS - Windows

Dependencies: 
1. “actions-on-google": "^2.2.0",
2. "bent": "^7.1.2",
3. "dialogflow": "^0.6.0",
4. "dialogflow-fulfillment": "^0.5.0",
5. "firebase-admin": "^5.13.1",
6. "firebase-functions": "^2.0.2"

How to compile:
1. Open the SampleScene with Unity.
2. Click on file -> Build and Run
3. Create a new folder “Build” inside the project folder. 
4. Place the 2 certificates from assets inside the data directory of build folder.

How to run:
After building on Unity, click on the application icon inside the folder to run the project and interact with the agent.
