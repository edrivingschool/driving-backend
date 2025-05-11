module.exports = () => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'fake_sid' })
    },
    jwt: {
      AccessToken: class {
        constructor(accountSid, apiKey, apiSecret, options) {
          this.identity = options.identity;
          this.ttl = options.ttl;
          this.grants = [];
        }
  
        addGrant(grant) {
          this.grants.push(grant);
        }
  
        toJwt() {
          return 'fake_token';
        }
      },
      VideoGrant: class {
        constructor({ room }) {
          this.room = room;
        }
      }
    }
  });
  