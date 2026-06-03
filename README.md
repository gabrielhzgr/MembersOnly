# MembersOnly
## The Odin Project
Message board in which users can post, they can become members (to see author and date of the messages) or admin (to delete a message) by providing a passcodes in their respective forms. 

Users can authenticate via *passport.js* local strategy. They can sign up and their password is hashed and compared with bcryptjs. Forms are validated with express-validator, including a custom validator for password match during signing up. 

The database used for storing users and messages is Postgresql, using the *pg* package.

 Success and error Flash messages are showed for login, signup, becoming a member and becoming an admin.
