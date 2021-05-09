# API documentation

## Description
This markdown file provides documentation regarding the API calls that can be made, in order to access the different **askmeanything2021** servicies.

## Authentication

To make API calls that **require authentication**, you need to fill in the request the following header, with your authentication token:
```json
HTTP_AUTH_HEADERS: AUTH_TOKEN
```

## API Endpoints

### Create question
* URL: `/create-question/`
* Method: `POST`
* Requires Authentication: **YES**
* Data Params: In the body of the POST request, fill in the following fields of the following json:
```json
{
  title: 'Your Title',
  QuestionText: 'Your QuestionText',
  keywords: [
      'Keyword 1',
      'Keyword 2',
      ...,
      'Keyword N'
  ]
}
```

* Success Response: 
    * Code: `200`
    * Content: `{ id: YOUR_QUESTIONS_ID }`

* Error Response: 
    * Code: `400 Bad Request`
    * Content: `{ error: 'Question title should be unique' }`

    OR

    * Code: `401 UNAUTHORIZED`
    * Content: `{ error: 'You need to be authorized to create a new question' }`


* Notes:
Question title should be unique, otherwise a 400 Bad Request.

### Get question and its answers
* URL: `/get-question-and-answers/:id`
* Method: `GET`
* Requires Authentication: **NO**
* URL Params:

    Required:

    `id=[integer]`: Question's id

* Success Response: 
    * Code: `200`
    * Content: 
    ```json
    {
        id: QUESTIONS_ID,
        title: QUESTIONS_TITLE,
        QuestionText: QUESTIONS_TEXT,
        DateAsked: QUESTIONS_DATE,
        UserID: {
            email: USERS_EMAIL
        },
        Answers: [
            ANSWER1,
            ANSWER2,
            ...,
            ANSWERN
        ],
    }
    ```

* Error Response: 
    * Code: `400 Bad Request`
    * Content: `{ error: 'No question with such id' }`

### Answer question
* URL: `/answer-question/`
* Method: `POST`
* Requires Authentication: **YES**
* Data Params: In the body of the POST request, fill in the following fields of the following json:
```json
{
  questionID: 'Question\'s id',
  AnswerText: 'Your AnswerText'
}
```

* Success Response: 
    * Code: `200`
    * Content: `{ id: YOUR_ANSWERS_ID }`

* Error Response: 
    * Code: `400 Bad Request`
    * Content: `{ error: 'Something went wrong...' }`

    OR

    * Code: `401 UNAUTHORIZED`
    * Content: `{ error: 'You need to be authorized to create a new question' }`

### Get questions (based on filters)
* URL: `/get-questions/`
* Method: `POST`
* Requires Authentication: **NO**
* Data Params: In the body of the POST request, fill in the following fields of the following json:
```json
{
  keywords: [
      'keyword 1',
      'keyword 2',
      ...,
      'keyword N'
  ],
  date_from: 'YYYY-MM-DD',
  date_to: 'YYYY-MM-DD',
  from_user: USERS_ID
}
```

* Success Response: 
    * Code: `200`
    * Content: 
    ```json
    {
        questions: [
            {
                id: 'Question 1 id'
                title: 'Question 1 Title'
            },
            {
                id: 'Question 2 id'
                title: 'Question 2 Title'
            },
            ...,
            {
                id: 'Question N id'
                title: 'Question N Title'
            }
        ]
    }
    ```

* Error Response: 
    * Code: `400 Bad Request`
    * Content: `{ error: 'Something went wrong...' }`

### Sign-up

### Sign-in

### Get account info

### Update account info

## Extra API calls:

### Attach keywords to existing question
