import { useState } from 'react'
import './App.css';



function App() {
  console.log("App rendered");
  const [idToNameMap, setIdToNameMap] = useState({0:"Bananas", 1:"Onions", 2:"something else", 3:"", 4:""});
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
        <li key="1"><div className="liDiv">list item 1</div></li>
        <li key="2">list item 2</li>
        <li key="3">list item 3</li>
        <li key="4">list item 4</li>
        <li key="5">list item 5</li>
        <li key="6">list item 6</li>
        <li key="7">list item 7</li>
        
      </ul>
      
      <MapEditor 
      defaultOption={defaultOption} 
      options={options}
      idToNameMap={idToNameMap}
      setIdToNameMap={setIdToNameMap}/>
      
    </div>
  );
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

function DataEntry({name, percent}) {
  return (
  <div>
    <li key="1">name: {<PercentBar />}</li>
  </div>);
}

function PercentBar() {
  return ({

  });
}


function Options({items}) {
  let options = [];
  for(const item of items){
    options.push(<option key={item.value} value={item.value}>{item.label}</option>);
  }
  return options;
}


export default App
