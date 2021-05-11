import './App.css';
import './css/main.css'
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './js/MainPage';
import LogInPage from './js/LogInPage';
import SignUpPage from './js/SignUpPage';
import AskQuestion from './js/AskQuestion';
import AnswerQuestion from './js/AnswerQuestion';

function App() {
  return (
    <>
      <Router>
        <Switch>
            <Route exact path='/' component={MainPage} />
            <Route exact path='/login' component={LogInPage} />
            <Route exact path='/signup' component={SignUpPage} />
            <Route exact path='/askquestion' component={AskQuestion} />
            <Route exact path='/answerquestion' component={AnswerQuestion} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
