// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues - apppooo
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const bent = require('bent');
const getJSON = bent('json');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my provider!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`Sorry, can you please say that again?`);
  }

  function worldwideLatestStats(agent)
  {
    const type = agent.parameters.type;
    return getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/latest?source=jhu').then((result)=>
    {
      agent.add(`According to my Latest data.`);
      if(type.length >= 3)
      {
        agent.add(`There are currently ${result.latest.confirmed}confirmed cases of COVID-19,${result.latest.deaths} deaths and  ${result.latest.recovered} people who have recovered COVID-19.`);
        return;
      }
      for(var i = 0 ; i < type.length; i++){
        if(i ==1)
        {
          agent.add(`In addition,`);
        }
        switch(type[i]){
          case 'confirmed':
              agent.add(`There are currently ${result.latest.confirmed} confirmed cases of COVID-19.`);
              break;
          case 'deaths':
          agent.add(`There are currently ${result.latest.deaths} deaths of COVID-19.`);
          break;
          case 'recovered':
          agent.add(`There are currently ${result.latest.recovered} people who have recovered COVID-19.`);
          break;
          default:
              agent.add(`There are currently ${result.latest.confirmed}confirmed cases of COVID-19,${result.latest.deaths} deaths and  ${result.latest.recovered} people who have recovered COVID-19.`);
        }
      }
     
   
    }).catch((error)=>
    {
    console.error(error);
    });
   
   
  }

  function statsInUnitedStates(agent) {
    var type = agent.parameters.type;
    var states_arr = agent.parameters.state;
    var county_arr = agent.parameters.county;
    var res_arr = [];
    var flag = 1;
    for(let  i = 0; i < states_arr.length; i++) {
        if(county_arr.length == 0)
            res_arr.push(getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=csbs&province=' + states_arr[i]));
        else {
            county_arr.forEach(county => {
                res_arr.push(getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=csbs&province=' + states_arr[i] + '&county=' + county.split(" ")[0]));
             });
        }
    }
    // states_array.forEach(state => {
    //     if(counties_arr.length == 0)
    //         promise_arr.push(getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=csbs&province=' + state));
    //     else {
    //         counties.forEach(county => {
    //             promise_arr.push(getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=csbs&province=' + state + '&county=' + county.split(" ")[0]));
    //         });
    //     }
    // });

    return Promise.all(res_arr).then((result)=>
    {
      result.forEach(res => {
      if(flag == 1) {
            if(county_arr.length == 0) {
                agent.add(`According to my latest data, in ${res.locations[0].province}`);
            }
            else {
                agent.add(`According to my latest data, in ${res.locations[0].county} County`);
            }
        flag = 0;
        }
        else {
          if(county_arr.length == 0) {
                agent.add(`And in ${res.locations[0].province},`);
            }
            else {
                agent.add(`And in ${res.locations[0].county} County,`);
            }
        }
      if(type.length >= 3)
      {
        agent.add(`There are currently ${res.latest.confirmed}confirmed cases of COVID-19,${res.latest.deaths} deaths and  ${res.latest.recovered} people who have recovered COVID-19.`);
        return;
      }
      for(var i = 0 ; i < type.length; i++){
        if(i ==1)
        {
          agent.add(`In addition,`);
        }
        switch(type[i]){
          case 'confirmed':
              agent.add(`There are currently ${res.latest.confirmed} confirmed cases of COVID-19.`);
              break;
          case 'deaths':
          agent.add(`There are currently ${res.latest.deaths} deaths of COVID-19.`);
          break;
          case 'recovered':
          agent.add(`There are currently ${res.latest.recovered} people who have recovered COVID-19.`);
          break;
          default:
              agent.add(`There are currently ${res.latest.confirmed}confirmed cases of COVID-19,${res.latest.deaths} deaths and  ${res.latest.recovered} people who have recovered COVID-19.`);
        }
      }
    });
    }).catch((error)=>
    {
    console.error(error);
    });
  }
 
  function locationWiseStats(agent)
  {
    const type = agent.parameters.type;
    const country = agent.parameters.country;
    const yesterday_date = agent.parameters.date;
    const prev_date = agent.parameters.duration;
    var datetime = '';
    var date = null;
    if(prev_date.startDate != undefined){
        datetime = (prev_date.startDate).split('T')[0] + "T00:00:00Z";
        date = new Date(datetime);
    }
    if(yesterday_date != undefined) {
        datetime = yesterday_date.split('T')[0] + "T00:00:00Z";
        date = new Date(datetime);
    }
    var country_codes = [];
    for(var i = 0; i < country.length; i++) {
        country_codes.push(country[i]['alpha-2']);
    }
    var flag = true;
    var promise_arr = [];
    country_codes.forEach(code => {
        promise_arr.push(getJSON('https://coronavirus-tracker-api.herokuapp.com/v2/locations?source=jhu&country_code=' + code + '&timelines=true'));
    });

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return Promise.all(promise_arr).then((result)=>
    {
      result.forEach(res => {
        let confirmed = 0, deaths = 0;
        confirmed = res.latest.confirmed - (res.locations[0].timelines.confirmed.timeline[datetime] | 0);
        deaths = res.latest.deaths - (res.locations[0].timelines.deaths.timeline[datetime] | 0);
      if(flag) {
        agent.add(`According to my latest data in ${res.locations[0].country}`);
        flag = false;
        }
        else
        agent.add(`And in ${res.locations[0].country},`);
      if(type.length >= 3)
      {
        if(months[date.getMonth()] == undefined) {
        agent.add(`There are currently ${confirmed}confirmed cases of COVID-19,${deaths} deaths and  ${res.latest.recovered} people who have recovered COVID-19.`);
         
        }
        else {
            agent.add(`There are ${confirmed}confirmed cases of COVID-19,${deaths} deaths and  ${res.latest.recovered} people who have recovered COVID-19 since then.`);
         
        }
        return;
      }
      for(var i = 0 ; i < type.length; i++){
        if(i ==1)
        {
          agent.add(`In addition,`);
        }
        switch(type[i]){
          case 'confirmed':
              if(months[date.getMonth()] == undefined) {
                agent.add(`There are currently ${confirmed} confirmed cases of COVID-19.`);
                break;
              }
              else {
                agent.add(`There are ${confirmed} confirmed cases of COVID-19 since then`);
                break;
              }
              break;
          case 'deaths':
            if(months[date.getMonth()] == undefined) {
                agent.add(`There are currently ${deaths} deaths of COVID-19.`);
                break;
              }
              else {
                agent.add(`There are ${deaths} deaths of COVID-19 since then.`);
                break;
              }
            break;
          case 'recovered':
            if(months[date.getMonth()] == undefined) {
                agent.add(`There are currently ${res.latest.recovered} recovered cases of COVID-19.`);
                break;
              }
              else {
                agent.add(`There are ${res.latest.recovered} recovered cases of COVID-19 since then.`);
                break;
              }
          break;
          default:
              agent.add(`There are currently ${confirmed}confirmed cases of COVID-19,${deaths} deaths and  ${res.latest.recovered} people who have recovered COVID-19.`);
        }
      }
    });
    }).catch((error)=>
    {
    console.error(error);
    });
   
   
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Worldwide Latest Stats', worldwideLatestStats);
  intentMap.set('Location Latest Stats', locationWiseStats);
  intentMap.set('US Location Stats', statsInUnitedStates);

  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});