import './App.css';
import './css/main.css'
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainPage from './js/main-page/MainPage';
import LogInPage from './js/sign-in/LogInPage';
import SignUpPage from './js/sign-in/SignUpPage';
import AskQuestion from './js/ask-question-page/AskQuestion';
import AnswerQuestion from './js/answer-question-page/AnswerQuestion';
import QuestionsKeyword from './js/diagrams-pages/QuestionsKeyword';
import QuestionsPeriod from './js/diagrams-pages/QuestionsPeriod';
import Account from './js/account-page/Account';
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
                        <PrivateRoute exact path='/account' component={Account} />
                    </Switch>
              </Router>
            </AuthContext.Provider>
        </>
    );
}

export default App;
