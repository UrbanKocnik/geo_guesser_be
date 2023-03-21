
Backend of the second project for skill up mentor called geo guesser

ENV: ... -> fill with personal data

In case bucket upload doesn't work: https://medium.com/@shamnad.p.s/how-to-create-an-s3-bucket-and-aws-access-key-id-and-secret-access-key-for-accessing-it-5653b6e54337

1. Take care of database connection in env
2. npm install
3. npm run start:dev
4. In roles table add admin role with id 1 and user role with id 2
5. Add personal bucket for file upload

Swagger: http://localhost:4000/docs

Pagination example is on /api/location/best route
It is designed to "load more" so if you take 3 per page, and select page 2 you will get 6 entries.
The "page" and "take" have default values set based on figma design so query paramaters are optional.



For any other questions contact me
