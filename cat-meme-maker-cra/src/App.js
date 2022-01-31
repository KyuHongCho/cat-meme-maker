import logo from './logo.svg';
import React from "react";
import './App.css';
import CatSays from './components/Title (CatSays)';

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
};

const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(
    `${OPEN_API_DOMAIN}/cat/says/${text}?json=true`
  );
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};



const LineForm = ({ updateMainCat }) => {
  {/* Form Validation (폼 검증, error handling):
  create a state that shows an error message when typing in Korean/leave it empty*/ }
  const includesHangeul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
  const [value, setValue] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState(""); {/* "" is for initialising */ }

  function handleInputChange(e) {
    const userValue = e.target.value;

    if (includesHangeul(userValue)) {
      setErrorMessage("You can't type in Korean.");
    } else {
      setErrorMessage(""); {/* initialises the error message once the user erases Korean */ }
    }

    setValue(userValue.toUpperCase()); {/*converts user input to uppercase*/ }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMessage(""); {/* another way of initialising the error message (putting this code 1st) */ }

    if (value === '') {
      setErrorMessage("You can't make a meme with an empty value.");
      return; {/*terminates the execution if value is empty (not to reach updateMainCat)*/ }
    }
    updateMainCat(value);
  }

  return (
    <form onSubmit={handleFormSubmit} >
      <input
        type="text"
        name="name"
        placeholder="Please input a line in English"
        value={value}
        onChange={handleInputChange}
      />
      <button type="submit">Create</button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </form >
  );
};

{/*create a component using normal function*/ }
function CatItem(props) {
  return (
    <li>
      {/*value (e.g. width) of a key (e.g. style) must be a string*/}
      <img src={props.img} style={{ width: "150px", border: "1px solid blue" }} />
    </li>
  );
}

{/*create a component using arrow function WITH applying ES6+ destructuring*/ }
const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  {/*function for showing the message when the user pushes the heart button.
  'handle XXX' is the convention of naming an event-handling function in React*/ }

  const heartIcon = alreadyFavorite ? "💖" : "🤍";

  return (
    <div className="main-card"> {/*In React.js, you have to use 'className' instead of 'class'*/}
      <img src={img} alt="cat" width="400" />
      {/*show the messages when the user clicks/hovers the cursor on the heart button
      NOTE: in React (JSX grammar), onClick must be camel case, unlike CSS (onclick)*/}
      <button
        onClick={onHeartClick}>
        {heartIcon}
      </button>
    </div >
  );
}

function Favorites({ favorites }) {
  //when the user hasn't clicked heart, show the message to recommend (Conditional Rendering)
  if (favorites.length === 0) {
    return <div>Save your own meme by clicking 🤍</div>
  }

  return (
    <ul className="favorites">
      {favorites.map((cat) => (
        <CatItem img={cat} key={cat} />
      ))} {/*map must have key id for each item*/}

    </ul>
  );
}

{/*const App -> parent component, const LineForm -> child component */ }
{/*React.useState, function handleFormSubmit -> state lifted up from child to parent
  to be shared (with this technique, one function can be used multiple times)*/}
const App = () => {
  const CAT1 = "https://cataas.com/cat/60b73094e04e18001194a309/says/react";
  const CAT2 = "https://cataas.com//cat/5e9970351b7a400011744233/says/inflearn";
  const CAT3 = "https://cataas.com/cat/595f280b557291a9750ebf65/says/JavaScript";

  {/*create a system to automatically increse the number of the cat saying*/ }

  //access to local storage API only when the app page initialises -> increases speed -> performance optimisation
  const [counter, setCounter] = React.useState(() => {
    return jsonLocalStorage.getItem('counter');
  });

  const [mainCat, setMainCat] = React.useState(CAT1);
  const [favorites, setFavorites] = React.useState(() => {
    // || [] meaning 'OR empty array' to prevent Uncaught TypeError: Cannot read properties of null (reading 'map') 
    return jsonLocalStorage.getItem("favorites") || []
  });

  //to make the heart red if it has already been clicked
  const alreadyFavorite = favorites.includes(mainCat)

  //replace MainCat's data to API's ones when the user enters the page
  async function setInitialCat() {
    const newCat = await fetchCat('First cat');
    setMainCat(newCat);
  }

  //to prevent callback hell
  React.useEffect(() => {
    setInitialCat();
  }, []); // empty array -> data will only be called when the component is called



  async function updateMainCat(value) {
    const newCat = await fetchCat(value);

    setMainCat(newCat);

    // to prevent the mismatch of counter and setCounter
    setCounter((prev) => {
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter); //store the data to the localStorage API of the browser
      return nextCounter;
    });
  }

  function handleHeartClick() {
    const nextFavorites = [...favorites, mainCat];
    {/*console.log("Heart pushed."); -> Only use it for checking whether it is working*/ }
    setFavorites(nextFavorites); {/*...favorites = [CAT1, CAT2]
                                        from now, setFavorites = [CAT1, CAT2, CAT3] */}
    jsonLocalStorage.setItem("favorites", nextFavorites);
  }

  // When the app initialises, doesn't show the counter to prevent it starts from 0
  const counterTitle = counter === null ? "" : counter;

  return (
    < div >
      < CatSays > The cat {counterTitle} says... </CatSays > {/*Directly uses tag -> 'children' would be used*/}
      < LineForm updateMainCat={updateMainCat} />
      <MainCard img={mainCat} onHeartClick={handleHeartClick} alreadyFavorite={alreadyFavorite} /> {/* 'on'HeartClick -> following convention of naming props */}
      <Favorites favorites={favorites} />
    </div >
  );
};



export default App;
