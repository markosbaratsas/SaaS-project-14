import './App.css';
import './css/main.css'
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './js/MainPage';
import SignPage from './js/SignPage';

function App() {
  return (
    <>
      <Router>
        <Switch>
            <Route exact path='/' component={MainPage} />
            <Route exact path='/signin' component={SignPage} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
