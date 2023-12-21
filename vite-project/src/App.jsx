import { useState, useEffect } from 'react'
import './App.css';

// Used for socket.io which is used to update the progress bars in real time.
import { socket } from './socket'; 

// Used for the progress bar styling and functionality.
import ProgressBar from "@ramonak/react-progress-bar";



function App() {


  // Fetches all name mappings from server and returns them.
  async function getInitialNameState() {

    console.log("fetching all names from server");
    
    // Fetch all name mappings from server.
    const result = await fetch("/allNames").then(async (data) => {

      // Once the data is received, convert it to json.
      const json = await data.json();

      const rows = [];

      // Populate the rows array with the data from the json.
      json.forEach((data) => {
        rows.push(data['p'].split(',').map((element) => {

          // Remove all quotes and parentheses from the data and return the cleaned element.
          return element.replace(/[()"']/g, '');
        }));
      });
      
      // Create a dictionary that maps food item ids (as integers) to their names (as strings).
      let initialState = {};
      for(const row of rows) {
        initialState[parseInt(row[0])] = row[1];
      }

      // Return the dictionary as the result.
      return initialState;
    });

    console.log(result);

    // Once all names are fetched and the initial state is cleaned and returned from the callback,
    // return the result.
    return result;
  }

  // Fetches all percent mappings from server and returns them as json.
  async function getInitialPercentState() {
    console.log("getting initial percent state");
    const result = await fetch("/allPercents");
    const json = await result.json();
    console.log("initial percent state: ", json);
    return json;
  }

  // Creates a state variable that maps food item ids to their names.
  const [idToNameMap, setIdToNameMap] = useState();

  // Creates a state variable that maps food item ids to their percentages.
  const [idToPercentMap, setIdToPercentMap] = useState();
  
  // Runs after the intial render of the page so that the page is populated with 
  // the correct intiail data and the socket is set up.
  useEffect(() => {

    // Fetches all name mappings from the server (which then contacts the database) 
    // and sets the idToNameMap state variable to the result.
    getInitialNameState().then((result) => {
      setIdToNameMap(result);
    });


    // Fetches all percent mappings from the server (these are stored directly in the 
    // server) and sets the idToPercentMap state variable to the result.
    getInitialPercentState().then((result) => {
      setIdToPercentMap(result);
    });
    
    // When the socket receives an update message, it calls this function which updates
    // the idToPercentMap state variable, keeping its old values and adding any new ones.
    function onUpdate(newMapping) {
      console.log("updating");
      console.log("new mapping:" + JSON.stringify(newMapping));

      // Updates the idToPercentMap state variable.
      setIdToPercentMap((previous) => 
          {
            let result = {...previous, ...newMapping};
            return result
          }
        );
    }

    // Sets up the socket to call the onUpdate function when it receives an update message.
    socket.on('update', onUpdate);


    // On cleanup, removes the socket listener.
    return () => {
      socket.off('update', onUpdate);
    }
  }, []);

  // Creates a list of options for the dropdown menu in the MapEditor component.
  let options = [];

  // If the idToNameMap is null or undefined, then we haven't received the initial data 
  // from the server yet or we don't have any data in the database yet.
  if(idToNameMap != undefined && idToNameMap != null) {
    for(const item of Object.keys(idToNameMap)){
      let labelString = item.toString() + ' -- ' + idToNameMap[item];
      options.push({value: item, label: labelString});
    }
  }
  
  // Returns the html for the App component. General structure:
  // -A container div (Used as a general container for the whole page and for styles that apply to the whole page),
  // -a list of data entries (The list of food items and their percentages displayed from left to right as: foodname,
  //  progress bar, percentage as text),
  // -and a MapEditor component (The component that allows the user to change the name of a food item) which is 
  //  displayed to the right of the DataEntires component.

  return (
    <div className="container">
      <ul className="dataBars" list-style-type="none">
        <DataEntries 
        idToPercentMap={idToPercentMap} 
        idToNameMap={idToNameMap}
        setIdToNameMap={setIdToNameMap} />
      </ul>
      
      <MapEditor 
      options={options}
      idToNameMap={idToNameMap}
      setIdToNameMap={setIdToNameMap}/>
      
    </div>
  );
}

// Returns a list of <li> elements that contain the formatted food item name, 
// progress bar, and the percentage as a label element.
function DataEntries({idToPercentMap, idToNameMap, setIdToNameMap}) {

  let entries = [];

  // If the idToPercentMap is null or undefined, then we haven't received the 
  // initial data or the server doesn't have any data yet.
  if(idToPercentMap != null && idToPercentMap != undefined) {

    // Get the keys in sorted order based on the food items' percentages (from lowest to highest).
    let sortedKeys = Object.keys(idToPercentMap).sort((a, b) => {
      return idToPercentMap[parseInt(a)] - idToPercentMap[parseInt(b)];
    });
    
    // Iterate through each food item we have a percentage for (sorted from lowest to highest percentage).
    for (let id of sortedKeys) {
      id = parseInt(id);

      // If the idToNameMap exists, get the name from it, otherwise set the name to be undefined.
      let name = idToNameMap ? idToNameMap[id] : undefined;

      // Get the percent of this food item based on its id.
      let percent = idToPercentMap[id];

      // If we need to create a data entry for a food item that doesn't have a name yet,
      // give it a default name and add it to the idToNameMap state variable. The user can
      // then change the name of the food item using the MapEditor component.
      if(name === undefined) {
        name = "FoodID#:" + id;
        setIdToNameMap((previous) => ({
          ...previous,
          [id]: name,
        }));
      }


      // Push the formatted html data entry to the entries array.
      entries.push(
      <li key={id}>
        <div className="liDiv">
          <label className="foodName">{name}</label>
          <ProgressBar className="bar" completed={percent} customLabel=" "/>
          <label className="percent">{percent}%</label>
        </div>
      </li>);
    }
  }

  return entries;
}


// Returns the MapEditor component. Prop uses:
//  -options: Used to populate the dropdown menu with the food items' ids and names.
//       Gets passed to the Options component.
//  -idToNameMap: Used to populate the input text box with the selected food item's current name.
//  -setIdToNameMap: Used to update the idToNameMap state variable when the user submits a new name.
function MapEditor({ options, idToNameMap, setIdToNameMap }) {

  // Creates a state variable that is used to set the placeholder text of the input text box.
  const [currentName, setCurrentName] = useState("New Name");

  // Handles when a new food item is selected from the dropdown menu.
  function handleDropdown(e) {

    // Get the id of the selected food item.
    let id = e.target.value;

    // Set the input text box to be empty.
    document.getElementById("nameForm").value = "";

    // Set the placeholder text of the input text box to the selected food item's name.
    setCurrentName(idToNameMap[id]);

  }

  // Handles when the submit button is clicked.
  function handleClick(e) {

    // Get the id of the selected food item.
    let id = document.getElementById("idsDropdown").value;
    // Get the new name of the selected food item.
    let newName = document.getElementById("nameForm").value;

    // If the new name is not empty,
    if(newName !== ''){

      // Update the idToNameMap state variable to include the new name.
      setIdToNameMap((prev) => {return({...prev,
        [id]: newName})});

      // Set the placeholder text of the input text box to the new name.
      setCurrentName(newName);

      // Clear the input text box.
      document.getElementById("nameForm").value = '';

      // Send a post request to the server to update the database.
      fetch("/nameMapping", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({itemId: id, itemName: newName})
      });
    }
  }

  // Returns the html for the MapEditor component. General structure:
  // A title ("Give Food Item A Name"), 
  // a subtitle ("ID Number", used to specify what the dropdown menu lets the user choose), 
  // a dropdown menu (The dropdown menu itself with options in the format of: "<foodID#> -- <foodName>"),
  // an input text box (Where the user inputs the new name for the food item), 
  // and a submit button (Used to update the food item's name everywhere on the page and on the database).
  return(
  <section className="idMapEditor">
      <label id="title">Give Food Item A Name</label>
      <label id="subTitle">ID Number</label>
        <select id="idsDropdown" onChange={handleDropdown}>
          <Options items={options}/>
        </select>
      <input id="nameForm" type="text" placeholder={currentName}/>
      <button className="button" id="submit"onClick={handleClick}>Submit New Name</button>
  </section>);
}

// Returns a list of options for the dropdown menu based on the items prop.
function Options({items}) {
  let options = [];
  for(const item of items){
    options.push(<option key={item.value} value={item.value}>{item.label}</option>);
  }
  return options;
}


export default App
