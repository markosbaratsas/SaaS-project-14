import './App.css';
import './css/main.css'
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './js/MainPage';
import LogInPage from './js/signIn/LogInPage';
import SignUpPage from './js/signIn/SignUpPage';
import AskQuestion from './js/AskQuestion';
import AnswerQuestion from './js/AnswerQuestion';
import QuestionsKeyword from './js/QuestionsKeyword';
import QuestionsPeriod from './js/QuestionsPeriod';
import PrivateRoute from './PrivateRoute';
import { AuthContext } from './js/context/auth';

function App() {
    const existingToken = localStorage.getItem("token")
    const [authTokens, setAuthTokens] = useState(existingToken);

    const setToken = (data) => {
        localStorage.setItem("token", JSON.stringify(data));
        setAuthTokens(data);
    }

    return (
        <>
            <AuthContext.Provider value={{ authTokens, setAuthTokens: setToken }}>
              <Router>
                    <Switch>
                        <Route exact path='/' component={MainPage} />
                        <Route exact path='/login' component={LogInPage} />
                        <Route exact path='/signup' component={SignUpPage} />
                        <Route exact path='/keyword' component={QuestionsKeyword} />
                        <Route exact path='/period' component={QuestionsPeriod} />
                        <PrivateRoute exact path='/askquestion' component={AskQuestion} />
                        <Route exact path='/answerquestion' component={AnswerQuestion} />
                    </Switch>
              </Router>
            </AuthContext.Provider>
        </>
    );
}

export default App;
