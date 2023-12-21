import { useState, useEffect } from 'react'
import './App.css';
import { socket } from './socket';
import ProgressBar from "@ramonak/react-progress-bar";



function App() {

  async function getInitialNameState() {
    // Fetch all name mappings from server
    console.log("fetching all names from server");
    const result = await fetch("/allNames").then(async (data) => {
      const json = await data.json();
      console.log("json: ", json);
      const rows = [];
      json.forEach((data) => {
        rows.push(data['p'].split(',').map((element) => {
          return element.replace(/[()"']/g, '');
        }));
      });
      

      let initialState = {};
      for(const row of rows) {
        initialState[parseInt(row[0])] = row[1];
      }

      return initialState;
    });
    console.log(result);
    return result;
  }

  async function getInitialPercentState() {
    console.log("getting initial percent state");
    const result = await fetch("/allPercents");
    const json = await result.json();
    console.log("initial percent state: ", json);
    return json;
  }
  const [idToNameMap, setIdToNameMap] = useState();
  const [idToPercentMap, setIdToPercentMap] = useState();
  
  
  useEffect(() => {
    getInitialNameState().then((result) => {
      setIdToNameMap(result);
    });

    getInitialPercentState().then((result) => {
      setIdToPercentMap(result);
    });
    
    function onUpdate(newMapping) {
      console.log("updating");
      console.log("new mapping:" + JSON.stringify(newMapping));
      setIdToPercentMap((previous) => {
        let result = {...previous, ...newMapping};
        console.log("result: " + result);
        return result});
    }

    socket.on('update', onUpdate);

    return () => {
      socket.off('update', onUpdate);
    }
  }, []);

  
  let options = [];
  if(idToNameMap != undefined && idToNameMap != null) {
    for(const item of Object.keys(idToNameMap)){
      let labelString = item.toString() + ' -- ' + idToNameMap[item];
      options.push({value: item, label: labelString});
    }
  }
  console.log(options);
  
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

function DataEntries({idToPercentMap, idToNameMap, setIdToNameMap}) {
  console.log("rendering DataEntires");
  console.log(idToPercentMap);
  let entries = [];
  if(idToPercentMap != null && idToPercentMap != undefined) {
    for(let id of Object.keys(idToPercentMap).sort((a,b) => {return idToPercentMap[parseInt(a)]-idToPercentMap[parseInt(b)];})){
      id = parseInt(id);
      console.log("id: " + id);
      let name = idToNameMap ? idToNameMap[id] : undefined;
      console.log("name: ", name);
      let percent = idToPercentMap[id];
      if(name === undefined) {
        name = "FoodID#:" + id;
        setIdToNameMap((previous) => ({
          ...previous,
          [id]: name,
        }));
      }
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

function MapEditor({ options, idToNameMap, setIdToNameMap }) {

  const [currentName, setCurrentName] = useState("New Name");

  function handleDropdown(e) {
    let id = e.target.value;
    document.getElementById("nameForm").value = "";
    console.log(idToNameMap[id]);
    setCurrentName(idToNameMap[id]);
  }

  function handleClick(e) {
    let id = document.getElementById("idsDropdown").value;
    let newName = document.getElementById("nameForm").value;
    if(newName !== ''){
      setIdToNameMap((prev) => {return({...prev,
        [id]: newName})});
      setCurrentName(newName);
      document.getElementById("nameForm").value = '';
        console.log("posting id to name mapping to db");
        console.log(id, newName);
      fetch("/nameMapping", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({itemId: id, itemName: newName})
      });
    }
  }

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



function Options({items}) {
  let options = [];
  for(const item of items){
    options.push(<option key={item.value} value={item.value}>{item.label}</option>);
  }
  return options;
}


export default App
