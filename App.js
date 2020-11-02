import React, { Component } from 'react';
import * as TaskManager from 'expo-task-manager';
import { View, Button, Text, Alert, AsyncStorage } from "react-native";
import * as Location from "expo-location";
import { getDistance } from "geolib";
const moment = require("moment");


const TASK_FETCH_LOCATION_TEST = 'background-location-task_global';

//global.x = 'http://192.168.2.10:3007'
global.x = 'https://volleybuddy.metis-data.site';

//FUNCTION: CALCULATES DISTANCE
const  calculateDistance = (start_x,start_y, end_x,end_y) => {
  try {
    let distance = getDistance(
      {
        latitude: start_x,
        longitude: start_y,
      },
      {
        latitude: end_x,
        longitude: end_y,
      },
      //(accuracy = 100)
    );
    //console.log('distanceFromCourt: ',distance)
    //checkin(distance);
      return(distance);  
    } catch (error) {
    console.log(error)
  }
}


//FUNCTION: GET ALL SITES
const getCourts = async () => {
    console.log('retrieving courts...')
    let response = await fetch(`${global.x}/sites`)
    .then(res => res.json())
    .then(res => { 
      //console.log('res',res["data"]) 
      return res["data"]
    })
    .catch((error) => {
      console.log(error)
    });
    return response
}

//FUNCTION: SORT
const compare = ( a, b ) => {
  if ( a.distance < b.distance ){
    return -1;
  }
  if ( a.distance > b.distance ){
    return 1;
  }
  return 0;
}




TaskManager.defineTask(TASK_FETCH_LOCATION_TEST, ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }
  if (data) {
    const { locations } = data;
    console.log(locations);
    // do something with the locations captured in the background

    //MAP COURTS AND RETRIEVE CLOSEST COURT
    const map1 = getCourts().then(res=>{
      let response = res.map((court) => ({
        ...court,
        distance: calculateDistance(
          court.latitude,
          court.longitude,
          locations[0].coords.latitude,
          locations[0].coords.longitude
        )
      })).sort(compare)[0];
      console.log(response);
      return response
    })
    //map1.then(res=>console.log(res))

    //STORE PLAYGROUND
    map1.then(nearestSite=>{
      console.log(nearestSite.distance);
      
      //***TEMP SEND TO TABLE */  
      let sqlStamp = moment().utcOffset('-0400').format("YYYY-MM-DD HH:mm:ss").substr(0,18)+'0';
      //console.log(sqlStamp,locations[0].coords.latitude,locations[0].coords.longitude,nearestSite.site_id,nearestSite.distance)
      

       
      fetch(
        // MUST USE YOUR LOCALHOST ACTUAL IP!!! NOT http://localhost...
        `${global.x}/addGlobal?datetime=${sqlStamp}&latitude=${locations[0].coords.latitude}&longitude=${locations[0].coords.longitude}&nearest_site=${nearestSite.site_id}&email=${'GLOBALTEST@GMAIL.COM'}&distance=${nearestSite.distance}`,
        { method: "POST" }
        ).catch((error) => {
          console.log('ERROR:',error)
        })
  
      
      

    })
   
  }

 

  


});

class App extends Component {

  async componentDidMount() {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      console.log('location permissions are granted...')
    }

  }

  //START LOCATION TRACKING
  startBackgroundUpdate = async () => {
    Alert.alert('TRACKING IS STARTED')
    await Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION_TEST, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 1, // minimum change (in meters) betweens updates
      //deferredUpdatesInterval: 1000, // minimum interval (in milliseconds) between updates
      // foregroundService is how you get the task to be updated as often as would be if the app was open
      foregroundService: {
        notificationTitle: 'Using your location for TESTING',
        notificationBody: 'To turn off, go back to the app and toggle tracking.',
      },
      pausesUpdatesAutomatically: false,
    });


  }

  stopBackgroundUpdate = async () => {
    Alert.alert('TRACKING IS STOPPED');
    Location.stopLocationUpdatesAsync(TASK_FETCH_LOCATION_TEST)
    //TaskManager.unregisterTaskAsync(TASK_FETCH_LOCATION_TEST);
  }


  //FUNCTION: GET ALL SITES




  //FUNCTION: CALCULATES DISTANCE
  calculateDistance = (start_x, start_y, end_x, end_y) => {
    try {
      let distance = getDistance(
        {
          latitude: start_x,
          longitude: start_y,
        },
        {
          latitude: end_x,
          longitude: end_y,
        },
        //(accuracy = 100)
      );
      //console.log('distanceFromCourt: ',distance)
      //checkin(distance);
      return (distance);
    } catch (error) {
      console.log(error)
    }
  }




  render() {
    return (
      <View style={{ marginLeft: '30%', marginTop: '50%', width: '40%' }}>
        <View>
          <Text>
            Info will be here
          </Text>


          <View>
            <Text>

            </Text>
          </View>
        </View>


        <Button
          onPress={this.startBackgroundUpdate}
          title="START TRACKING"
        />

        <View>
          <Text>

          </Text>
        </View>

        <Button
          style={{ marginTop: '20%' }}
          onPress={this.stopBackgroundUpdate}
          title="STOP TRACKING"
        />
      </View>
    );
  }
}

export default App;


/**
 *  const map1 = getCourts().then(res=>{
      let response = res.map((court) => ({
        ...court,
        distance: calculateDistance(
          court.latitude,
          court.longitude,
          locations[0].coords.latitude,
          locations[0].coords.longitude
        )
      })).sort(compare)[0];
      console.log(response);
      return response
    })
    
    console.log(map1);
  
    //STORE PLAYGROUND
    map1.then(nearestSite=>{
      console.log('nearest_distance',nearestSite.distance);
    })
     
  
fetch(
      // MUST USE YOUR LOCALHOST ACTUAL IP!!! NOT http://localhost...
      `${global.x}/addTrackingGlobal?datetime=${sqlStamp}&latitude=${locations[0].coords.latitude}&longitude=${locations[0].coords.longitude}&nearest_site=${nearestSite.site_id}&email=${'GLOBALTEST@GMAIL.COM'}&distance=${nearestSite.distance}`,
      { method: "POST" }
      ).catch((error) => {
        console.log('ERROR:',error)
      })




    */