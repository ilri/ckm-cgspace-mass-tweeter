module.exports = {
  servers: {
    one: {
      host: '172.27.1.33',
      username: 'ttadesse',
      password: 'tempo34',
      // pem: './mykey',
    },
  },

  meteor: {
    name: 'CGSTweets',
    path: '../',
    servers: {
      one: {},
    },
    env: {
      PORT: 3000,
      ROOT_URL: 'http://172.27.1.33:3000',
      MONGO_URL: 'mongodb://localhost/meteor'
    },
    nodeVersion: "0.10.43",
    deployCheckWaitTime: 120
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
