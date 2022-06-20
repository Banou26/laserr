## To generate anilist typings

`package.json`
``json
{
  "name": "generate-anilist-types",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "generate-types": "apollo schema:download --endpoint=https://graphql.anilist.co/ schema.gql && npx graphql-json-to-sdl ./schema.json ./schema.gql"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "apollo": "2.33.4",
    "apollo-codegen-core": "0.40.3",
    "apollo-language-server": "1.26.3"
  }
}
```

`run npm i && npm run generate-types`
