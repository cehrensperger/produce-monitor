import { useState, useEffect } from 'react'
import './App.css';
import { socket } from './socket';
import ProgressBar from "@ramonak/react-progress-bar";



function App() {

  function getInitialNameState() {
    // Fetch all name mappings from server
    console.log("fetching all names from server");
    fetch("/allNames").then(async (data) => {
      const json = await data.json();
      console.log(json);
    });
  }
  const [idToNameMap, setIdToNameMap] = useState({0:"Bananas", 1:"Onions", 2:"sdfasfdasfasfasdfasdfasdfasdfasdfasdfasdfasdfdasdfasdf", 3:"", 4:""});
  const [idToPercentMap, setIdToPercentMap] = useState({});
  
  
  useEffect(() => {
    getInitialNameState();
    
    function onUpdate(newMapping) {
      console.log("updating");
      console.log("new mapping:" + newMapping);
      setIdToPercentMap((previous) => {
        let result = {...previous, ...newMapping};
        console.log("result: " + result);
        return result});
      console.log(idToPercentMap);
    }

    socket.on('update', onUpdate);

    return () => {
      socket.off('update', onUpdate);
    }
  }, []);

  
  let options = [];
  for(const item of Object.keys(idToNameMap)){
    let labelString = item.toString() + ' -- ' + idToNameMap[item];
    options.push({value: item, label: labelString});
  }
  console.log(options);

  let defaultOption = options[0].value.toString();
  
  return (
    <div className="container">
      <ul className="dataBars" list-style-type="none">
        <DataEntries 
        idToPercentMap={idToPercentMap} 
        idToNameMap={idToNameMap} />
      </ul>
      
      <MapEditor 
      defaultOption={defaultOption} 
      options={options}
      idToNameMap={idToNameMap}
      setIdToNameMap={setIdToNameMap}/>
      
    </div>
  );
}

function DataEntries({idToPercentMap, idToNameMap}) {
  console.log("rendering DataEntires");
  console.log(idToPercentMap);
  let entries = [];
  for(const id of Object.keys(idToPercentMap).sort((a,b) => {return idToPercentMap[a]-idToPercentMap[b];})){
    console.log("id: " + id);
    let name = idToNameMap[id];
    let percent = idToPercentMap[id];
    if(name === undefined) {
      name = "FoodID#:" + id;
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

  return entries;
}

function MapEditor({ defaultOption, options, idToNameMap, setIdToNameMap }) {

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

      // fetch("ip_address somehow/nameMapping", {
      //   method: 'POST',
      //   headers: {
      //       'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({itemId: id, itemName: newName})
      // });
    }
  }

  return(
  <section className="idMapEditor">
      <label>Map Food Item ID Number to a Name</label>
      <label>ID Number</label>
      <select id="idsDropdown" onChange={handleDropdown}>
        <option value="">{defaultOption}</option>
        <Options items={options}/>
      </select>
      <input id="nameForm" type="text" placeholder={currentName}/>
      <button onClick={handleClick}>Submit New Name</button>
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
